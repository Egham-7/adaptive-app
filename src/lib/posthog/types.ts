/**
 * PostHog Event Tracking Types
 * Comprehensive type definitions for all tracked events across the application
 */

// ============================================================================
// Base Types
// ============================================================================

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

export interface BaseEventContext {
  timestamp?: string;
  sessionId?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// ============================================================================
// Authentication Events
// ============================================================================

export interface SignUpEventProps extends BaseEventContext {
  signupSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referralCode?: string;
}

export interface SignInEventProps extends BaseEventContext {
  signInMethod?: string;
}

export interface UnauthorizedAccessEventProps extends BaseEventContext {
  attemptedPath?: string;
  requiredRole?: string;
}

// ============================================================================
// Onboarding Events
// ============================================================================

export type OnboardingStep = 'welcome' | 'project' | 'api_key' | 'quickstart' | 'complete';

export interface OnboardingStepViewedProps extends BaseEventContext {
  step: OnboardingStep;
  stepNumber: number;
}

export interface OnboardingCompletedProps {
  projectId?: string;
  hasApiKey: boolean;
  skippedSteps?: OnboardingStep[];
  completionTimeSeconds?: number;
  timestamp?: string;
  sessionId?: string;
}

export interface PromotionalCreditsAddedProps extends BaseEventContext {
  amount: number;
  isFirstOrg: boolean;
  userCountAtSignup: number;
}

// ============================================================================
// Organization Events
// ============================================================================

export interface OrganizationCreatedProps extends BaseEventContext {
  organizationId: string;
  organizationName: string;
}

export interface OrganizationViewedProps extends BaseEventContext {
  organizationId: string;
}

export interface OrganizationDeletedProps extends BaseEventContext {
  organizationId: string;
  projectCount?: number;
  memberCount?: number;
}

export interface MemberInvitedProps extends BaseEventContext {
  organizationId: string;
  email: string;
  role: string;
  inviteResult: 'success' | 'failed' | 'already_exists';
}

export interface MemberRoleChangedProps extends BaseEventContext {
  organizationId: string;
  memberId: string;
  oldRole: string;
  newRole: string;
}

export interface TeamMemberRemovedProps extends BaseEventContext {
  organizationId: string;
  memberId: string;
  role?: string;
}

// ============================================================================
// Project Events
// ============================================================================

export interface ProjectCreatedProps extends BaseEventContext {
  projectId: string;
  organizationId: string;
  projectName: string;
  description?: string;
}

export interface ProjectViewedProps extends BaseEventContext {
  projectId: string;
  organizationId: string;
}

export interface ProjectDeletedProps extends BaseEventContext {
  projectId: string;
  organizationId: string;
  apiKeyCount?: number;
}

export interface ProjectSettingsUpdatedProps {
  projectId: string;
  organizationId: string;
  settingsChanged?: string[];
  timestamp?: string;
  sessionId?: string;
}

// ============================================================================
// API Key Events
// ============================================================================

export interface ApiKeyCreatedProps extends BaseEventContext {
  projectId: string;
  organizationId: string;
  keyName: string;
  expirationDate?: string;
}

export interface ApiKeyRevokedProps extends BaseEventContext {
  keyId: string;
  projectId: string;
  reason?: string;
}

export interface ApiKeyDeletedProps extends BaseEventContext {
  keyId: string;
  projectId: string;
}

export interface ApiKeyCopiedProps extends BaseEventContext {
  keyId: string;
  projectId: string;
}

// ============================================================================
// Chat Events
// ============================================================================

export interface ChatConversationCreatedProps extends BaseEventContext {
  conversationId: string;
}

export interface ChatConversationViewedProps extends BaseEventContext {
  conversationId: string;
  messageCount?: number;
}

export interface ChatMessageSentProps extends BaseEventContext {
  conversationId: string;
  messageLength: number;
  hasAttachments: boolean;
  provider?: string;
  model?: string;
}

export interface ChatMessageReceivedProps extends BaseEventContext {
  conversationId: string;
  provider: string;
  model: string;
  tokenCount?: number;
  cost?: number;
  responseTimeMs?: number;
}

export interface ChatMessageActionProps extends BaseEventContext {
  conversationId: string;
  messageId: string;
  action: 'copied' | 'regenerated' | 'deleted' | 'edited';
}

export interface ChatConversationActionProps extends BaseEventContext {
  conversationId: string;
  action: 'renamed' | 'deleted' | 'pinned' | 'unpinned';
}

export interface DailyMessageLimitReachedProps extends BaseEventContext {
  limitValue: number;
  remainingMessages: number;
}

// ============================================================================
// Billing & Subscription Events
// ============================================================================

export interface PricingPageViewedProps extends BaseEventContext {
  source?: string;
}

export interface BillingToggleSwitchedProps extends BaseEventContext {
  billingCycle: 'monthly' | 'annual';
}

export interface CheckoutSessionInitiatedProps extends BaseEventContext {
  priceId: string;
  planType: string;
  amount?: number;
}

export interface SubscriptionCreatedProps extends BaseEventContext {
  stripePriceId: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  planType?: string;
}

export interface SubscriptionChangedProps extends BaseEventContext {
  changeType: 'upgraded' | 'downgraded' | 'canceled' | 'renewed';
  oldPlanType?: string;
  newPlanType?: string;
  oldAmount?: number;
  newAmount?: number;
}

export interface PaymentFailedProps extends BaseEventContext {
  reason: string;
  amount: number;
  errorCode?: string;
}

export interface CreditPurchasedProps extends BaseEventContext {
  organizationId: string;
  amount: number;
  cost: number;
  transactionId?: string;
}

export interface PromotionalCreditAppliedProps extends BaseEventContext {
  organizationId: string;
  amount: number;
  reason?: string;
}

// ============================================================================
// Settings Events
// ============================================================================

export interface SettingsOpenedProps extends BaseEventContext {
  settingsType: 'profile' | 'organization' | 'project' | 'chat';
  organizationId?: string;
  projectId?: string;
}

export interface ProfileUpdatedProps {
  fieldsUpdated: string[];
  timestamp?: string;
  sessionId?: string;
}

export interface ThemeChangedProps extends BaseEventContext {
  theme: 'light' | 'dark' | 'system';
}

export interface ProviderConfiguredProps extends BaseEventContext {
  provider: string;
  context: 'chat' | 'organization';
  organizationId?: string;
}

export interface PreferencesSavedProps extends BaseEventContext {
  preferenceType: string;
  organizationId?: string;
  projectId?: string;
}

// ============================================================================
// Analytics & Dashboard Events
// ============================================================================

export interface UsageDashboardViewedProps extends BaseEventContext {
  projectId: string;
  organizationId: string;
  timeRange?: string;
}

export interface UsageChartViewedProps extends BaseEventContext {
  projectId: string;
  chartType: string;
  timeRange?: string;
}

export interface ProviderComparisonViewedProps {
  projectId: string;
  providers: string[];
  timestamp?: string;
  sessionId?: string;
}

export interface CostAnalysisGeneratedProps extends BaseEventContext {
  projectId: string;
  organizationId: string;
  totalCost?: number;
}

// ============================================================================
// Error Events
// ============================================================================

export type ErrorType =
  | 'organization_creation'
  | 'project_creation'
  | 'api_key_generation'
  | 'chat_message'
  | 'api_request'
  | 'checkout_session'
  | 'subscription_validation'
  | 'authentication'
  | 'rate_limit'
  | 'credit_insufficient';

export interface ErrorEventProps extends BaseEventContext {
  errorType: ErrorType;
  errorCode?: string;
  errorMessage?: string;
  statusCode?: number;
  endpoint?: string;
  retryCount?: number;
}

// ============================================================================
// Performance Events
// ============================================================================

export interface ApiResponseTimeProps extends BaseEventContext {
  endpoint: string;
  method: string;
  durationMs: number;
  statusCode: number;
}

export interface ChatResponseTimeProps extends BaseEventContext {
  conversationId: string;
  provider: string;
  model: string;
  tokenCount?: number;
  durationMs: number;
}

export interface PerformanceMetricProps extends BaseEventContext {
  metricName: string;
  value: number;
  unit: 'ms' | 's' | 'bytes' | 'count';
}

// ============================================================================
// Business Milestone Events
// ============================================================================

export interface UsageMilestoneProps extends BaseEventContext {
  milestone: string;
  milestoneValue: number;
  context?: 'chat' | 'api' | 'project' | 'organization';
}

export interface FeatureAdoptionProps extends BaseEventContext {
  featureName: string;
  organizationId?: string;
  projectId?: string;
}

export interface ConversionEventProps extends BaseEventContext {
  conversionType: 'free_to_paid' | 'trial_to_subscription';
  daysSinceSignup: number;
  triggerEvent?: string;
}

// ============================================================================
// Event Name Type Union (for type safety)
// ============================================================================

export type EventName =
  // Auth
  | 'sign_up'
  | 'sign_in'
  | 'sign_out'
  | 'unauthorized_access'
  // Onboarding
  | 'onboarding_step_viewed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'promotional_credits_added'
  // Organizations
  | 'organization_created'
  | 'organization_viewed'
  | 'organization_deleted'
  | 'organization_settings_opened'
  | 'member_invited'
  | 'member_role_changed'
  | 'team_member_removed'
  | 'invitation_accepted'
  | 'invitation_declined'
  // Projects
  | 'project_created'
  | 'project_viewed'
  | 'project_deleted'
  | 'project_dashboard_viewed'
  | 'project_settings_opened'
  | 'project_settings_updated'
  // API Keys
  | 'api_key_created'
  | 'api_key_viewed'
  | 'api_key_copied'
  | 'api_key_revoked'
  | 'api_key_deleted'
  // Chat
  | 'chat_conversation_created'
  | 'chat_conversation_viewed'
  | 'chat_message_sent'
  | 'chat_message_received'
  | 'chat_suggestion_clicked'
  | 'chat_message_copied'
  | 'chat_message_regenerated'
  | 'chat_message_deleted'
  | 'chat_conversation_renamed'
  | 'chat_conversation_deleted'
  | 'chat_conversation_pinned'
  | 'chat_conversation_unpinned'
  | 'daily_message_limit_reached'
  | 'upgrade_prompted'
  // Billing
  | 'pricing_page_viewed'
  | 'billing_toggle_switched'
  | 'checkout_session_initiated'
  | 'subscription_created'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'payment_failed'
  | 'credit_purchased'
  | 'promotional_credit_applied'
  // Settings
  | 'profile_settings_opened'
  | 'profile_updated'
  | 'theme_changed'
  | 'provider_configured'
  | 'provider_removed'
  | 'preferences_saved'
  // Analytics
  | 'usage_dashboard_viewed'
  | 'usage_chart_viewed'
  | 'provider_comparison_viewed'
  | 'cost_analysis_generated'
  // Errors
  | 'error_occurred'
  // Performance
  | 'api_response_time_recorded'
  | 'chat_response_time_recorded'
  | 'performance_metric_recorded'
  // Milestones
  | 'usage_milestone_reached'
  | 'feature_adoption'
  | 'conversion_event';
