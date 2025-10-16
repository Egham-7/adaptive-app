import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useDeleteOrganization = () => {
	const _utils = api.useUtils();

	return api.organizations.delete.useMutation({
		onSuccess: () => {
			toast.success("Organization deleted successfully!");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete organization");
		},
	});
};
