"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "../logo";
import { ModeToggle } from "../mode-toggle";

const menuItems = [
	{ name: "Features", href: "/features" },
	{ name: "Solution", href: "/solution" },
	{ name: "Pricing", href: "/pricing" },
	{ name: "About", href: "/about" },
	{ name: "Support", href: "/support" },
];

export function MobileHeader() {
	const [isOpen, setIsOpen] = useState(false);

	const closeMenu = () => setIsOpen(false);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<>
			<header className="fixed top-0 right-0 left-0 z-50 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 lg:hidden">
				<div className="flex items-center justify-between px-4 py-3">
					<Link href="/" onClick={closeMenu} className="min-w-0 flex-shrink">
						<Logo imageWidth={60} imageHeight={50} textSize="sm" />
					</Link>

					<div className="flex items-center gap-2">
						<ModeToggle />
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsOpen(!isOpen)}
							aria-label={isOpen ? "Close menu" : "Open menu"}
							className="relative flex-shrink-0"
						>
							<motion.div
								animate={{ rotate: isOpen ? 90 : 0 }}
								transition={{ duration: 0.2 }}
							>
								{isOpen ? <X size={24} /> : <Menu size={24} />}
							</motion.div>
						</Button>
					</div>
				</div>
			</header>

			<AnimatePresence>
				{isOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
							onClick={closeMenu}
						/>

						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="fixed top-[61px] right-0 bottom-0 left-0 z-50 overflow-y-auto overscroll-contain border-l bg-background shadow-2xl sm:left-auto sm:max-w-sm lg:hidden"
						>
							<div className="flex h-full flex-col">
								<div className="flex-1 px-4 py-8 sm:px-6">
									<div className="space-y-1">
										{menuItems.map((item, index) => (
											<motion.div
												key={item.name}
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.05 }}
											>
												<Link
													href={item.href}
													onClick={closeMenu}
													className="group flex items-center justify-between rounded-lg px-4 py-3 font-medium text-base text-foreground transition-colors hover:bg-accent"
												>
													<span>{item.name}</span>
													<motion.span
														className="opacity-0 transition-opacity group-hover:opacity-100"
														initial={{ x: -5 }}
														whileHover={{ x: 0 }}
													>
														→
													</motion.span>
												</Link>
											</motion.div>
										))}
									</div>

									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: menuItems.length * 0.05 }}
										className="mt-6 border-t pt-6"
									>
										<a
											href="https://docs.llmadaptive.uk/"
											target="_blank"
											rel="noopener noreferrer"
											onClick={closeMenu}
											className="group flex items-center justify-between rounded-lg px-4 py-3 font-medium text-base text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
										>
											<span>Documentation</span>
											<ExternalLink className="h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
										</a>
									</motion.div>
								</div>

								<div className="border-t bg-muted/30 px-4 py-4 sm:px-6 sm:py-6">
									<SignedOut>
										<div className="space-y-3">
											<p className="mb-3 font-medium text-muted-foreground text-xs">
												Get Started
											</p>
											<Link
												href="/sign-up?redirect_url=/api-platform/orgs"
												className="block w-full"
											>
												<Button
													size="lg"
													className="group h-11 w-full text-sm sm:text-base"
													onClick={closeMenu}
												>
													<Sparkles className="mr-2 h-4 w-4 flex-shrink-0 transition-transform group-hover:rotate-12" />
													<span className="truncate">Start Free Trial</span>
												</Button>
											</Link>
											<Link
												href="/sign-up?redirect_url=/chat-platform"
												className="block w-full"
											>
												<Button
													variant="outline"
													size="lg"
													className="h-11 w-full text-sm sm:text-base"
													onClick={closeMenu}
												>
													<span className="truncate">Try Chat App</span>
												</Button>
											</Link>

											<div className="relative my-4">
												<div className="absolute inset-0 flex items-center">
													<span className="w-full border-t" />
												</div>
												<div className="relative flex justify-center text-xs uppercase">
													<span className="whitespace-nowrap bg-muted/30 px-2 text-muted-foreground">
														Already have an account?
													</span>
												</div>
											</div>

											<Link
												href="/sign-in?redirect_url=/api-platform/orgs"
												className="block w-full"
											>
												<Button
													variant="ghost"
													size="lg"
													className="h-11 w-full text-sm sm:text-base"
													onClick={closeMenu}
												>
													Sign In
												</Button>
											</Link>
										</div>
									</SignedOut>

									<SignedIn>
										<div className="space-y-3">
											<p className="mb-3 font-medium text-muted-foreground text-xs">
												My Platforms
											</p>
											<Link
												href="/api-platform/orgs"
												onClick={closeMenu}
												className="block w-full"
											>
												<Button
													variant="outline"
													size="lg"
													className="h-11 w-full justify-start text-sm sm:text-base"
												>
													<span className="truncate">API Platform</span>
												</Button>
											</Link>
											<Link
												href="/chat-platform"
												onClick={closeMenu}
												className="block w-full"
											>
												<Button
													variant="outline"
													size="lg"
													className="h-11 w-full justify-start text-sm sm:text-base"
												>
													<span className="truncate">Chat Platform</span>
												</Button>
											</Link>
										</div>
									</SignedIn>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
