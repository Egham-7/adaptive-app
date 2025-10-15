import { Shield, TrendingDown, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProviderDownloadChart } from "./provider-download-chart";

export default function FeaturesSection() {
	return (
		<section
			id="features"
			className="bg-muted/50 py-16 md:py-32 dark:bg-transparent"
		>
			<div className="mx-auto max-w-3xl px-6 lg:max-w-5xl">
				<header className="mb-12 text-center">
					<h2 className="font-bold font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						New Models. Any Provider. Maximum Savings.
					</h2>
					<p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground leading-relaxed sm:text-lg">
						The only router ready for tomorrow's models today - no training, no
						lock-in, instant 60-90% savings
					</p>
				</header>
				<div className="grid gap-8 md:grid-cols-3">
					{/* Pillar 1: New Models Day One */}
					<Card className="relative overflow-hidden">
						<CardContent className="pt-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Zap className="h-10 w-10 text-primary" aria-hidden="true" />
							</div>
							<h3 className="mb-4 font-bold text-xl sm:text-2xl">
								New Models Day One
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Works with GPT-6, Claude Opus 5, or any model the day it
								launches. Our{" "}
								<span className="font-semibold text-foreground">
									sub-2ms routing
								</span>{" "}
								instantly adapts - no training, no waiting.
							</p>
							<div className="mt-6 rounded-lg bg-muted/50 p-3">
								<p className="font-mono text-muted-foreground text-xs">
									&lt; 2ms inference time
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Pillar 2: Any Provider */}
					<Card className="relative overflow-hidden">
						<CardContent className="pt-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<TrendingDown className="h-10 w-10 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-xl sm:text-2xl">
								Any Provider
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Optimize across OpenAI, Anthropic, Google, and any future
								provider. Never locked in. Switch seamlessly.
							</p>
							<div className="mt-4">
								<ProviderDownloadChart />
							</div>
						</CardContent>
					</Card>

					{/* Pillar 3: Maximum Savings */}
					<Card className="relative overflow-hidden">
						<CardContent className="pt-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Shield className="h-10 w-10 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-xl sm:text-2xl">
								Maximum Savings
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Cut costs by 60-90% through intelligent routing and real-time
								optimization. Sub-millisecond decisions, 99.9% uptime
								guaranteed.
							</p>
							<div className="mt-6 space-y-2">
								<div className="flex justify-between text-xs">
									<span className="text-muted-foreground">Average Savings</span>
									<span className="font-medium text-primary">60-90%</span>
								</div>
								<div className="flex justify-between text-xs">
									<span className="text-muted-foreground">Routing Speed</span>
									<span className="font-medium text-primary">&lt; 2ms</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
