import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { ProjectCreateResponse } from "@/types/projects";

type CreateProjectOptions = {
	onSuccess?: (data: ProjectCreateResponse) => void;
};

export const useCreateProject = (options?: CreateProjectOptions) => {
	const utils = api.useUtils();

	return api.projects.create.useMutation({
		onSuccess: (data) => {
			toast.success("Project created successfully!");
			utils.projects.getByOrganization.invalidate();
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create project");
		},
	});
};
