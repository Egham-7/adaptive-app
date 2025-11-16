"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/trpc/react";

export function useTourCompletion(tourId: string) {
	const { user, isLoaded } = useUser();
	const { data: preferences, isPending } = api.user.getPreferences.useQuery(
		undefined,
		{
			enabled: isLoaded && !!user,
		},
	);

	const [completedTours, setCompletedToursState] = useState<string[]>([]);

	// Update local state when preferences are loaded
	useEffect(() => {
		if (preferences?.completedTours !== undefined) {
			setCompletedToursState(preferences.completedTours as string[]);
		}
	}, [preferences?.completedTours]);

	const updateMetadataMutation = api.user.updateMetadata.useMutation();

	// Check if this specific tour is completed
	const isCompleted = completedTours.includes(tourId);

	// Mark this tour as complete
	const markComplete = useCallback(async () => {
		if (!user || completedTours.includes(tourId)) return;

		const updatedTours = [...completedTours, tourId];

		try {
			setCompletedToursState(updatedTours);
			await updateMetadataMutation.mutateAsync({
				completedTours: updatedTours,
			});

			// Update the user's metadata in Clerk
			await user.reload();
		} catch (error) {
			console.error("Failed to update tour completion state:", error);
			// Revert on error
			setCompletedToursState(completedTours);
		}
	}, [user, tourId, completedTours, updateMetadataMutation]);

	return {
		isCompleted,
		markComplete,
		isLoading: !isLoaded || isPending || updateMetadataMutation.isPending,
		completedTours,
	};
}
