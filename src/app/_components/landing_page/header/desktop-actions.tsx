import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { GitHubStarsButton } from "@/components/animate-ui/buttons/github-stars";
import { Button } from "@/components/ui/button";
import { IosButton } from "@/components/ui/ios-button";
import { AuroraButton } from "@/components/ui/aurora-button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IconMenuItem } from "@/types/landing-page";
import { LoadingLink } from "./loading-link";

type DesktopActionsProps = {
	iconMenuItems: IconMenuItem[];
};

export function DesktopActions({ iconMenuItems }: DesktopActionsProps) {
	return (
		<div className="shrink-0 items-center justify-end gap-1.5 hidden lg:flex">
			{iconMenuItems.map((item) => {
				const Icon = item.icon;
				return (
					<IosButton key={item.name} asChild variant="default">
						<a
							href={item.href}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 h-8 px-3 py-1.5 text-xs"
						>
							<Icon aria-hidden={true} size={14} />
							<span>{item.name}</span>
						</a>
					</IosButton>
				);
			})}

			<GitHubStarsButton
				username="Egham-7"
				repo="adaptive"
				formatted={true}
				className="h-8 text-xs"
			/>

			<SignedOut>
				<div className="flex items-center gap-1.5">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<IosButton variant="bordered" className="flex items-center gap-1 h-8 px-3 py-1.5 text-xs">
								Login
								<ChevronDown className="h-3 w-3" />
							</IosButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" sideOffset={8} className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 min-w-[180px] shadow-2xl">
							<DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
								<Link href="/sign-in?redirect_url=/chat-platform" className="flex items-center gap-3">
									<span>Chatbot App</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
								<Link href="/sign-in?redirect_url=/api-platform/orgs" className="flex items-center gap-3">
									<span>API Platform</span>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<AuroraButton className="flex items-center gap-1 h-8 px-3 py-1.5 text-xs min-w-[80px]">
								Get Started
								<ChevronDown className="h-3 w-3" />
							</AuroraButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" sideOffset={8} className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 min-w-[180px] shadow-2xl">
							<DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
								<Link href="/sign-up?redirect_url=/chat-platform" className="flex items-center gap-3">
									<span>Chatbot App</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
								<Link href="/sign-up?redirect_url=/api-platform/post-sign-up" className="flex items-center gap-3">
									<span>API Platform</span>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</SignedOut>

			<SignedIn>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<IosButton variant="bordered" className="flex items-center gap-1 h-8 px-3 py-1.5 text-xs">
							My Account
							<ChevronDown className="h-3 w-3" />
						</IosButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" sideOffset={8} className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 min-w-[180px] shadow-2xl">
						<DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
							<LoadingLink href="/chat-platform" className="flex items-center gap-3">
								<span>Chatbot App</span>
							</LoadingLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
							<LoadingLink href="/api-platform/orgs" className="flex items-center gap-3">
								<span>API Platform</span>
							</LoadingLink>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SignedIn>
		</div>
	);
}
