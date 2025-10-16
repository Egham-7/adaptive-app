import { api } from "@/trpc/react";

export const useProject = (id: number) => {
	return api.projects.getById.useQuery(
		{ id },
		{
			enabled: !!id && !Number.isNaN(id),
			staleTime: 5 * 60 * 1000,
		},
	);
};
