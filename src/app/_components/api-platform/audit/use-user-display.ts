import { api } from "@/trpc/react";

/**
 * Get user initials from email or ID as fallback
 */
export function getUserInitials(identifier: string): string {
	// If it's an email, extract name part
	if (identifier.includes("@")) {
		const namePart = identifier.split("@")[0];
		const parts = namePart?.split(/[._-]/);
		if (parts && parts.length >= 2) {
			return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
		}
		return (namePart?.slice(0, 2) ?? "??").toUpperCase();
	}

	// If it's a name, get first letters
	const parts = identifier.split(" ");
	if (parts.length >= 2) {
		return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
	}

	// Fallback to first two characters of user ID
	return (identifier.slice(0, 2) || "??").toUpperCase();
}

/**
 * Hook to fetch and format user display information
 */
export function useUserDisplay(userId: string) {
	const { data: user } = api.users.getById.useQuery(
		{ userId },
		{
			enabled: !!userId,
			staleTime: 60000, // Cache for 1 minute
			retry: false, // Don't retry if user not found
		},
	);

	const displayName = user?.firstName
		? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
		: user?.emailAddresses?.[0]?.emailAddress || userId;

	const initials = user?.firstName
		? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
		: getUserInitials(userId);

	return {
		user,
		displayName,
		initials,
		imageUrl: user?.imageUrl,
	};
}
