import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useCreateOrganization = () => {
	const _utils = api.useUtils();

	return api.organizations.create.useMutation({
		onSuccess: () => {
			toast.success("Organization created successfully!");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create organization");
		},
	});
};
