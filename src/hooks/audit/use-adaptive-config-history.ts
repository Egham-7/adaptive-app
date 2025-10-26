import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { AdaptiveConfigHistoryEntry } from "@/types/adaptive-config";
import type { AuditHistoryEntry } from "@/types/audit-log";

/**
 * Hook to fetch and transform adaptive config history into generic audit format
 *
 * @param configId - The adaptive config ID
 * @returns Audit history entries, loading state, and error
 */
export function useAdaptiveConfigHistory(configId: number | null) {
	const query = api.adaptiveConfig.getAdaptiveConfigHistory.useQuery(
		{ configId: configId ?? 0 },
		{
			enabled: configId !== null,
			staleTime: 30000, // 30 seconds
		},
	);

	// Transform API response to generic audit history format
	const transformedData: AuditHistoryEntry[] = useMemo(() => {
		if (!query.data?.history) return [];

		return query.data.history.map((entry: AdaptiveConfigHistoryEntry) => ({
			id: entry.id,
			action: entry.action,
			changes: entry.changes,
			changed_by: entry.changed_by,
			changed_at: entry.changed_at,
			entity_type: "adaptive_config",
			entity_id: entry.config_id,
		}));
	}, [query.data]);

	return {
		data: transformedData,
		isLoading: query.isLoading,
		error: query.error?.message,
		refetch: query.refetch,
	};
}
