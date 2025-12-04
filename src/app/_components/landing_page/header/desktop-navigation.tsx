import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/shared/utils";
import type { MenuItem } from "@/types/landing-page";

type DesktopNavigationProps = {
	menuItems: MenuItem[];
	pathname: string;
	activeSection?: string;
	onNavClick?: (href: string) => void;
};

export function DesktopNavigation({
	menuItems,
	pathname,
	activeSection,
	onNavClick,
}: DesktopNavigationProps) {
	return (
		<div className="hidden lg:flex items-center transition-all duration-500">
			<ul className="flex items-center gap-1 text-sm">
				{menuItems.map((item) => {
					// Use activeSection for scroll-based detection on homepage, pathname for other pages
					const isActive = activeSection
						? activeSection === item.href
						: item.href === "/"
							? pathname === item.href
							: pathname.startsWith(item.href);

					return (
						<li key={item.name} className="relative">
							{isActive && (
								<motion.div
									layoutId="lamp"
									className="absolute inset-0 w-full rounded-full -z-10"
									style={{ backgroundColor: "#00d570" + "20" }}
									initial={false}
									transition={{
										type: "spring",
										stiffness: 300,
										damping: 30,
									}}
								>
									<div
										className="absolute left-1/2 -translate-x-1/2 rounded-t-full transition-all duration-300 -top-3 w-10 h-2"
										style={{ backgroundColor: "#00d570" }}
									>
										<div
											className="absolute rounded-full blur-md -left-2 transition-all duration-300 w-14 h-8 -top-3"
											style={{ backgroundColor: "#00d570" + "33" }}
										/>
										<div
											className="absolute rounded-full blur-md transition-all duration-300 w-10 h-8 -top-2"
											style={{ backgroundColor: "#00d570" + "33" }}
										/>
										<div
											className="absolute rounded-full blur-sm transition-all duration-300 w-6 h-6 top-0 left-2"
											style={{ backgroundColor: "#00d570" + "33" }}
										/>
									</div>
								</motion.div>
							)}
							<Link
								href={item.href}
								onClick={() => onNavClick?.(item.href)}
								className={cn(
									"relative cursor-pointer rounded-full px-4 py-2 font-normal transition-all duration-300",
									isActive
										? "text-white"
										: "text-white/80 hover:text-white",
								)}
							>
								{item.name}
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
