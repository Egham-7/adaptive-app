"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Home, Sparkles, Bell, CreditCard, BookOpen, Info } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/shared/utils";
import type { IconMenuItem, MenuItem } from "@/types/landing-page";
import { DesktopActions } from "./header/desktop-actions";
import { DesktopNavigation } from "./header/desktop-navigation";

const SCROLL_THRESHOLD = 50;

const menuItems: MenuItem[] = [
	{ name: "Overview", href: "/", icon: Home },
	{ name: "Features", href: "/#features", icon: Sparkles },
	{ name: "Updates", href: "/#solution", icon: Bell },
	{ name: "Pricing", href: "/#pricing", icon: CreditCard },
	{ name: "Documentation", href: "https://docs.llmadaptive.uk/", icon: BookOpen },
	{ name: "About", href: "/#about", icon: Info },
] as MenuItem[];

const iconMenuItems: IconMenuItem[] = [];

export default function Header() {
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = React.useState(false);
	const [activeSection, setActiveSection] = React.useState("/");

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

			// Detect active section based on scroll position
			const sections = ["features", "solution", "pricing", "about"];
			const scrollPosition = window.scrollY + window.innerHeight / 3; // Use 1/3 of viewport as offset

			// Check if at top of page
			if (window.scrollY < 200) {
				setActiveSection("/");
				return;
			}

			// Find active section - check from bottom to top for proper precedence
			let foundSection = null;
			for (const sectionId of sections) {
				const element = document.getElementById(sectionId);
				if (element) {
					const rect = element.getBoundingClientRect();
					const elementTop = rect.top + window.scrollY;
					const elementBottom = elementTop + rect.height;

					if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
						foundSection = sectionId;
					}
				}
			}

			if (foundSection) {
				setActiveSection(`/#${foundSection}`);
			} else {
				// If we're past all sections, keep the last one active
				const lastSection = sections[sections.length - 1];
				const lastElement = document.getElementById(lastSection);
				if (lastElement) {
					const rect = lastElement.getBoundingClientRect();
					const elementTop = rect.top + window.scrollY;
					if (scrollPosition >= elementTop) {
						setActiveSection(`/#${lastSection}`);
					}
				}
			}
		};

		// Run on mount and after a short delay to ensure elements are rendered
		const timer = setTimeout(handleScroll, 100);
		handleScroll();
		window.addEventListener("scroll", handleScroll);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Handle nav click - immediately set active section for instant feedback
	const handleNavClick = (href: string) => {
		if (href.startsWith("/#")) {
			setActiveSection(href);
		} else if (href === "/") {
			setActiveSection("/");
		}
	};

	return (
		<div
			className={cn(
				"fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out",
				isScrolled
					? "top-4 mb-0" // Compact navbar when scrolled
					: "top-4 w-[calc(100%-2rem)] max-w-7xl" // Full header with rounded sides
			)}
		>
			<div
				className={cn(
					"flex items-center backdrop-blur-xl transition-all duration-500 ease-in-out border border-white/[0.08]",
					isScrolled
						? "gap-1 py-1 px-3 rounded-full bg-black/60 scale-95" // Compact style with black transparency
						: "gap-6 py-2 px-8 rounded-full bg-black/40 w-full justify-between" // Full header style with black transparency
				)}
			>
				<div
					className={cn(
						"flex items-center transition-all duration-500",
						isScrolled ? "hidden" : "flex"
					)}
				>
					<Link
						href="/"
						aria-label="Aurora AI Home"
						className="flex items-center"
					>
						<Logo
							brand="adaptive"
							imageWidth={isScrolled ? 40 : 60}
							imageHeight={isScrolled ? 40 : 60}
							textSize="lg"
						/>
					</Link>
				</div>

				<DesktopNavigation menuItems={menuItems} pathname={pathname} activeSection={activeSection} onNavClick={handleNavClick} />

				{/* Mobile icon navigation */}
				<div className="flex items-center gap-1 lg:hidden">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeSection
							? activeSection === item.href
							: item.href === "/"
								? pathname === item.href
								: pathname.startsWith(item.href);
						
						return Icon ? (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => handleNavClick(item.href)}
								className={cn(
									"relative p-2 rounded-full transition-all duration-300",
									isActive
										? "text-[#34d399] bg-[#34d399]/20"
										: "text-white/60 hover:text-white hover:bg-white/10"
								)}
								aria-label={item.name}
							>
								<Icon size={20} />
							</Link>
						) : null;
					})}
				</div>

				<DesktopActions iconMenuItems={iconMenuItems} />
			</div>
		</div>
	);
}
