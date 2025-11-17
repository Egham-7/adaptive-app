import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useAddProjectMember = () => {
	const utils = api.useUtils();

	return api.projects.addMember.useMutation({
		onSuccess: (data, variables) => {
			toast.success("Member added successfully!");
			utils.projects.listMembers.invalidate({ projectId: variables.projectId });
			utils.projects.getById.invalidate({ id: variables.projectId });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to add member");
		},
	});
};
