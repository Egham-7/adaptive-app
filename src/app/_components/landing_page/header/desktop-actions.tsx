import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { GitHubStarsButton } from "@/components/animate-ui/buttons/github-stars";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingLink } from "./loading-link";
import type { IconMenuItem } from "./types";

type DesktopActionsProps = {
	iconMenuItems: IconMenuItem[];
};

export function DesktopActions({ iconMenuItems }: DesktopActionsProps) {
	return (
		<div className="hidden shrink-0 items-center justify-end gap-2 lg:flex">
			{iconMenuItems.map((item) => {
				const Icon = item.icon;
				return (
					<a
						key={item.name}
						href={item.href}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent-foreground"
					>
						<Icon aria-hidden={true} size={16} />
						<span className="text-sm">{item.name}</span>
					</a>
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
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-1 font-medium hover:bg-primary/50 hover:text-primary-foreground"
							>
								Login
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href="/sign-in?redirect_url=/chat-platform">
									<Button variant="ghost" className="w-full justify-start">
										Chatbot App
									</Button>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/sign-in?redirect_url=/api-platform/orgs">
									<Button variant="ghost" className="w-full justify-start">
										API Platform
									</Button>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								className="bg-primary font-medium text-primary-foreground shadow-subtle transition-opacity hover:opacity-90"
							>
								Get Started
								<ChevronDown className="ml-1 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href="/sign-up?redirect_url=/chat-platform">
									<Button variant="ghost" className="w-full justify-start">
										Chatbot App
									</Button>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/sign-up?redirect_url=/api-platform/orgs">
									<Button variant="ghost" className="w-full justify-start">
										API Platform
									</Button>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</SignedOut>

			<SignedIn>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-1 font-medium hover:bg-primary/50 hover:text-primary-foreground"
						>
							My Account
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<LoadingLink href="/chat-platform">
								<Button variant="ghost" className="w-full justify-start">
									Chatbot App
								</Button>
							</LoadingLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<LoadingLink href="/api-platform/orgs">
								<Button variant="ghost" className="w-full justify-start">
									API Platform
								</Button>
							</LoadingLink>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SignedIn>
		</div>
	);
}
