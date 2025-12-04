"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
	ScrollAssemble,
	StaggerChildren,
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

export default function ProductsSection() {
	return (
		<section className="relative py-32 px-6 bg-[#030303] overflow-hidden">
			{/* Aurora background for this section */}
			<div className="absolute inset-0 opacity-30">
				<AuroraWaves speed={0.5} glow={20} />
			</div>
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"linear-gradient(180deg, rgba(3,3,3,1) 0%, transparent 15%, transparent 85%, rgba(3,3,3,1) 100%)",
				}}
			/>

			<div className="relative z-10 mx-auto max-w-7xl">
				{/* Section header with scroll assembly */}
				<ScrollAssemble direction="up" delay={0}>
					<span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
						— Products
					</span>
				</ScrollAssemble>

				<ScrollAssemble direction="up" delay={0.1}>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-20">
						AI for all teams
					</h2>
				</ScrollAssemble>

				{/* Product cards with stagger animation */}
				<StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
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
		</section>
	);
}
