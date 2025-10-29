"use client";

import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextRotate } from "@/components/ui/text-rotate";
import AnimatedBeamGraph from "./animated-beam-graph";

export default function HeroSection() {
	const rotatingTexts = [
		"60-90% Cost Savings",
		"Auto-Swap to Best Models",
		"Visual Architecture Builder",
	];

	return (
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
			<div className="relative z-10 mx-auto max-w-4xl px-6 py-12 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Badge variant="secondary" className="mb-6">
						All Latest Models Available
					</Badge>
				</motion.div>

				<h1 className="mt-4 text-balance text-center font-bold font-display text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
					<span className="inline-flex flex-wrap items-center justify-center gap-x-2">
						{"Cut AI Costs by ".split(" ").map((word, wordIndex) => (
							<span key={word} className="inline-block whitespace-nowrap">
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
					</span>

					<span className="inline-flex items-center justify-center">
						<TextRotate
							texts={rotatingTexts}
							rotationInterval={3000}
							staggerDuration={0.02}
							staggerFrom="first"
							splitBy="characters"
							splitLevelClassName="inline-block whitespace-nowrap"
							mainClassName="bg-gradient-to-r whitespace-nowrap inline-flex items-center justify-center from-primary to-primary/80 bg-clip-text text-transparent"
							elementLevelClassName="inline-block whitespace-nowrap"
							initial={{ y: 100, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -100, opacity: 0 }}
							transition={{
								type: "spring",
								stiffness: 150,
								damping: 25,
							}}
						/>
					</span>
				</h1>

				<p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground leading-relaxed sm:text-lg">
					Configure providers on a visual canvas, add test cases, and let Adaptive handle the rest. We continuously evaluate performance and automatically swap to the best models. Save money while maintaining quality. Zero manual updates.
				</p>

				<div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
					<div className="flex items-center gap-2">
						<svg
							className="h-5 w-5 text-green-500"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="text-muted-foreground">
							Visual architecture builder (no code required)
						</span>
					</div>
					<div className="flex items-center gap-2">
						<svg
							className="h-5 w-5 text-green-500"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="text-muted-foreground">
							Live evaluation against your benchmarks
						</span>
					</div>
					<div className="flex items-center gap-2">
						<svg
							className="h-5 w-5 text-green-500"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="text-muted-foreground">
							Automatic model swapping saves 60-90%
						</span>
					</div>
				</div>

				<AnimatedBeamGraph />

				<fieldset className="mt-10 flex flex-col justify-center gap-4 border-0 p-0 sm:flex-row">
					<legend className="sr-only">Hero actions</legend>
					<SignedOut>
						<SignUpButton signInForceRedirectUrl="/api-platform/orgs">
							<Button
								size="lg"
								className="bg-primary px-8 py-6 font-semibold text-base text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:text-lg"
							>
								<Rocket className="relative mr-2 size-5" aria-hidden="true" />
								Start Auto-Optimizing Free
							</Button>
						</SignUpButton>
					</SignedOut>
					<SignedIn>
						<Button
							size="lg"
							className="bg-primary px-8 py-6 font-semibold text-base text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:text-lg"
							asChild
						>
							<Link href="/api-platform/orgs">
								<Rocket className="relative mr-2 size-5" aria-hidden="true" />
								Go to Dashboard
							</Link>
						</Button>
					</SignedIn>
					<Button
						variant="outline"
						size="lg"
						className="border-2 border-primary px-8 py-6 font-semibold text-base text-primary hover:bg-primary hover:text-primary-foreground sm:text-lg"
						asChild
					>
						<Link href="/features"> Watch How It Works</Link>
					</Button>
				</fieldset>
			</div>
		</section>
	);
}
