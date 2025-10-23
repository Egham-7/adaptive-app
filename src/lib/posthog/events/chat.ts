/**
 * Chat Event Tracking
 * Track chat platform interactions and conversations
 */

import { captureEvent } from "../client";
import type {
	ChatConversationActionProps,
	ChatConversationCreatedProps,
	ChatConversationViewedProps,
	ChatMessageActionProps,
	ChatMessageReceivedProps,
	ChatMessageSentProps,
	DailyMessageLimitReachedProps,
} from "../types";

/**
 * Track conversation creation
 */
export function trackChatConversationCreated(
	props: ChatConversationCreatedProps,
): void {
	captureEvent("chat_conversation_created", props);
}

/**
 * Track conversation view
 */
export function trackChatConversationViewed(
	props: ChatConversationViewedProps,
): void {
	captureEvent("chat_conversation_viewed", props);
}

/**
 * Track message sent by user
 */
export function trackChatMessageSent(props: ChatMessageSentProps): void {
	captureEvent("chat_message_sent", props);
}

/**
 * Track AI response received
 */
export function trackChatMessageReceived(
	props: ChatMessageReceivedProps,
): void {
	captureEvent("chat_message_received", props);
}

/**
 * Track suggestion clicked
 */
export function trackChatSuggestionClicked(props: {
	conversationId: string;
	suggestionText: string;
}): void {
	captureEvent("chat_suggestion_clicked", props);
}

/**
 * Track message copied
 */
export function trackChatMessageCopied(props: ChatMessageActionProps): void {
	captureEvent("chat_message_copied", {
		...props,
		action: "copied",
	});
}

/**
 * Track message regenerated
 */
export function trackChatMessageRegenerated(
	props: ChatMessageActionProps,
): void {
	captureEvent("chat_message_regenerated", {
		...props,
		action: "regenerated",
	});
}

/**
 * Track message deleted
 */
export function trackChatMessageDeleted(props: ChatMessageActionProps): void {
	captureEvent("chat_message_deleted", {
		...props,
		action: "deleted",
	});
}

/**
 * Track conversation renamed
 */
export function trackChatConversationRenamed(
	props: ChatConversationActionProps,
): void {
	captureEvent("chat_conversation_renamed", {
		...props,
		action: "renamed",
	});
}

/**
 * Track conversation deleted
 */
export function trackChatConversationDeleted(
	props: ChatConversationActionProps,
): void {
	captureEvent("chat_conversation_deleted", {
		...props,
		action: "deleted",
	});
}

/**
 * Track conversation pinned
 */
export function trackChatConversationPinned(
	props: ChatConversationActionProps,
): void {
	captureEvent("chat_conversation_pinned", {
		...props,
		action: "pinned",
	});
}

/**
 * Track conversation unpinned
 */
export function trackChatConversationUnpinned(
	props: ChatConversationActionProps,
): void {
	captureEvent("chat_conversation_unpinned", {
		...props,
		action: "unpinned",
	});
}

/**
 * Track daily message limit reached
 */
export function trackDailyMessageLimitReached(
	props: DailyMessageLimitReachedProps,
): void {
	captureEvent("daily_message_limit_reached", props);
}

/**
 * Track upgrade prompt shown
 */
export function trackUpgradePrompted(props?: {
	context?: "daily_limit" | "feature_locked" | "credit_depleted";
}): void {
	captureEvent("upgrade_prompted", props);
}
