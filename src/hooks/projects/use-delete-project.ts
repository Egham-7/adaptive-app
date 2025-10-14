import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useDeleteProject = () => {
	const utils = api.useUtils();

	return api.projects.delete.useMutation({
		onMutate: async (variables) => {
			// Cancel any outgoing refetches
			await utils.projects.getByOrganization.cancel();

			// Get the project to delete for the organizationId
			const projectToDelete = utils.projects.getById?.getData?.({
				id: variables.id,
			});

			if (!projectToDelete) return;

			// Snapshot the previous value
			const previousProjects = utils.projects.getByOrganization.getData({
				organizationId: projectToDelete.organization_id,
			});

			// Optimistically update to the new value
			utils.projects.getByOrganization.setData(
				{ organizationId: projectToDelete.organization_id },
				(oldData) => {
					if (!oldData) return oldData;
					return oldData.filter((project) => project.id !== variables.id);
				},
			);

			// Return context object with the snapshotted value
			return {
				previousProjects,
				organizationId: projectToDelete.organization_id,
			};
		},
		onSuccess: () => {
			toast.success("Project deleted successfully!");
			utils.projects.getByOrganization.invalidate();
		},
		onError: (error, _variables, context) => {
			toast.error(error.message || "Failed to delete project");
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousProjects && context.organizationId) {
				utils.projects.getByOrganization.setData(
					{ organizationId: context.organizationId },
					context.previousProjects,
				);
			}
		},
		onSettled: (_data, _error, _variables) => {
			utils.projects.getByOrganization.invalidate();
		},
	});
};
