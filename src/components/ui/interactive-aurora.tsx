"use client";

import { cn } from "@/lib/shared/utils";
import React, { useEffect, useRef, useState } from "react";

interface InteractiveAuroraProps {
	className?: string;
}

export const InteractiveAurora = ({ className }: InteractiveAuroraProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const x = (e.clientX / window.innerWidth) * 100;
			const y = (e.clientY / window.innerHeight) * 100;
			setMousePosition({ x, y });
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}
		>
			{/* Base dark gradient */}
			<div className="absolute inset-0 bg-[#030303]" />

			{/* Primary aurora blob - follows mouse */}
			<div
				className="absolute w-[120vw] h-[120vh] -top-[20%] -left-[10%] opacity-70"
				style={{
					background: `radial-gradient(ellipse 50% 40% at ${mousePosition.x}% ${mousePosition.y}%, 
						rgba(74, 222, 128, 0.5) 0%, 
						rgba(34, 197, 94, 0.4) 20%, 
						rgba(16, 185, 129, 0.3) 40%, 
						transparent 70%)`,
					transition: "background 0.15s ease-out",
					filter: "blur(40px)",
				}}
			/>

			{/* Secondary aurora blob - inverse mouse */}
			<div
				className="absolute w-[100vw] h-[100vh] -top-[10%] -right-[10%] opacity-60"
				style={{
					background: `radial-gradient(ellipse 60% 50% at ${100 - mousePosition.x}% ${mousePosition.y * 0.8}%, 
						rgba(163, 230, 53, 0.5) 0%, 
						rgba(132, 204, 22, 0.4) 25%, 
						rgba(52, 211, 153, 0.25) 50%, 
						transparent 70%)`,
					transition: "background 0.2s ease-out",
					filter: "blur(60px)",
				}}
			/>

			{/* Tertiary aurora - slower follow */}
			<div
				className="absolute w-[80vw] h-[80vh] top-[10%] left-[10%] opacity-50"
				style={{
					background: `radial-gradient(ellipse 70% 45% at ${mousePosition.x * 0.7 + 15}% ${mousePosition.y * 0.6 + 20}%, 
						rgba(52, 211, 153, 0.6) 0%, 
						rgba(16, 185, 129, 0.4) 30%, 
						rgba(5, 150, 105, 0.2) 60%, 
						transparent 80%)`,
					transition: "background 0.3s ease-out",
					filter: "blur(80px)",
				}}
			/>

			{/* Accent glow at cursor */}
			<div
				className="absolute w-[40vw] h-[40vh] opacity-80"
				style={{
					left: `${mousePosition.x}%`,
					top: `${mousePosition.y}%`,
					transform: "translate(-50%, -50%)",
					background: `radial-gradient(circle at center, 
						rgba(190, 242, 100, 0.4) 0%, 
						rgba(163, 230, 53, 0.3) 20%, 
						rgba(74, 222, 128, 0.15) 40%, 
						transparent 60%)`,
					transition: "left 0.1s ease-out, top 0.1s ease-out",
					filter: "blur(50px)",
				}}
			/>

			{/* Animated flowing aurora waves */}
			<div className="absolute inset-0 overflow-hidden">
				<div
					className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-aurora-flow opacity-40"
					style={{
						background: `
							conic-gradient(from 0deg at 50% 50%, 
								transparent 0deg, 
								rgba(74, 222, 128, 0.3) 60deg, 
								rgba(163, 230, 53, 0.4) 120deg, 
								rgba(52, 211, 153, 0.3) 180deg, 
								rgba(34, 197, 94, 0.35) 240deg, 
								rgba(132, 204, 22, 0.3) 300deg, 
								transparent 360deg)
						`,
						filter: "blur(100px)",
					}}
				/>
			</div>

			{/* Top edge glow */}
			<div
				className="absolute top-0 left-0 right-0 h-[50vh] opacity-60"
				style={{
					background: `linear-gradient(180deg, 
						rgba(74, 222, 128, 0.25) 0%, 
						rgba(34, 197, 94, 0.15) 30%, 
						transparent 100%)`,
					filter: "blur(30px)",
				}}
			/>

			{/* Subtle noise texture */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>
		</div>
	);
};
