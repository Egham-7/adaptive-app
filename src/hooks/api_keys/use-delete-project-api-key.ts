import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useDeleteProjectApiKey = () => {
	const utils = api.useUtils();

	return api.api_keys.delete.useMutation({
		onSuccess: (data) => {
			toast.success("API key deleted successfully!");

			return data;
		},
		onSettled: () => {
			utils.api_keys.list.invalidate();
			utils.api_keys.getByProject.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create API key");
		},
	});
};
