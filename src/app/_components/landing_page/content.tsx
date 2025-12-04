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
				<h2 className="relative z-10 max-w-4xl font-bold text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl text-white">
					Give your engineering team a <span className="text-[#a3e635]">self-optimizing</span> model stack
				</h2>

				<div className="grid gap-6 md:grid-cols-2 md:gap-12 lg:gap-24">
					<div className="relative space-y-4">
						<p className="text-base text-white leading-relaxed sm:text-lg">
							New foundation models launch every week. Without Adaptive, that
							means spinning up evals, rewriting routing logic, and hoping the
							rollout sticks, so most teams pick one provider and leave it
							there. Adaptive keeps the best mix of models in play without
							rebuilding anything.
						</p>

						<p className="text-base text-white leading-relaxed sm:text-lg">
							Sketch your routing architecture on a visual canvas, load in your
							benchmarks, and let Adaptive run continuous tests across every
							provider. Routing shifts automatically to whichever model wins on
							quality, latency, and cost.
						</p>

						<div className="mt-6 rounded-lg border-2 border-[#34d399] bg-transparent p-4 md:p-6">
							<h3 className="mb-3 font-semibold text-base text-[#a3e635] sm:text-lg">
								How Adaptive decides where to send traffic
							</h3>
							<p className="text-white text-sm leading-relaxed sm:text-base">
								Every request runs through your benchmark matrix. Adaptive
								scores each provider on accuracy, latency, and spend, then
								updates routing in minutes when the leaderboard changes. Your
								team keeps shipping while Adaptive keeps score.
							</p>
						</div>

						<div className="grid gap-4 pt-6">
							{/* Developer Benefits */}
							<div className="rounded-lg border-2 border-[#34d399] bg-transparent p-4 hover:bg-[rgba(52,211,153,0.1)] hover:border-[#a3e635] transition-all">
								<div className="mb-2 flex items-center gap-2">
									<Zap className="size-5 flex-shrink-0 text-[#a3e635]" />
									<h3 className="font-semibold text-white text-sm sm:text-base">
										Built for developers
									</h3>
								</div>
								<p className="text-white text-sm leading-relaxed sm:text-base">
									Drop-in OpenAI-compatible API keys, visual architecture
									instead of YAML, and benchmarks sourced from your own prompts.
									Publish a route in minutes and Adaptive keeps refining it
									behind the scenes.
								</p>
							</div>

							{/* CTO Benefits */}
							<div className="rounded-lg border-2 border-[#34d399] bg-transparent p-4 hover:bg-[rgba(52,211,153,0.1)] hover:border-[#a3e635] transition-all">
								<div className="mb-2 flex items-center gap-2">
									<Cpu className="size-5 flex-shrink-0 text-[#a3e635]" />
									<h3 className="font-semibold text-white text-sm sm:text-base">
										Trusted by platform leaders
									</h3>
								</div>
								<p className="text-white text-sm leading-relaxed sm:text-base">
									Cut AI spend by 60 to 90 percent while meeting the reliability
									thresholds you set. No single-vendor risk, no lag between a
									model upgrade and production traffic, and audit trails for
									every decision Adaptive makes.
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
