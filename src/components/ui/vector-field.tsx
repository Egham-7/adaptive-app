"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import Vector from "./vector";

// Generate random vectors in 3D space - spread out more
const generateVectors = (count: number) => {
	const vectors = [];
	const clusters = 4; // Four clusters for better spread

	for (let i = 0; i < count; i++) {
		// Determine which cluster this vector belongs to
		const clusterIndex = Math.floor(Math.random() * clusters);
		const clusterAngle = (clusterIndex / clusters) * Math.PI * 2;

		// Spherical coordinates for more natural distribution
		const phi = Math.random() * Math.PI * 2;
		const theta = Math.random() * Math.PI;
		const radius = 6 + Math.random() * 12; // Larger radius for bigger spread

		// Add cluster bias
		const x = radius * Math.sin(theta) * Math.cos(phi + clusterAngle);
		const y = radius * Math.sin(theta) * Math.sin(phi + clusterAngle);
		const z = radius * Math.cos(theta);

		// Some vectors are interactive, some are not
		const interactive = Math.random() > 0.4;

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
				? messages[Math.floor(Math.random() * messages.length)]
				: "",
		});
	}

	return vectors;
};

export default function VectorField() {
	const groupRef = useRef<Group>(null);
	const [hoveredId, setHoveredId] = useState<number | null>(null);

	// Generate vectors once - more vectors for denser field
	const vectors = useMemo(() => generateVectors(80), []);

	// Rotate on Y-axis only - slower for more elegant feel
	useFrame((state, delta) => {
		if (groupRef.current) {
			// Slow down rotation when hovering, anti-clockwise direction (negative)
			const rotationSpeed = hoveredId !== null ? 0.02 : 0.05;
			groupRef.current.rotation.y -= delta * rotationSpeed;
		}
	});

	const handlePointerEnter = (
		id: number,
		message: string,
		position: [number, number, number],
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
