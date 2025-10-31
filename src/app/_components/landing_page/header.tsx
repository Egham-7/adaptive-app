"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { cn } from "@/lib/shared/utils";
import type { IconMenuItem, MenuItem } from "@/types/landing-page";
import { Logo } from "../logo";
import { DesktopActions } from "./header/desktop-actions";
import { DesktopNavigation } from "./header/desktop-navigation";
import { MenuToggleButton } from "./header/menu-toggle-button";
import { MobileAuthActions } from "./header/mobile-auth-actions";
import { MobileFooter } from "./header/mobile-footer";
import { MobileMenuContent } from "./header/mobile-menu-content";

const SCROLL_THRESHOLD = 50;

const menuItems: MenuItem[] = [
	{ name: "Overview", href: "/" },
	{ name: "Features", href: "/#features" },
	{ name: "Solution", href: "/#solution" },
	{ name: "Pricing", href: "/#pricing" },
	{ name: "About", href: "/#about" },
	{ name: "Support", href: "/support" },
];

const iconMenuItems: IconMenuItem[] = [
	{
		name: "Docs",
		href: "https://docs.llmadaptive.uk/",
		icon: HiOutlineDocumentText,
	},
];

export default function Header() {
	const pathname = usePathname();
	const [menuState, setMenuState] = React.useState(false);
	const [isScrolled, setIsScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll);

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	React.useEffect(() => {
		document.body.style.overflow = menuState ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [menuState]);

	React.useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				setMenuState(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const toggleMenu = () => setMenuState((prev) => !prev);
	const closeMenu = () => setMenuState(false);

	return (
		<header>
			<nav
				data-state={menuState ? "active" : undefined}
				className="fixed z-30 w-full px-2"
			>
				<div
					className={cn(
						"mx-auto mt-2 w-full max-w-7xl px-4 transition-all duration-300 lg:px-10",
						isScrolled &&
							"w-full max-w-7xl rounded-2xl border bg-background/60 backdrop-blur-lg lg:px-4",
					)}
				>
					<div className="flex flex-wrap items-center justify-between gap-4 py-2.5 lg:flex-nowrap lg:gap-6 lg:py-3">
						<div className="flex w-full items-center justify-between lg:w-auto">
							<Link
								href="/"
								aria-label="Adaptive AI Home"
								className="flex items-center space-x-2"
								onClick={closeMenu}
							>
								<Logo imageWidth={84} imageHeight={68} textSize="lg" />
							</Link>

							<div className="flex items-center gap-2 lg:hidden">
								<MenuToggleButton isOpen={menuState} onToggle={toggleMenu} />
							</div>
						</div>

						<DesktopNavigation menuItems={menuItems} pathname={pathname} />

						<div className="mb-6 in-data-[state=active]:block hidden w-full flex-wrap items-start justify-between space-y-8 rounded-3xl border bg-background p-5 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:in-data-[state=active]:flex lg:w-auto lg:gap-5 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<MobileMenuContent
								menuItems={menuItems}
								iconMenuItems={iconMenuItems}
								closeMenu={closeMenu}
							/>
							<DesktopActions iconMenuItems={iconMenuItems} />
							<MobileAuthActions closeMenu={closeMenu} />
							<MobileFooter />
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
