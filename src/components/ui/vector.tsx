"use client";

import { useRef } from "react";
import { type Mesh, Vector3 } from "three";
import { Html } from "@react-three/drei";

interface VectorProps {
	id: number;
	position: [number, number, number];
	interactive: boolean;
	message: string;
	isHovered: boolean;
	onPointerEnter: (
		id: number,
		message: string,
		position: [number, number, number],
	) => void;
	onPointerLeave: () => void;
}

export default function Vector({
	id,
	position,
	interactive,
	message,
	isHovered,
	onPointerEnter,
	onPointerLeave,
}: VectorProps) {
	const meshRef = useRef<Mesh>(null);

	const endPoint = new Vector3(...position);
	const origin = new Vector3(0, 0, 0);
	const direction = endPoint.clone().sub(origin);

	return (
		<group>
			{/* Line from center to endpoint */}
			<line>
				<bufferGeometry>
					<bufferAttribute
						attach="attributes-position"
						count={2}
						array={new Float32Array([0, 0, 0, ...position])}
						itemSize={3}
					/>
				</bufferGeometry>
				<lineBasicMaterial
					color={interactive ? "#4a4a4a" : "#2a2a2a"}
					opacity={interactive ? 0.7 : 0.4}
					transparent
				/>
			</line>

			{/* Endpoint cube - smaller size */}
			<mesh
				ref={meshRef}
				position={position}
				onPointerEnter={(e) => {
					if (interactive) {
						e.stopPropagation();
						onPointerEnter(id, message, position);
						document.body.style.cursor = "pointer";
					}
				}}
				onPointerLeave={(e) => {
					if (interactive) {
						e.stopPropagation();
						onPointerLeave();
						document.body.style.cursor = "default";
					}
				}}
			>
				<boxGeometry args={[0.12, 0.12, 0.12]} />
				<meshBasicMaterial
					color={interactive ? (isHovered ? "#60a5fa" : "#8899aa") : "#505050"}
					opacity={interactive ? (isHovered ? 1 : 0.9) : 0.4}
					transparent
				/>
			</mesh>

			{/* Tooltip */}
			{isHovered && interactive && message && (
				<Html position={position} center distanceFactor={10}>
					<div className="bg-gray-900/95 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap pointer-events-none backdrop-blur-sm border border-gray-700">
						{message}
					</div>
				</Html>
			)}
		</group>
	);
}
