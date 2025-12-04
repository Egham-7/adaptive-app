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
			<ul className="space-y-2">
				{menuItems.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.name}>
							<Link
								href={item.href}
								className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
								onClick={closeMenu}
							>
								{Icon && <Icon size={20} className="text-[#34d399]" aria-hidden />}
								<span>{item.name}</span>
							</Link>
						</li>
					);
				})}
			</ul>

			{iconMenuItems.length > 0 && (
				<div className="border-t border-white/10 pt-6">
					<ul className="space-y-2">
						{iconMenuItems.map((item) => {
							const Icon = item.icon;
							return (
								<li key={item.name}>
									<a
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/70 transition-all hover:bg-white/10 hover:text-white"
										onClick={closeMenu}
									>
										<Icon aria-hidden={true} size={20} className="text-[#34d399]" />
										<span>{item.name}</span>
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
