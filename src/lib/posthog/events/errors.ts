/**
 * Error Event Tracking
 * Track application errors and failure scenarios
 */

import { captureEvent } from '../client';
import type { ErrorEventProps, ErrorType } from '../types';

/**
 * Track generic error
 */
export function trackError(props: ErrorEventProps): void {
  captureEvent('error_occurred', props);
}

/**
 * Track organization creation error
 */
export function trackOrganizationCreationError(props: {
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'organization_creation',
    ...props,
  });
}

/**
 * Track project creation error
 */
export function trackProjectCreationError(props: {
  organizationId: string;
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'project_creation',
    ...props,
  });
}

/**
 * Track API key generation error
 */
export function trackApiKeyGenerationError(props: {
  projectId: string;
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'api_key_generation',
    ...props,
  });
}

/**
 * Track chat message error
 */
export function trackChatMessageError(props: {
  conversationId: string;
  errorMessage: string;
  errorCode?: string;
  retryCount?: number;
}): void {
  trackError({
    errorType: 'chat_message',
    ...props,
  });
}

/**
 * Track API request error
 */
export function trackApiRequestError(props: {
  endpoint: string;
  statusCode: number;
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'api_request',
    ...props,
  });
}

/**
 * Track checkout session error
 */
export function trackCheckoutSessionError(props: {
  priceId?: string;
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'checkout_session',
    ...props,
  });
}

/**
 * Track subscription validation error
 */
export function trackSubscriptionValidationError(props: {
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'subscription_validation',
    ...props,
  });
}

/**
 * Track authentication error
 */
export function trackAuthenticationError(props: {
  attemptedPath?: string;
  errorMessage: string;
  errorCode?: string;
}): void {
  trackError({
    errorType: 'authentication',
    ...props,
  });
}

/**
 * Track rate limit exceeded
 */
export function trackRateLimitExceeded(props: {
  endpoint: string;
  retryAfter?: number;
}): void {
  trackError({
    errorType: 'rate_limit',
    endpoint: props.endpoint,
    errorMessage: 'Rate limit exceeded',
    retryCount: props.retryAfter,
  });
}

/**
 * Track insufficient credits
 */
export function trackInsufficientCredits(props: {
  organizationId: string;
  required?: number;
  available?: number;
}): void {
  trackError({
    errorType: 'credit_insufficient',
    errorMessage: `Insufficient credits: required ${props.required}, available ${props.available}`,
  });
}
