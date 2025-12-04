"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import { ScrollProgressBuild } from "@/components/ui/scroll-assemble";

// Dynamically import VectorClusters to avoid SSR issues with Three.js
const VectorClusters = dynamic(
	() => import("@/components/ui/vector-clusters"),
	{ ssr: false }
);

// Pre-generated stable particle positions to avoid hydration mismatch
const PARTICLES = [
	{ left: 12, top: 45, opacity: 0.15, duration: 3.5, delay: 0.2 },
	{ left: 28, top: 72, opacity: 0.22, duration: 4.1, delay: 1.1 },
	{ left: 45, top: 18, opacity: 0.18, duration: 3.8, delay: 0.5 },
	{ left: 67, top: 88, opacity: 0.25, duration: 4.5, delay: 1.8 },
	{ left: 83, top: 35, opacity: 0.12, duration: 3.2, delay: 0.8 },
	{ left: 5, top: 62, opacity: 0.28, duration: 4.8, delay: 0.3 },
	{ left: 92, top: 55, opacity: 0.16, duration: 3.6, delay: 1.4 },
	{ left: 38, top: 92, opacity: 0.21, duration: 4.2, delay: 0.9 },
	{ left: 55, top: 8, opacity: 0.19, duration: 3.9, delay: 1.6 },
	{ left: 72, top: 42, opacity: 0.24, duration: 4.4, delay: 0.1 },
	{ left: 18, top: 78, opacity: 0.14, duration: 3.3, delay: 1.2 },
	{ left: 88, top: 22, opacity: 0.27, duration: 4.7, delay: 0.6 },
	{ left: 32, top: 58, opacity: 0.17, duration: 3.7, delay: 1.9 },
	{ left: 62, top: 82, opacity: 0.23, duration: 4.3, delay: 0.4 },
	{ left: 8, top: 28, opacity: 0.13, duration: 3.1, delay: 1.5 },
	{ left: 78, top: 68, opacity: 0.26, duration: 4.6, delay: 0.7 },
	{ left: 48, top: 38, opacity: 0.20, duration: 4.0, delay: 1.3 },
	{ left: 95, top: 85, opacity: 0.11, duration: 2.9, delay: 1.0 },
	{ left: 22, top: 15, opacity: 0.29, duration: 4.9, delay: 0.0 },
	{ left: 58, top: 52, opacity: 0.15, duration: 3.4, delay: 1.7 },
];

export default function UniverseSection() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

	return (
		<section
			ref={containerRef}
			className="relative min-h-[120vh] flex items-center justify-center py-32 bg-[#030303] overflow-hidden"
		>
			{/* 3D Vector Clusters Background */}
			<motion.div
				className="absolute inset-0"
				style={{ opacity }}
			>
				<VectorClusters />
			</motion.div>

			{/* Subtle particle overlay - using stable pre-generated values */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{PARTICLES.map((particle, i) => (
					<motion.div
						key={`star-${i}`}
						className="absolute w-px h-px bg-white rounded-full"
						style={{
							left: `${particle.left}%`,
							top: `${particle.top}%`,
							opacity: particle.opacity,
						}}
						animate={{
							opacity: [0.05, 0.3, 0.05],
							scale: [1, 1.5, 1],
						}}
						transition={{
							duration: particle.duration,
							repeat: Number.POSITIVE_INFINITY,
							delay: particle.delay,
						}}
					/>
				))}
			</div>

			{/* Text content - split on both sides */}
			<div className="relative z-10 w-full h-full pointer-events-none">
				{/* Left side - "Understand" */}
				<div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2">
					<ScrollProgressBuild>
						<h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter">
							<span
								style={{
									background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								Understand
							</span>
						</h2>
					</ScrollProgressBuild>
				</div>

				{/* Right side - "The Models" */}
				<div className="absolute right-8 md:right-16 lg:right-24 top-1/2 translate-y-8 md:translate-y-12">
					<ScrollProgressBuild>
						<h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-right">
							<span
								style={{
									background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								The{" "}
							</span>
							<span className="bg-gradient-to-r from-[#a3e635] via-[#34d399] to-[#10b981] bg-clip-text text-transparent">
								Models
							</span>
						</h2>
					</ScrollProgressBuild>
				</div>
			</div>
		</section>
	);
}
