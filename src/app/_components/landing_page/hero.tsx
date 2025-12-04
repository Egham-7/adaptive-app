"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	AnimatedGroup,
	type AnimatedGroupProps,
} from "@/components/ui/animated-group";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { IosButton } from "@/components/ui/ios-button";
import AnimatedGenerateButton from "@/components/ui/animated-generate-button";
import { TextEffect } from "@/components/ui/text-effect";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
} satisfies AnimatedGroupProps["variants"];

export default function HeroSection() {
	return (
		<AuroraBackground>
			<section className="relative w-full">
				<div className="relative pt-24 md:pt-36">
					<div className="mx-auto max-w-7xl px-6">
						<motion.div
							initial={{ opacity: 0.0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{
								delay: 0.3,
								duration: 0.8,
								ease: "easeInOut",
							}}
							className="text-center sm:mx-auto lg:mt-0 lg:mr-auto"
						>
							<AnimatedGroup variants={transitionVariants}>
								<Link
									href="/sign-in?redirect_url=/api-platform/orgs"
									className="group mx-auto flex w-fit items-center gap-3 rounded-full border-2 border-[#34d399] bg-white/10 backdrop-blur-md px-4 py-2 transition-all duration-300 hover:bg-[rgba(52,211,153,0.15)] hover:border-[#a3e635]"
								>
									<span className="text-white text-sm font-semibold">
										Now routing GPT-5, Claude 4.5 Sonnet, Gemini 2.5 Pro, and
										GLM 4.6
									</span>
									<ArrowRight className="size-4 text-[#34d399]" />
								</Link>
							</AnimatedGroup>

							<TextEffect
								preset="fade-in-blur"
								speedSegment={0.3}
								as="h1"
								className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem] text-white"
							>
								Keep every request on the best AI model automatically
							</TextEffect>
							<TextEffect
								per="line"
								preset="fade-in-blur"
								speedSegment={0.3}
								delay={0.5}
								as="p"
								className="mx-auto mt-8 max-w-2xl text-balance text-lg text-white"
							>
								Most teams pin traffic to a single model because the routing
								work is painful. Adaptive benchmarks every provider against your
								prompts, inspects each request, and chooses the best-fit model
								that aligns with the cost or quality bias you set. Dial toward
								premium responses or aggressive savings whenever you need, and
								Adaptive handles fallbacks, observability, and production
								stability.
							</TextEffect>

							<AnimatedGroup
								variants={{
									container: {
										visible: {
											transition: {
												staggerChildren: 0.05,
												delayChildren: 0.75,
											},
										},
									},
									...transitionVariants,
								}}
								className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
							>
								<Link key={1} href="/api-platform/orgs">
									<AnimatedGenerateButton
										labelIdle="Start Auto-Optimizing Free"
										labelActive="Loading..."
									/>
								</Link>
								<IosButton key={2} asChild variant="default">
									<Link href="/support?subject=Adaptive%20Routing%20Consultation&message=Hi%20Adaptive%20team%2C%20we%20need%20help%20configuring%20multi-model%20routing%20with%20cost%20and%20quality%20bias%20controls.%20Please%20reach%20out%20to%20schedule%20a%20call.%20Thank%20you!">
										<span className="text-nowrap">Talk to an expert</span>
									</Link>
								</IosButton>
							</AnimatedGroup>
						</motion.div>
					</div>

					<ContainerScroll
						titleComponent={<></>}
					>
						<Image
							className="relative aspect-15/8 rounded-2xl bg-background object-cover h-full w-full"
							src="/hero-dark.png"
							alt="app screen"
							width={2700}
							height={1440}
							draggable={false}
						/>
					</ContainerScroll>
				</div>
			</section>
		</AuroraBackground>
	);
}
