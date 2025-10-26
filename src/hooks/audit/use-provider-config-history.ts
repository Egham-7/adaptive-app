import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { AuditHistoryEntry } from "@/types/audit-log";
import type { GetProviderHistoryApiResponse } from "@/types/providers";

/**
 * Hook to fetch and transform provider config history into generic audit format
 *
 * @param configId - The provider config ID
 * @returns Audit history entries, loading state, and error
 */
export function useProviderConfigHistory(configId: number | null) {
	const query = api.providerConfigs.getProviderHistory.useQuery(
		{ configId: configId ?? 0 },
		{
			enabled: configId !== null,
			staleTime: 30000, // 30 seconds
		},
	);

	// Transform API response to generic audit history format
	const transformedData: AuditHistoryEntry[] = useMemo(() => {
		if (!query.data?.history) return [];

		return query.data.history.map(
			(entry: GetProviderHistoryApiResponse["history"][number]) => ({
				id: entry.id,
				action: entry.action,
				changes: entry.changes,
				changed_by: entry.changed_by,
				changed_at: entry.changed_at,
				entity_type: "provider_config",
				entity_id: entry.config_id,
			}),
		);
	}, [query.data]);

	return {
		data: transformedData,
		isLoading: query.isLoading,
		error: query.error?.message,
		refetch: query.refetch,
	};
}
