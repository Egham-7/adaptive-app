"use client";

import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<div className="text-center">
					<h2 className="text-balance font-bold font-display text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
						Stay ahead of every model release without rewriting a line
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
						Adaptive runs your evals around the clock, promotes the best
						provider automatically, and gives you full visibility into savings.
						Launch in minutes and keep improving week after week.
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
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
								Upload benchmarks or generate from prompts
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
								Visual architecture canvas with no code to maintain
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
								Auto-swap to the best model within minutes
							</span>
						</div>
					</div>
					<div className="mt-10 flex flex-wrap justify-center gap-4">
						<SignedOut>
							<SignUpButton
								mode="modal"
								signInForceRedirectUrl="/api-platform/orgs"
							>
								<Button
									size="lg"
									className="bg-primary px-8 py-6 font-semibold text-base text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:text-lg"
								>
									<Rocket className="relative mr-2 size-5" />
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
									<Rocket className="relative mr-2 size-5" />
									Go to Dashboard
								</Link>
							</Button>
						</SignedIn>

						<Button
							asChild
							size="lg"
							variant="outline"
							className="border-2 border-primary px-8 py-6 font-semibold text-base text-primary hover:bg-primary hover:text-primary-foreground sm:text-lg"
						>
							<Link href="/features">
								<span>View Documentation</span>
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
