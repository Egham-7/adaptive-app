export default function StatsSection() {
	return (
		<section className="py-12 md:py-20">
			<div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
				<div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
					<h2 className="font-medium text-4xl lg:text-5xl">
						Adaptive by the numbers
					</h2>
					<p className="text-muted-foreground">
						Teams use Adaptive to keep model quality high while spend drops.
						Here is what the routing network looks like in production today.
					</p>
				</div>

				<div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
					<div className="space-y-4 pt-12 md:pt-0">
						<div className="font-bold text-5xl text-primary">68%</div>
						<p className="text-muted-foreground">
							Average reduction in model spend
						</p>
					</div>
					<div className="space-y-4 pt-12 md:pt-0">
						<div className="font-bold text-5xl text-primary">4.8ms</div>
						<p className="text-muted-foreground">
							Median routing decision time
						</p>
					</div>
					<div className="space-y-4 pt-12 md:pt-0">
						<div className="font-bold text-5xl text-primary">230+</div>
						<p className="text-muted-foreground">
							Models evaluated per customer each week
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
