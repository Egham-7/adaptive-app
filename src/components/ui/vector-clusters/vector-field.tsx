"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import Vector from "./vector";

// Generate random vectors in 3D space
const generateVectors = (count: number) => {
	const vectors = [];
	const clusters = 3;

	for (let i = 0; i < count; i++) {
		const clusterIndex = Math.floor(Math.random() * clusters);
		const clusterAngle = (clusterIndex / clusters) * Math.PI * 2;

		const phi = Math.random() * Math.PI * 2;
		const theta = Math.random() * Math.PI;
		const radius = 4 + Math.random() * 6;

		const x = radius * Math.sin(theta) * Math.cos(phi + clusterAngle);
		const y = radius * Math.sin(theta) * Math.sin(phi + clusterAngle);
		const z = radius * Math.cos(theta);

		const interactive = Math.random() > 0.3;

		const messages = [
			"OpeAI Gpt-5.1",
			"Claude Opus 4.5",
			"Gemini Pro 3",
			"Qwen 7B",
			"Gemma 3.5",
			"LLaMA 3",
			"Mistral",
			"PaLM 3",
			"DeepSeek",
			"Grok",
		];

		vectors.push({
			id: i,
			position: [x, y, z] as [number, number, number],
			interactive,
			message: interactive
				? (messages[Math.floor(Math.random() * messages.length)] ?? "")
				: "",
		});
	}

	return vectors;
};

export default function VectorField() {
	const groupRef = useRef<Group>(null);
	const [hoveredId, setHoveredId] = useState<number | null>(null);

	const vectors = useMemo(() => generateVectors(60), []);

	// Use a ref to track target speed for smooth interpolation
	const currentSpeed = useRef(0.08);
	
	useFrame((state, delta) => {
		if (groupRef.current) {
			const targetSpeed = hoveredId !== null ? 0.02 : 0.08;
			// Immediately snap to slower speed on hover, smoothly accelerate back
			if (hoveredId !== null) {
				currentSpeed.current = targetSpeed;
			} else {
				currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.05;
			}
			groupRef.current.rotation.y -= delta * currentSpeed.current;
		}
	});

	const handlePointerEnter = (
		id: number,
		message: string,
		position: [number, number, number]
	) => {
		setHoveredId(id);
	};

	const handlePointerLeave = () => {
		setHoveredId(null);
	};

	return (
		<group ref={groupRef}>
			{vectors.map((vector) => (
				<Vector
					key={vector.id}
					id={vector.id}
					position={vector.position}
					interactive={vector.interactive}
					message={vector.message}
					isHovered={hoveredId === vector.id}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={handlePointerLeave}
				/>
			))}
		</group>
	);
}
