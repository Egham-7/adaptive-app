import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useCreateProject = () => {
	const utils = api.useUtils();

	return api.projects.create.useMutation({
		onSuccess: () => {
			toast.success("Project created successfully!");
			utils.projects.getByOrganization.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create project");
		},
	});
};
