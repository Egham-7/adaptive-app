"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
	ScrollAssemble,
	StaggerChildren,
	staggerItemVariants,
} from "@/components/ui/scroll-assemble";

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

export default function NewsSection() {
	return (
		<section className="relative py-32 px-6 bg-[#030303]">
			<div className="max-w-7xl mx-auto">
				{/* Section header with scroll assembly */}
				<ScrollAssemble direction="up" className="flex items-center justify-between mb-16">
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
				<StaggerChildren className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
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
		</section>
	);
}
