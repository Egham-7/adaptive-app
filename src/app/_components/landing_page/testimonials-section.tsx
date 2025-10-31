import Image from "next/image";

export default function TestimonialsSection() {
	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<div className="mx-auto max-w-2xl">
					<blockquote>
						<p className="font-semibold text-lg md:text-xl lg:text-3xl">
							Adaptive took model selection off our roadmap. Their eval loop
							swapped in GPT-5 and Claude 4.5 the week those models cleared our
							benchmarks, and it rolled traffic back as soon as latency spiked.
							Our researchers focus on prompts while Adaptive keeps production
							fast and affordable.
						</p>

						<div className="mt-12 flex items-center gap-6">
							<Image
								className="h-7 w-fit dark:invert"
								src="https://html.tailus.io/blocks/customers/nvidia.svg"
								alt="Nvidia Logo"
								height={28}
								width={100}
							/>

							<div className="space-y-1 border-l pl-6">
								<cite className="font-medium">Sarah Johnson</cite>
								<span className="block text-muted-foreground text-sm">
									CTO, Nvidia Applied Research
								</span>
							</div>
						</div>
					</blockquote>
				</div>
			</div>
		</section>
	);
}
