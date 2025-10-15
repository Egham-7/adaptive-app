"use client";

import { SignedOut, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/ui/video-player";

export default function GetStartedSection() {
	return (
		<SignedOut>
			<section className="overflow-hidden py-16 md:py-32">
				<div className="mx-auto max-w-7xl px-6">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center"
					>
						<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
							See{" "}
							<span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
								Adaptive
							</span>{" "}
							in Action
						</h2>
						<p className="mx-auto mt-6 max-w-3xl text-balance text-base text-muted-foreground leading-relaxed sm:text-lg">
							Watch how Adaptive cuts your AI costs by 60-90% with intelligent
							routing - no setup, no training data, ready in 2 minutes.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="mt-16"
					>
						<VideoPlayer src="/adaptive-demo.mp4" />
					</motion.div>

					{/* Call to action */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mt-12 space-y-6 text-center"
					>
						<p className="text-base text-muted-foreground sm:text-lg">
							Ready to slash your AI costs?{" "}
							<span className="font-semibold text-foreground">
								Join teams saving thousands monthly
							</span>
						</p>

						<div className="flex justify-center">
							<SignUpButton signInForceRedirectUrl="/api-platform/orgs">
								<Button
									size="lg"
									className="bg-primary px-8 py-6 font-semibold text-base text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:text-lg"
								>
									<Rocket className="relative mr-2 size-5" aria-hidden="true" />
									Start Free - Get $3.14 Credit
								</Button>
							</SignUpButton>
						</div>

						<p className="text-muted-foreground text-sm">
							No credit card • 2-minute setup • Cancel anytime
						</p>
					</motion.div>
				</div>
			</section>
		</SignedOut>
	);
}
