"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import VectorField from "./vector-field";

export default function VectorClusters() {
	return (
		<div className="w-full h-full absolute inset-0">
			<Canvas
				camera={{ position: [0, 0, 18], fov: 60 }}
				gl={{ antialias: true, alpha: true }}
				style={{ background: "transparent" }}
			>
				<Environment preset="night" />
				<VectorField />
			</Canvas>
		</div>
	);
}
