"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
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
			{/* Fixed Mobile Header Bar */}
			<header className="fixed top-0 right-0 left-0 z-50 border-b bg-background lg:hidden">
				<div className="flex items-center justify-between px-4 py-2">
					<Link href="/" onClick={closeMenu} className="min-w-0 flex-shrink">
						<Logo imageWidth={60} imageHeight={50} textSize="sm" />
					</Link>

					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(!isOpen)}
						aria-label={isOpen ? "Close menu" : "Open menu"}
						className="flex-shrink-0"
					>
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</Button>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<button
						type="button"
						className="absolute inset-0 cursor-default bg-background/90 backdrop-blur-sm"
						onClick={closeMenu}
						aria-label="Close menu"
					/>

					<div className="absolute inset-0 overflow-y-auto overscroll-contain bg-background">
						<div className="flex h-full flex-col items-center justify-center space-y-8 px-8">
							{/* Navigation Links */}
							<nav className="space-y-6 text-center">
								{menuItems.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										onClick={closeMenu}
										className="block font-medium text-base text-muted-foreground transition-colors hover:text-foreground"
									>
										{item.name}
									</Link>
								))}
							</nav>

							{/* Documentation Link */}
							<a
								href="https://docs.llmadaptive.uk/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={closeMenu}
								className="text-base text-muted-foreground transition-colors hover:text-foreground"
							>
								Documentation
							</a>

							{/* Auth Buttons */}
							<div className="flex w-full max-w-xs flex-col items-center space-y-4">
								<SignedOut>
									<Link
										href="/sign-in?redirect_url=/chat-platform"
										className="w-full"
									>
										<Button
											variant="outline"
											size="lg"
											className="w-full"
											onClick={closeMenu}
										>
											Sign In - Chat App
										</Button>
									</Link>

									<Link
										href="/sign-in?redirect_url=/api-platform/orgs"
										className="w-full"
									>
										<Button
											variant="outline"
											size="lg"
											className="w-full"
											onClick={closeMenu}
										>
											Sign In - API Platform
										</Button>
									</Link>

									<div className="my-2 h-px w-full bg-border" />

									<Link
										href="/sign-up?redirect_url=/chat-platform"
										className="w-full"
									>
										<Button size="lg" className="w-full" onClick={closeMenu}>
											Get Started - Chat App
										</Button>
									</Link>

									<Link
										href="/sign-up?redirect_url=/api-platform/orgs"
										className="w-full"
									>
										<Button size="lg" className="w-full" onClick={closeMenu}>
											Get Started - API Platform
										</Button>
									</Link>
								</SignedOut>

								<SignedIn>
									<Link
										href="/chat-platform"
										onClick={closeMenu}
										className="w-full"
									>
										<Button variant="outline" size="lg" className="w-full">
											Chat Platform
										</Button>
									</Link>

									<Link
										href="/api-platform/orgs"
										onClick={closeMenu}
										className="w-full"
									>
										<Button variant="outline" size="lg" className="w-full">
											API Platform
										</Button>
									</Link>
								</SignedIn>
							</div>

							{/* Theme Toggle */}
							<ModeToggle />
						</div>
					</div>
				</div>
			)}
		</>
	);
}
