import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useUpdateProject = () => {
	const utils = api.useUtils();

	return api.projects.update.useMutation({
		onMutate: async (variables) => {
			// Cancel any outgoing refetches
			await utils.projects.getByOrganization.cancel();
			await utils.projects.getById.cancel({ id: variables.id });

			// Snapshot the previous values
			const previousProject = utils.projects.getById.getData({
				id: variables.id,
			});

			if (!previousProject) return;

			const previousProjects = utils.projects.getByOrganization.getData({
				organizationId: previousProject.organization_id,
			});

			// Optimistically update to the new values
			const optimisticProject = { ...previousProject, ...variables };
			utils.projects.getById.setData({ id: variables.id }, optimisticProject);

			utils.projects.getByOrganization.setData(
				{ organizationId: previousProject.organization_id },
				(old) => {
					if (!old) return old;
					return old.map((project) =>
						project.id === variables.id ? optimisticProject : project,
					);
				},
			);

			// Return context object with the snapshotted values
			return {
				previousProjects,
				previousProject,
				organizationId: previousProject.organization_id,
			};
		},
		onSuccess: (_data, variables) => {
			toast.success("Project updated successfully!");
			utils.projects.getByOrganization.invalidate();
			utils.projects.getById.invalidate({ id: variables.id });
		},
		onError: (error, variables, context) => {
			toast.error(error.message || "Failed to update project");
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousProjects && context.organizationId) {
				utils.projects.getByOrganization.setData(
					{ organizationId: context.organizationId },
					context.previousProjects,
				);
			}
			if (context?.previousProject) {
				utils.projects.getById.setData(
					{ id: variables.id },
					context.previousProject,
				);
			}
		},
		onSettled: (_data, _error, variables) => {
			utils.projects.getByOrganization.invalidate();
			utils.projects.getById.invalidate({ id: variables.id });
		},
	});
};
