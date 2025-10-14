import { api } from "@/trpc/react";

export const useProjectMembers = (projectId: number) => {
	return api.projects.listMembers.useQuery(
		{ projectId },
		{
			enabled: !!projectId && !Number.isNaN(projectId),
		},
	);
};
