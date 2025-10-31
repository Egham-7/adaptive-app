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
						Configure once and let Adaptive chase the best model forever
					</h2>
					<p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground leading-relaxed sm:text-lg">
						Adaptive watches every provider against real prompts and moves
						traffic the moment performance slips, so you keep quality high while
						costs fall.
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
							Design a multi-provider stack without touching YAML
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							Drag providers onto a visual canvas, define fallbacks and traffic
							splits, then publish through an OpenAI-compatible endpoint. The
							architecture stays maintainable even as models change.
						</p>
						<div className="mt-6 rounded-lg bg-muted/50 p-3">
							<p className="font-mono text-muted-foreground text-xs">
								⚡ Live in under five minutes • No infra rewrite
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
								Let benchmarks, not intuition, pick the model
							</h3>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							Upload regression suites or auto-generate eval sets from real
							traffic. Adaptive scores every model on accuracy, latency, and
							cost, then routes each request to the highest scoring option in
							real time. Tilt the bias toward premium outputs or aggressive savings
							without redeploying code.
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
								Turn new releases into savings, not fire drills
							</h3>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							When GPT-5, Claude 4.5 Sonnet, Gemini 2.5 Pro, or GLM 4.6 edge out
							your incumbent, Adaptive promotes them in production within
							minutes. If their performance slips, traffic rolls back
							automatically and spend stays low.
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
