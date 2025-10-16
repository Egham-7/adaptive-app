import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useRemoveProjectMember = () => {
	const utils = api.useUtils();

	return api.projects.removeMember.useMutation({
		onMutate: async (variables) => {
			await utils.projects.listMembers.cancel({
				projectId: variables.projectId,
			});

			const previousMembers = utils.projects.listMembers.getData({
				projectId: variables.projectId,
			});

			utils.projects.listMembers.setData(
				{ projectId: variables.projectId },
				(old) => {
					if (!old) return old;
					return old.filter((m) => m.user_id !== variables.userId);
				},
			);

			return { previousMembers, projectId: variables.projectId };
		},
		onSuccess: (_data, variables) => {
			toast.success("Member removed successfully!");
			utils.projects.listMembers.invalidate({ projectId: variables.projectId });
			utils.projects.getById.invalidate({ id: variables.projectId });
		},
		onError: (error, _variables, context) => {
			toast.error(error.message || "Failed to remove member");
			if (context?.previousMembers && context.projectId) {
				utils.projects.listMembers.setData(
					{ projectId: context.projectId },
					context.previousMembers,
				);
			}
		},
		onSettled: (_data, _error, variables) => {
			utils.projects.listMembers.invalidate({ projectId: variables.projectId });
			utils.projects.getById.invalidate({ id: variables.projectId });
		},
	});
};
