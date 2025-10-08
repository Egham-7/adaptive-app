import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { api } from "@/trpc/react";

type ConversationListOutput =
	inferRouterOutputs<AppRouter>["conversations"]["list"];

export const useConversations = (
	initialConversations: ConversationListOutput,
) => {
	const { data: conversations, ...rest } = api.conversations.list.useQuery(
		undefined,
		{
			initialData: initialConversations,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		},
	);

	return { conversations, ...rest };
};
