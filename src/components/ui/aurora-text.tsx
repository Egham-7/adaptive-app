"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/shared/utils";

interface AuroraTextProps {
	text: string;
	className?: string;
	glowIntensity?: number;
}

export const AuroraText = ({ text, className, glowIntensity = 1 }: AuroraTextProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 1.2, ease: "easeOut" }}
			className={cn("relative", className)}
		>
			{/* Glow layer behind text */}
			<div
				className="absolute inset-0 blur-3xl"
				style={{
					background: `linear-gradient(90deg, 
						rgba(163,230,53,${0.4 * glowIntensity}) 0%, 
						rgba(52,211,153,${0.5 * glowIntensity}) 50%, 
						rgba(16,185,129,${0.4 * glowIntensity}) 100%
					)`,
					transform: "translateY(20%) scale(1.2)",
				}}
			/>
			
			{/* Main text with gradient */}
			<h1
				className={cn(
					"relative font-bold tracking-tight",
					"bg-gradient-to-r from-[#a3e635] via-[#34d399] to-[#10b981]",
					"bg-clip-text text-transparent",
					"drop-shadow-[0_0_80px_rgba(163,230,53,0.5)]"
				)}
				style={{
					textShadow: `
						0 0 40px rgba(163,230,53,${0.3 * glowIntensity}),
						0 0 80px rgba(52,211,153,${0.2 * glowIntensity}),
						0 0 120px rgba(16,185,129,${0.1 * glowIntensity})
					`,
				}}
			>
				{text}
			</h1>
			
			{/* Subtle highlight line */}
			<motion.div
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
				className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34d399]/50 to-transparent"
			/>
		</motion.div>
	);
};
