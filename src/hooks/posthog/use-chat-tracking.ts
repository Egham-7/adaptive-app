'use client';

/**
 * Chat Tracking Hook
 * React hooks for tracking chat platform events
 */

import { useCallback } from 'react';
import {
  trackChatConversationCreated,
  trackChatConversationViewed,
  trackChatMessageSent,
  trackChatMessageReceived,
  trackChatSuggestionClicked,
  trackChatMessageCopied,
  trackChatMessageRegenerated,
  trackChatMessageDeleted,
  trackChatConversationRenamed,
  trackChatConversationDeleted,
  trackChatConversationPinned,
  trackChatConversationUnpinned,
  trackDailyMessageLimitReached,
  trackUpgradePrompted,
} from '@/lib/posthog/events/chat';
import type {
  ChatConversationCreatedProps,
  ChatConversationViewedProps,
  ChatMessageSentProps,
  ChatMessageReceivedProps,
  ChatMessageActionProps,
  ChatConversationActionProps,
  DailyMessageLimitReachedProps,
} from '@/lib/posthog/types';

export function useChatTracking() {
  const handleConversationCreated = useCallback((props: ChatConversationCreatedProps) => {
    trackChatConversationCreated(props);
  }, []);

  const handleConversationViewed = useCallback((props: ChatConversationViewedProps) => {
    trackChatConversationViewed(props);
  }, []);

  const handleMessageSent = useCallback((props: ChatMessageSentProps) => {
    trackChatMessageSent(props);
  }, []);

  const handleMessageReceived = useCallback((props: ChatMessageReceivedProps) => {
    trackChatMessageReceived(props);
  }, []);

  const handleSuggestionClicked = useCallback(
    (props: { conversationId: string; suggestionText: string }) => {
      trackChatSuggestionClicked(props);
    },
    []
  );

  const handleMessageCopied = useCallback((conversationId: string, messageId: string) => {
    trackChatMessageCopied({ conversationId, messageId, action: 'copied' });
  }, []);

  const handleMessageRegenerated = useCallback((conversationId: string, messageId: string) => {
    trackChatMessageRegenerated({ conversationId, messageId, action: 'regenerated' });
  }, []);

  const handleMessageDeleted = useCallback((conversationId: string, messageId: string) => {
    trackChatMessageDeleted({ conversationId, messageId, action: 'deleted' });
  }, []);

  const handleConversationRenamed = useCallback(
    (conversationId: string) => {
      trackChatConversationRenamed({ conversationId, action: 'renamed' });
    },
    []
  );

  const handleConversationDeleted = useCallback(
    (conversationId: string) => {
      trackChatConversationDeleted({ conversationId, action: 'deleted' });
    },
    []
  );

  const handleConversationPinned = useCallback((conversationId: string) => {
    trackChatConversationPinned({ conversationId, action: 'pinned' });
  }, []);

  const handleConversationUnpinned = useCallback(
    (conversationId: string) => {
      trackChatConversationUnpinned({ conversationId, action: 'unpinned' });
    },
    []
  );

  const handleDailyLimitReached = useCallback((props: DailyMessageLimitReachedProps) => {
    trackDailyMessageLimitReached(props);
  }, []);

  const handleUpgradePrompted = useCallback(
    (props?: { context?: 'daily_limit' | 'feature_locked' | 'credit_depleted' }) => {
      trackUpgradePrompted(props);
    },
    []
  );

  return {
    trackConversationCreated: handleConversationCreated,
    trackConversationViewed: handleConversationViewed,
    trackMessageSent: handleMessageSent,
    trackMessageReceived: handleMessageReceived,
    trackSuggestionClicked: handleSuggestionClicked,
    trackMessageCopied: handleMessageCopied,
    trackMessageRegenerated: handleMessageRegenerated,
    trackMessageDeleted: handleMessageDeleted,
    trackConversationRenamed: handleConversationRenamed,
    trackConversationDeleted: handleConversationDeleted,
    trackConversationPinned: handleConversationPinned,
    trackConversationUnpinned: handleConversationUnpinned,
    trackDailyLimitReached: handleDailyLimitReached,
    trackUpgradePrompted: handleUpgradePrompted,
  };
}
