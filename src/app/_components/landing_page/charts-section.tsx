"use client";

import ComparisonChart from "./comparison-chart";
import AuroraWaves from "@/components/ui/aurora-waves";

export default function ChartsSection() {
	return (
		<section className="relative overflow-hidden py-16 md:py-32">
			{/* Aurora waves background */}
			<div className="absolute inset-0 opacity-30">
				<AuroraWaves speed={0.5} glow={20} theme="dark" />
			</div>

			<div className="relative z-10 mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
				<div className="max-w-2xl">
					<h2 className="font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
						Best Quality. <span className="text-[#34d399]">Lowest Price.</span>
					</h2>

					<p className="mt-6 text-base text-white/80 leading-relaxed sm:text-lg">
						Our intelligent router automatically selects the perfect model for
						each task - optimizing both quality and cost without any manual
						configuration.
					</p>
				</div>
				<ComparisonChart />
			</div>
		</section>
	);
}
