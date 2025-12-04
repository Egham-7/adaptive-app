"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import VectorField from "./vector-field";

export default function VectorClusters() {
	return (
		<div className="absolute inset-0 w-full h-full">
			<Canvas
				camera={{ position: [0, 0, 28], fov: 55 }}
				gl={{ antialias: true, alpha: true }}
				style={{ background: "transparent" }}
			>
				<Environment preset="night" />
				<ambientLight intensity={0.3} />
				<VectorField />
			</Canvas>
		</div>
	);
}
