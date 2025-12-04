"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { IosButton } from "@/components/ui/ios-button";
import {
	ScrollAssemble,
	StaggerChildren,
	ScrollProgressBuild,
	staggerItemVariants,
} from "@/components/ui/scroll-assemble";

const AuroraWaves = dynamic(() => import("@/components/ui/aurora-waves"), {
	ssr: false,
});

const products = [
	{
		title: "Aurora Router",
		description:
			"Route AI traffic to the best model automatically. Benchmarks every provider against your prompts and optimizes for cost, quality, or speed.",
		image: "/hero-dark.png",
		href: "/api-platform/orgs",
		cta: "Use Now",
	},
	{
		title: "API",
		description:
			"OpenAI-compatible endpoints that work with your existing code. Drop-in replacement with automatic model selection and fallbacks.",
		image: "/hero-dark.png",
		href: "https://docs.llmadaptive.uk/",
		cta: "Build Now",
	},
	{
		title: "Developer Docs",
		description:
			"Learn how to quickly make Aurora the heart of your applications with step-by-step guides covering common use cases.",
		image: "/hero-dark.png",
		href: "https://docs.llmadaptive.uk/",
		cta: "Learn More",
	},
];

const newsItems = [
	{
		date: "December 2025",
		category: "Product",
		title: "Introducing Aurora: Unified AI Model Access",
		description:
			"Access GPT-4, Claude, Gemini, and more through a single intelligent routing layer.",
	},
	{
		date: "December 2025",
		category: "Integration",
		title: "OpenAI-Compatible API Gateway",
		description:
			"Drop-in replacement for OpenAI SDK. Switch providers without changing a line of code.",
	},
	{
		date: "December 2025",
		category: "Enterprise",
		title: "Enterprise-Grade Security & Compliance",
		description:
			"SOC 2 compliant infrastructure with end-to-end encryption and audit logging.",
	},
];

export default function UnifiedSection() {
	return (
		<section id="features" className="relative bg-[#030303] overflow-hidden">
			{/* Single continuous aurora background for the entire section */}
			<div className="absolute inset-0 opacity-40">
				<AuroraWaves speed={0.5} glow={25} />
			</div>
			{/* Top fade gradient */}
			<div
				className="absolute inset-x-0 top-0 h-32 pointer-events-none z-10"
				style={{
					background:
						"linear-gradient(180deg, rgba(3,3,3,1) 0%, transparent 100%)",
				}}
			/>
			{/* Bottom fade gradient */}
			<div
				className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
				style={{
					background:
						"linear-gradient(0deg, rgba(3,3,3,1) 0%, transparent 100%)",
				}}
			/>

			{/* ===== PRODUCTS SECTION ===== */}
			<div className="relative z-20 py-32 px-6">
				<div className="mx-auto max-w-7xl">
					{/* Section header with aurora background */}
					<div className="relative mb-20">
						{/* Aurora glow behind title */}
						<div className="absolute -inset-20 flex items-center justify-center pointer-events-none">
							<div
								className="w-[500px] h-[200px] rounded-full blur-[100px] opacity-30"
								style={{
									background:
										"radial-gradient(ellipse, rgba(163,230,53,0.6) 0%, rgba(52,211,153,0.4) 40%, transparent 70%)",
								}}
							/>
						</div>

						<ScrollAssemble direction="up" delay={0}>
							<span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
								— Products
							</span>
						</ScrollAssemble>

						<ScrollAssemble direction="up" delay={0.1}>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white relative">
								AI for all teams
							</h2>
						</ScrollAssemble>
					</div>

					{/* Product cards with stagger animation */}
					<StaggerChildren
						className="grid md:grid-cols-3 gap-6"
						staggerDelay={0.15}
					>
						{products.map((product) => (
							<motion.div
								key={product.title}
								variants={staggerItemVariants}
								className="group relative"
							>
								<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:border-[#34d399]/30 hover:bg-black/60">
									{/* Card image */}
									<div className="relative h-48 overflow-hidden">
										<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] z-10" />
										<Image
											src={product.image}
											alt={product.title}
											fill
											className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
										/>
										{/* Aurora glow on hover */}
										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#a3e635]/10 via-transparent to-[#34d399]/10" />
									</div>

									{/* Card content */}
									<div className="p-6">
										<h3 className="text-xl font-medium text-white mb-3">
											{product.title}
										</h3>
										<p className="text-sm text-white/50 leading-relaxed mb-6">
											{product.description}
										</p>
										<Link
											href={product.href}
											className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#34d399] transition-colors"
										>
											{product.cta}
											<ArrowRight className="size-4" />
										</Link>
									</div>
								</div>
							</motion.div>
						))}
					</StaggerChildren>
				</div>
			</div>

			{/* ===== NEWS SECTION ===== */}
			<div id="solution" className="relative z-20 py-32 px-6">
				<div className="max-w-7xl mx-auto">
					{/* Section header with scroll assembly */}
					<ScrollAssemble
						direction="up"
						className="flex items-center justify-between mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-light text-white">
							Latest Updates
						</h2>
						<Link
							href="/blog"
							className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
						>
							View all
							<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</Link>
					</ScrollAssemble>

					{/* News grid with stagger animation */}
					<StaggerChildren
						className="grid md:grid-cols-3 gap-8"
						staggerDelay={0.15}
					>
						{newsItems.map((item) => (
							<motion.article
								key={item.title}
								variants={staggerItemVariants}
								className="group relative"
							>
								{/* Glow effect on hover */}
								<div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#a3e635]/20 via-[#34d399]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

								<div className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] transition-colors h-full">
									{/* Meta info */}
									<div className="flex items-center gap-3 mb-4">
										<span className="text-xs text-white/30">{item.date}</span>
										<span className="w-1 h-1 rounded-full bg-white/20" />
										<span className="text-xs text-[#a3e635]/70">
											{item.category}
										</span>
									</div>

									{/* Title */}
									<h3 className="text-lg font-light text-white mb-3 group-hover:text-[#a3e635] transition-colors">
										{item.title}
									</h3>

									{/* Description */}
									<p className="text-sm text-white/40 leading-relaxed">
										{item.description}
									</p>

									{/* Read more link */}
									<div className="mt-6 pt-4 border-t border-white/[0.05]">
										<Link
											href="/blog"
											className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#a3e635] transition-colors"
										>
											Read more
											<ChevronRight className="w-3 h-3" />
										</Link>
									</div>
								</div>
							</motion.article>
						))}
					</StaggerChildren>
				</div>
			</div>

			{/* ===== CTA SECTION ===== */}
			<div id="pricing" className="relative z-20 py-32 px-6">
				<div className="max-w-4xl mx-auto text-center">
					{/* Main CTA content with scroll assembly */}
					<ScrollProgressBuild className="space-y-6">
						<h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white">
							Ready to feel the{" "}
							<span className="bg-gradient-to-r from-[#a3e635] via-[#34d399] to-[#10b981] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]">
								Aurora
							</span>{" "}
							Effect?
						</h2>

						<p className="text-lg md:text-xl text-white/40 font-light max-w-2xl mx-auto">
							Start routing to any AI model in minutes. No contracts, no
							commitments.
						</p>
					</ScrollProgressBuild>

					{/* CTA buttons */}
					<ScrollAssemble direction="up" delay={0.2}>
						<div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link href="/sign-up">
								<IosButton className="px-8 py-4">
									<span className="bg-gradient-to-r from-[#a3e635] via-[#34d399] to-[#10b981] bg-clip-text text-transparent">
										Get Started Free
									</span>
								</IosButton>
							</Link>
							<Link href="/api-platform">
								<IosButton variant="bordered" className="px-8 py-4">
									View Documentation
								</IosButton>
							</Link>
						</div>
					</ScrollAssemble>

					{/* Trust indicators */}
					<ScrollAssemble direction="fade" delay={0.4}>
						<div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-white/30">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-[#a3e635]/50" />
								<span>99.9% Uptime SLA</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-[#34d399]/50" />
								<span>SOC 2 Compliant</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-[#10b981]/50" />
								<span>24/7 Support</span>
							</div>
						</div>
					</ScrollAssemble>
				</div>
			</div>
		</section>
	);
}
