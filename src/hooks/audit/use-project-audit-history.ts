import { api } from "@/trpc/react";

/**
 * Hook to fetch combined audit history for a project
 * Includes both provider configs and adaptive config changes
 *
 * @param projectId - The project ID
 * @returns Combined audit history entries, loading state, and error
 */
export function useProjectAuditHistory(projectId: number) {
	const { data, isLoading, error } =
		api.providerConfigs.getProjectHistory.useQuery(
			{ projectId },
			{ enabled: !!projectId },
		);

	return {
		data: data?.history ?? [],
		isLoading,
		error,
	};
}
