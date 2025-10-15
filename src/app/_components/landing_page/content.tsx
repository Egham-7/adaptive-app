import { Cpu, Zap } from "lucide-react";
import { LogoCarousel } from "./logo-carousel";

const logos1 = [
	{ name: "OpenAI", id: 1, img: "/logos/openai.webp" },
	{ name: "Gemini", id: 2, img: "/logos/google.svg" },
	{ name: "DeepSeek", id: 3, img: "/logos/deepseek.svg" },
	{ name: "Anthropic", id: 4, img: "/logos/anthropic.jpeg" },
];

const logos2 = [
	{ name: "Grok", id: 6, img: "/logos/grok.svg" },
	{ name: "Mistral", id: 8, img: "/logos/mistral.png" },
	{ name: "Cohere", id: 9, img: "/logos/cohere.png" },
	{ name: "Hugging Face", id: 10, img: "/logos/huggingface.png" },
];

export default function ContentSection() {
	return (
		<section id="solution" className="py-16 md:py-32">
			<div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
				<h2 className="relative z-10 max-w-4xl font-bold text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
					For Developers & CTOs:{" "}
					<span className="text-primary">Stop Overpaying</span> for New Models
				</h2>

				<div className="grid gap-6 md:grid-cols-2 md:gap-12 lg:gap-24">
					<div className="relative space-y-4">
						<p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
							Every other router needs weeks of training before supporting new
							models. We work with GPT-6 the day it launches - and save you
							60-90% across any provider.
						</p>

						<p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
							New model support without retraining. Provider-agnostic
							optimization. Turn your biggest expense into your advantage.
						</p>

						<div className="mt-6 rounded-lg border bg-muted/30 p-4 md:p-6">
							<h3 className="mb-3 font-semibold text-base text-foreground sm:text-lg">
								How It Works:
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Our{" "}
								<span className="font-semibold text-foreground">
									sub-2ms routing engine
								</span>{" "}
								analyzes task complexity and model capabilities in real-time.
								When new models launch, we instantly integrate them - no
								training data needed.
							</p>
						</div>

						<div className="grid gap-4 pt-6">
							{/* Developer Benefits */}
							<div className="rounded-lg border bg-primary/5 p-4 dark:bg-primary/10">
								<div className="mb-2 flex items-center gap-2">
									<Zap className="size-5 flex-shrink-0 text-primary" />
									<h3 className="font-semibold text-foreground text-sm sm:text-base">
										For Developers
									</h3>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
									Skip weeks of integration. Use new models day-one with
									existing code. OpenAI-compatible API - zero code changes.
								</p>
							</div>

							{/* CTO Benefits */}
							<div className="rounded-lg border bg-secondary/30 p-4 dark:bg-secondary/20">
								<div className="mb-2 flex items-center gap-2">
									<Cpu className="size-5 flex-shrink-0 text-secondary-foreground" />
									<h3 className="font-semibold text-foreground text-sm sm:text-base">
										For CTOs
									</h3>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
									Cut AI spend by 60-90% without vendor lock-in. Get competitive
									advantage while others wait for updates.
								</p>
							</div>
						</div>
					</div>

					<div className="relative mt-6 md:mt-0">
						<div className="rounded-2xl bg-[linear-gradient(to_bottom,var(--color-input),transparent)] p-px dark:bg-[linear-gradient(to_bottom,var(--color-card),transparent)]">
							<div className="p-6 md:p-8">
								<LogoCarousel logos={logos1} columnCount={3} />
							</div>
						</div>
						<div className="p-6 md:p-8">
							<LogoCarousel logos={logos2} columnCount={3} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
