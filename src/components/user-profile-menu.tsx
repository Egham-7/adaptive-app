"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthTracking } from "@/hooks/posthog/use-auth-tracking";

export function UserProfileMenu() {
	const { user } = useUser();
	const { signOut } = useAuth();
	const { trackSignOut } = useAuthTracking();

	if (!user) {
		return null;
	}

	const displayName =
		user.fullName ?? user.username ?? user.firstName ?? "Account";
	const email =
		user.primaryEmailAddress?.emailAddress ??
		user.emailAddresses?.[0]?.emailAddress ??
		"";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="rounded-full border border-input p-0">
					<Avatar className="h-10 w-10">
						<AvatarImage src={user.imageUrl || undefined} alt={displayName} />
						<AvatarFallback className="text-base">
							{user.firstName?.[0] ?? user.lastName?.[0] ?? "U"}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="flex flex-col gap-1">
					<span className="font-medium text-sm leading-none">
						{displayName}
					</span>
					{email && (
						<span className="text-muted-foreground text-xs">{email}</span>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() => {
						trackSignOut();
						void signOut();
					}}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
