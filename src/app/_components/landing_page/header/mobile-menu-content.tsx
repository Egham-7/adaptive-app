import Link from "next/link";
import type { IconMenuItem, MenuItem } from "@/types/landing-page";

type MobileMenuContentProps = {
	menuItems: MenuItem[];
	iconMenuItems: IconMenuItem[];
	closeMenu: () => void;
};

export function MobileMenuContent({
	menuItems,
	iconMenuItems,
	closeMenu,
}: MobileMenuContentProps) {
	return (
		<div className="w-full space-y-6 text-base lg:hidden">
			<ul className="space-y-4">
				{menuItems.map((item) => (
					<li key={item.name}>
						<Link
							href={item.href}
							className="block rounded-full px-4 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							onClick={closeMenu}
						>
							{item.name}
						</Link>
					</li>
				))}
			</ul>

			<div className="border-t pt-6">
				<ul className="space-y-4 text-muted-foreground text-sm">
					{iconMenuItems.map((item) => {
						const Icon = item.icon;
						return (
							<li key={item.name}>
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
									onClick={closeMenu}
								>
									<Icon aria-hidden={true} size={18} />
									<span>{item.name}</span>
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
