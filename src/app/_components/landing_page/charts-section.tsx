import ComparisonChart from "./comparison-chart";

export default function ChartsSection() {
	return (
		<section className="overflow-hidden py-16 md:py-32">
			<div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
				<div className="relative z-10 max-w-2xl">
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						Best Quality. <span className="text-primary">Lowest Price.</span>
					</h2>

					<p className="mt-6 text-base text-muted-foreground leading-relaxed sm:text-lg">
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
