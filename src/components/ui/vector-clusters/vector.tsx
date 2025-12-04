"use client";

import { useRef } from "react";
import type { Mesh } from "three";
import { Html, Line } from "@react-three/drei";

interface VectorProps {
	id: number;
	position: [number, number, number];
	interactive: boolean;
	message: string;
	isHovered: boolean;
	onPointerEnter: (
		id: number,
		message: string,
		position: [number, number, number]
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

	// Calculate tooltip position (above the cube)
	const tooltipPosition: [number, number, number] = [
		position[0],
		position[1] + 0.5,
		position[2],
	];

	return (
		<group>
			{/* Line from center to endpoint */}
			<Line
				points={[[0, 0, 0], position]}
				color={interactive ? "#404040" : "#252525"}
				opacity={interactive ? 0.6 : 0.3}
				transparent
				lineWidth={1}
			/>

			{/* Invisible larger hitbox sphere for easier interaction */}
			{interactive && (
				<mesh
					position={position}
					renderOrder={-1}
					onPointerEnter={(e) => {
						e.stopPropagation();
						onPointerEnter(id, message, position);
						document.body.style.cursor = "pointer";
					}}
					onPointerLeave={(e) => {
						e.stopPropagation();
						onPointerLeave();
						document.body.style.cursor = "default";
					}}
				>
					<sphereGeometry args={[0.4, 16, 16]} />
					<meshBasicMaterial transparent opacity={0} depthWrite={false} />
				</mesh>
			)}

			{/* Endpoint cube - emerald green for interactive, scales up on hover */}
			<mesh
				ref={meshRef}
				position={position}
				scale={isHovered ? 1.8 : 1}
			>
				<boxGeometry args={[0.15, 0.15, 0.15]} />
				<meshBasicMaterial
					color={interactive ? (isHovered ? "#a3e635" : "#34d399") : "#404040"}
					opacity={interactive ? (isHovered ? 1 : 0.85) : 0.25}
					transparent
				/>
			</mesh>

			{/* Tooltip - pill container above cube with white text */}
			{isHovered && interactive && message && (
				<Html position={tooltipPosition} center distanceFactor={8}>
					<div 
						className="px-4 py-2 rounded-full whitespace-nowrap pointer-events-none"
						style={{ 
							background: 'rgba(0, 0, 0, 0.8)',
							border: '1px solid rgba(255, 255, 255, 0.15)',
							backdropFilter: 'blur(8px)',
						}}
					>
						<span 
							className="text-base font-medium"
							style={{ 
								color: '#ffffff',
								fontFamily: 'system-ui, -apple-system, sans-serif'
							}}
						>
							{message}
						</span>
					</div>
				</Html>
			)}
		</group>
	);
}
