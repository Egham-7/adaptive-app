"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IosButton } from "@/components/ui/ios-button";
import dynamic from "next/dynamic";
import { ScrollAssemble, ScrollProgressBuild } from "@/components/ui/scroll-assemble";

const AuroraFlow = dynamic(() => import("@/components/ui/aurora-flow"), {
	ssr: false,
});

export default function CtaSection() {
	return (
		<section className="relative py-32 px-6 bg-[#030303] overflow-hidden">
			{/* Aurora Flow background */}
			<div className="absolute inset-0 opacity-40">
				<AuroraFlow />
			</div>
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"radial-gradient(ellipse at center, transparent 30%, rgba(3,3,3,0.9) 80%)",
				}}
			/>

			<div className="relative z-10 max-w-4xl mx-auto text-center">
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
		</section>
	);
}
