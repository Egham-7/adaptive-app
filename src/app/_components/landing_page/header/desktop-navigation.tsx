import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/shared/utils";
import type { MenuItem } from "@/types/landing-page";

type DesktopNavigationProps = {
	menuItems: MenuItem[];
	pathname: string;
};

export function DesktopNavigation({
	menuItems,
	pathname,
}: DesktopNavigationProps) {
	return (
		<div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
			<ul className="flex items-center gap-1.5 rounded-full border border-transparent px-1 py-1 text-sm">
				{menuItems.map((item) => {
					const isActive =
						item.href === "/"
							? pathname === item.href
							: pathname.startsWith(item.href);

					return (
						<li key={item.name} className="relative">
							<Link
								href={item.href}
								className={cn(
									"relative cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors",
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-accent-foreground",
								)}
							>
								{item.name}
								{isActive && (
									<motion.div
										layoutId="desktop-nav-lamp"
										className="-z-10 absolute inset-0 w-full rounded-full bg-primary/5"
										initial={false}
										transition={{
											type: "spring",
											stiffness: 300,
											damping: 30,
										}}
									>
										<div className="-top-2 -translate-x-1/2 absolute left-1/2 h-1 w-8 rounded-t-full bg-primary">
											<div className="-top-2 -left-2 absolute h-6 w-12 rounded-full bg-primary/20 blur-md" />
											<div className="-top-1 absolute h-6 w-8 rounded-full bg-primary/20 blur-md" />
											<div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
										</div>
									</motion.div>
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
