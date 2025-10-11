import { TRPCError } from "@trpc/server";
import { endOfDay, startOfDay } from "date-fns";
import type {
	Conversation,
	Message,
	Prisma,
	PrismaClient,
} from "prisma/generated";
import type { CreateMessageInput, UpdateMessageInput } from "@/types/messages";

export const DAILY_MESSAGE_LIMIT = 7;

export async function getDailyMessageCount(
	db: PrismaClient,
	userId: string,
): Promise<number> {
	const today = new Date();
	const startOfToday = startOfDay(today);
	const endOfToday = endOfDay(today);

	const messageCount = await db.message.count({
		where: {
			conversation: {
				userId: userId,
			},
			role: "user", // Only count user messages, not AI responses
			createdAt: {
				gte: startOfToday,
				lte: endOfToday,
			},
			deletedAt: null,
		},
	});

	return messageCount;
}

export async function hasReachedDailyLimit(
	db: PrismaClient,
	userId: string,
): Promise<boolean> {
	const messageCount = await getDailyMessageCount(db, userId);
	return messageCount >= DAILY_MESSAGE_LIMIT;
}

export async function getRemainingMessages(
	db: PrismaClient,
	userId: string,
): Promise<number> {
	const messageCount = await getDailyMessageCount(db, userId);
	return Math.max(0, DAILY_MESSAGE_LIMIT - messageCount);
}

// Validation functions
export const validateConversationAccess = (
	conversation: Conversation | null,
): Conversation => {
	if (!conversation) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Conversation not found or you do not have access.",
		});
	}
	return conversation;
};

export const validateMessageAccess = (message: Message | null): Message => {
	if (!message) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Message not found or you do not have access.",
		});
	}
	return message;
};

// Data transformation functions
export const createMessageData = (
	input: Omit<CreateMessageInput, "conversationId">,
	conversationId: number,
) => ({
	id: input.id,
	role: input.role,
	metadata: input.metadata as Prisma.InputJsonValue | undefined,
	annotations: input.annotations as Prisma.InputJsonValue | undefined,
	parts: input.parts as Prisma.InputJsonValue,
	conversation: { connect: { id: conversationId } },
	...(input.createdAt && { createdAt: new Date(input.createdAt) }),
});

export const updateMessageData = (input: Omit<UpdateMessageInput, "id">) => ({
	metadata: input.metadata as Prisma.InputJsonValue | undefined,
	annotations: input.annotations as Prisma.InputJsonValue | undefined,
	parts: input.parts as Prisma.InputJsonValue | undefined,
	updatedAt: new Date(),
});

// Database operations
export const findConversationByUserAndId = (
	db: PrismaClient,
	conversationId: number,
	userId: string,
) =>
	db.conversation.findUnique({
		where: {
			id: conversationId,
			userId: userId,
		},
	});

export const findMessageByUserAndId = (
	db: PrismaClient,
	messageId: string,
	userId: string,
) =>
	db.message.findUnique({
		where: {
			id: messageId,
			conversation: {
				userId: userId,
			},
		},
	});

export const findMessageWithConversationAccess = (
	db: PrismaClient,
	messageId: string,
	userId: string,
) =>
	db.message.findFirst({
		where: {
			id: messageId,
			deletedAt: null,
			conversation: { userId, deletedAt: null },
		},
	});

// Composed operations
export const createMessageWithTimestampUpdate = async (
	db: PrismaClient,
	messageData: ReturnType<typeof createMessageData>,
	conversationId: number,
) => {
	return db.$transaction(async (tx) => {
		const newMessage = await tx.message.create({ data: messageData });
		await tx.conversation.update({
			where: { id: conversationId },
			data: { updatedAt: new Date() },
		});
		return newMessage;
	});
};

export const updateMessageWithTimestampUpdate = async (
	db: PrismaClient,
	messageId: string,
	updateData: ReturnType<typeof updateMessageData>,
	conversationId: number,
) => {
	return db.$transaction(async (tx) => {
		const updatedMessage = await tx.message.update({
			where: { id: messageId },
			data: updateData,
		});
		await tx.conversation.update({
			where: { id: conversationId },
			data: { updatedAt: new Date() },
		});
		return updatedMessage;
	});
};

export const softDeleteMessageWithTimestampUpdate = async (
	db: PrismaClient,
	messageId: string,
	conversationId: number,
) => {
	return db.$transaction(async (tx) => {
		const deletedMessage = await tx.message.update({
			where: { id: messageId },
			data: { deletedAt: new Date() },
		});
		await tx.conversation.update({
			where: { id: conversationId },
			data: { updatedAt: new Date() },
		});
		return deletedMessage;
	});
};
