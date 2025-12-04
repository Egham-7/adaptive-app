"use client";

import { ArrowRight, Send } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/shared/utils";
import dynamic from "next/dynamic";

// Dynamically import WebGL component to avoid SSR issues
const AuroraWaves = dynamic(() => import("@/components/ui/aurora-waves"), {
	ssr: false,
});

export default function HeroSection() {
	const [inputValue, setInputValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	return (
		<section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030303]">
			{/* WebGL Aurora Background - Only in Hero */}
			<div className="absolute inset-0 z-0">
				<AuroraWaves speed={0.8} glow={12} />
			</div>

			{/* Vignette overlay */}
			<div
				className="absolute inset-0 pointer-events-none z-[1]"
				style={{
					background:
						"radial-gradient(ellipse at center, transparent 20%, rgba(3,3,3,0.6) 70%, rgba(3,3,3,0.95) 100%)",
				}}
			/>

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6">
				{/* Announcement badge */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="mb-6 md:mb-8"
				>
					<Link
						href="/sign-in?redirect_url=/api-platform/orgs"
						className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-white/70 transition-all duration-300 hover:bg-white/10 hover:border-[#34d399]/30"
					>
						<span className="text-[#a3e635]">✨</span>
						<span className="hidden sm:inline">Now routing GPT-5, Claude 4.5 Sonnet, Gemini 2.5 Pro</span>
						<span className="sm:hidden">GPT-5, Claude 4.5, Gemini 2.5</span>
						<ArrowRight className="size-3 text-white/50 group-hover:text-[#34d399] transition-colors" />
					</Link>
				</motion.div>

				{/* Main Aurora title - blending with effect like Grok */}
				<motion.h1
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 1.2, ease: "easeOut" }}
					className="relative text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[14rem] font-light tracking-tighter leading-none select-none"
				>
					{/* Glow layers behind text */}
					<span
						className="absolute inset-0 blur-3xl opacity-40"
						style={{
							background:
								"linear-gradient(135deg, #a3e635 0%, #34d399 50%, #10b981 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						Aurora
					</span>
					<span
						className="absolute inset-0 blur-xl opacity-60"
						style={{
							background:
								"linear-gradient(135deg, #a3e635 0%, #34d399 50%, #10b981 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						Aurora
					</span>

					{/* Main text with gradient */}
					<span
						className="relative"
						style={{
							background:
								"linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, rgba(163,230,53,0.8) 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							textShadow: "0 0 80px rgba(163,230,53,0.4)",
						}}
					>
						Aurora
					</span>
				</motion.h1>

				{/* Chat input - Grok style */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					className="w-full max-w-2xl mt-8 md:mt-12 px-2"
				>
					<div
						className={cn(
							"relative rounded-2xl border backdrop-blur-sm transition-all duration-300",
							isFocused
								? "border-[#34d399]/50 bg-black/50 shadow-[0_0_30px_rgba(52,211,153,0.15)]"
								: "border-white/10 bg-black/30"
						)}
					>
						<input
							type="text"
							placeholder="What do you want to know?"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							className="w-full bg-transparent px-4 py-4 md:px-6 md:py-5 text-white placeholder:text-white/40 focus:outline-none text-base md:text-lg"
						/>
						<button
							type="button"
							className={cn(
								"absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 md:p-2.5 rounded-full transition-all duration-300",
								inputValue
									? "bg-[#34d399] text-black hover:bg-[#a3e635]"
									: "bg-white/10 text-white/50"
							)}
						>
							<Send className="size-4 md:size-5" />
						</button>
					</div>
				</motion.div>
			</div>

			{/* Scroll indicator - hidden on mobile */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 1.2 }}
				className="absolute bottom-12 left-8 z-10 hidden md:block"
			>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					className="text-white/30"
				>
					<svg width="20" height="30" viewBox="0 0 20 30" fill="none">
						<rect
							x="1"
							y="1"
							width="18"
							height="28"
							rx="9"
							stroke="currentColor"
							strokeWidth="1"
						/>
						<motion.circle
							cx="10"
							cy="10"
							r="3"
							fill="currentColor"
							animate={{ y: [0, 10, 0] }}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					</svg>
				</motion.div>
			</motion.div>

			{/* Announcement text - hidden on mobile */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.8, delay: 0.8 }}
				className="absolute bottom-12 right-8 max-w-md text-right z-10 hidden md:block"
			>
				<p className="text-sm text-white/50 leading-relaxed mb-4">
					Aurora goes Global: Announcing Our Unified AI Gateway
				</p>
				<Link
					href="/api-platform"
					className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm px-5 py-2.5 text-sm text-white/80 transition-all hover:bg-white/10 hover:border-white/30 uppercase tracking-wider"
				>
					Read Announcement
				</Link>
			</motion.div>

			{/* Bottom separator line - gradient fade */}
			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
		</section>
	);
}
