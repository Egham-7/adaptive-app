import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LoadingLink } from "./loading-link";

type MobileAuthActionsProps = {
	closeMenu: () => void;
};

export function MobileAuthActions({ closeMenu }: MobileAuthActionsProps) {
	return (
		<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2.5 sm:space-y-0 md:w-fit lg:hidden">
			<SignedOut>
				<div className="flex w-full flex-col space-y-3 sm:flex-row sm:space-y-0 sm:[&>*]:flex-1">
					<Button asChild variant="outline" size="sm" className="w-full">
						<LoadingLink
							href="/sign-in?redirect_url=/chat-platform"
							onNavigate={closeMenu}
						>
							Login
						</LoadingLink>
					</Button>
					<Button asChild size="sm" className="w-full sm:flex-1">
						<LoadingLink
							href="/sign-up?redirect_url=/chat-platform"
							onNavigate={closeMenu}
						>
							Get Started
						</LoadingLink>
					</Button>
				</div>
			</SignedOut>

			<SignedIn>
				<div className="flex w-full flex-col space-y-3 sm:flex-row sm:space-y-0 sm:[&>*]:flex-1">
					<Button asChild variant="outline" size="sm" className="w-full">
						<LoadingLink href="/chat-platform" onNavigate={closeMenu}>
							Dashboard
						</LoadingLink>
					</Button>
					<Button asChild size="sm" className="w-full sm:flex-1">
						<LoadingLink
							href="/sign-up?redirect_url=/api-platform/post-sign-up"
							onNavigate={closeMenu}
						>
							API Platform
						</LoadingLink>
					</Button>
				</div>
			</SignedIn>
		</div>
	);
}
