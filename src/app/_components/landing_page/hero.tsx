"use client";

import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextRotate } from "@/components/ui/text-rotate";
import { useSmartRedirect } from "@/hooks/use-smart-redirect";
import AnimatedBeamGraph from "./animated-beam-graph";

export default function HeroSection() {
	const rotatingTexts = [
		"Intelligent Inference",
		"New Models Day One",
		"60-90% Savings",
	];
	const redirectPath = useSmartRedirect();

	return (
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
			<div className="relative z-10 mx-auto max-w-4xl px-6 py-12 text-center">
				<h1 className="mt-8 text-balance text-center font-display font-semibold text-4xl md:text-5xl xl:text-7xl xl:[line-height:1.125]">
					{"AI Infrastructure for ".split(" ").map((word, wordIndex) => (
						<span
							key={word}
							className="mr-2 inline-block flex-nowrap last:mr-0"
						>
							{word.split("").map((letter, letterIndex) => (
								<motion.span
									key={word.slice(0, letterIndex + 1)}
									initial={{ y: 100, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										delay: (wordIndex * 3 + letterIndex) * 0.03,
										type: "spring",
										stiffness: 150,
										damping: 25,
									}}
									className="inline-block bg-gradient-to-r from-neutral-900 to-neutral-700/80 bg-clip-text text-transparent dark:from-white dark:to-white/80"
								>
									{letter}
								</motion.span>
							))}
						</span>
					))}

					<TextRotate
						texts={rotatingTexts}
						rotationInterval={3000}
						staggerDuration={0.02}
						staggerFrom="first"
						splitBy="characters"
						splitLevelClassName="inline-block flex-nowrap whitespace-nowrap"
						mainClassName="bg-gradient-to-r flex-nowwrap whitespace-nowrap flex items-center justify-center from-primary to-primary/80 bg-clip-text text-transparent whitespace-nowrap"
						elementLevelClassName="inline-block flex-nowrap whitespace-nowrap"
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -100, opacity: 0 }}
						transition={{
							type: "spring",
							stiffness: 150,
							damping: 25,
						}}
					/>
				</h1>

				<p className="mx-auto mt-8 max-w-3xl text-balance text-muted-foreground">
					The first AI router that works with any model instantly - no training
					data, no onboarding, no setup. Our{" "}
					<span className="font-medium text-foreground">
						sub-2ms prompt complexity classifier
					</span>{" "}
					maps requests to optimal models in real-time, delivering 60-90% cost
					savings across OpenAI, Anthropic, and any future provider.
				</p>
				<p className="mx-auto mt-4 max-w-2xl font-medium text-primary text-sm">
					⚡ Be ready for the next model launch while competitors scramble for
					weeks
				</p>

				<AnimatedBeamGraph />

				<fieldset className="mt-8 flex flex-col justify-center gap-4 border-0 p-0 md:flex-row">
					<legend className="sr-only">Hero actions</legend>
					<SignedOut>
						<SignUpButton signInForceRedirectUrl="/api-platform/orgs">
							<Button
								size="lg"
								className="bg-primary font-medium text-primary-foreground shadow-subtle transition-opacity hover:opacity-90"
							>
								<Rocket className="relative mr-2 size-4" aria-hidden="true" />
								Start Saving 60-90%
							</Button>
						</SignUpButton>
					</SignedOut>
					<SignedIn>
						{redirectPath ? (
							<Button
								size="lg"
								className="bg-primary font-medium text-primary-foreground shadow-subtle transition-opacity hover:opacity-90"
								asChild
							>
								<Link href={redirectPath}>
									<Rocket className="relative mr-2 size-4" aria-hidden="true" />
									View Dashboard
								</Link>
							</Button>
						) : (
							<Button
								size="lg"
								className="bg-primary font-medium text-primary-foreground shadow-subtle transition-opacity hover:opacity-90"
								disabled
							>
								<Rocket className="relative mr-2 size-4" aria-hidden="true" />
								View Dashboard
							</Button>
						)}
					</SignedIn>
					<Button
						variant="outline"
						size="lg"
						className="border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
						asChild
					>
						<Link href="/features">See How It Works</Link>
					</Button>
				</fieldset>
			</div>
		</section>
	);
}
