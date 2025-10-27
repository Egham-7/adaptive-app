"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDisplay } from "./use-user-display";

/**
 * UserDisplay - Reusable component to display user avatar and name
 */
export function UserDisplay({ userId }: { userId: string }) {
	const { displayName, initials, imageUrl } = useUserDisplay(userId);

	return (
		<>
			<Avatar className="h-5 w-5">
				{imageUrl && <AvatarImage src={imageUrl} alt={displayName} />}
				<AvatarFallback className="text-xs">{initials}</AvatarFallback>
			</Avatar>
			<span className="truncate">{displayName}</span>
		</>
	);
}
