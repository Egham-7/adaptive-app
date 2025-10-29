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
						Configure Once. Test Continuously. Optimize Automatically.
					</h2>
					<p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground leading-relaxed sm:text-lg">
						The only routing platform that monitors your providers against real
						benchmarks and auto-swaps when performance dips—saving you 60-90%
						without sacrificing quality.
					</p>
				</header>
				<div className="grid gap-8 md:grid-cols-3">
					{/* Pillar 1: Visual Architecture Canvas */}
					<Card className="relative overflow-hidden">
						<CardContent className="pt-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Zap className="h-10 w-10 text-primary" aria-hidden="true" />
							</div>
							<h3 className="mb-4 font-bold text-xl sm:text-2xl">
								Design Your Routing in Minutes
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Build your entire inference architecture on an intuitive visual
								canvas. Connect providers, configure fallback strategies, and
								set up parallel routing—all without writing YAML configs or
								touching infrastructure code.
							</p>
							<div className="mt-6 rounded-lg bg-muted/50 p-3">
								<p className="font-mono text-muted-foreground text-xs">
									⚡ Deploy in 2 minutes • No code required
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Pillar 2: Live Eval-Based Routing */}
					<Card className="relative overflow-hidden">
						<CardContent className="pt-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<TrendingDown className="h-10 w-10 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-xl sm:text-2xl">
								Route Based on Real Performance
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Upload your test cases or generate benchmarks from sample
								prompts. Adaptive continuously evaluates all your providers
								against your quality, latency, and cost criteria—then routes
								each request to whoever's performing best right now.
							</p>
							<div className="mt-4">
								<ProviderDownloadChart />
							</div>
						</CardContent>
					</Card>

					{/* Pillar 3: Automatic Model Swapping */}
					<Card className="relative overflow-hidden">
						<CardContent className="pt-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Shield className="h-10 w-10 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-xl sm:text-2xl">
								Save 60-90% on Autopilot
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								When a provider underperforms on your benchmarks, Adaptive
								automatically swaps to better alternatives. When GPT-5 launches
								and beats your tests, it goes live within hours—not weeks. Cut
								costs while maintaining your quality standards, completely
								hands-off.
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
