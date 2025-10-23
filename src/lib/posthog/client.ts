/**
 * PostHog Client Wrapper
 * Centralized PostHog client with error handling and utilities
 */

import posthog from 'posthog-js';
import type { EventName, EventProperties } from './types';

/**
 * Check if PostHog is initialized and available
 */
export function isPostHogAvailable(): boolean {
  return typeof window !== 'undefined' && !!posthog;
}

/**
 * Safely capture an event with PostHog
 * Handles errors gracefully and logs in development mode
 */
export function captureEvent(
  eventName: EventName | string,
  properties?: EventProperties
): void {
  try {
    if (!isPostHogAvailable()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PostHog] Event captured (client not available):', eventName, properties);
      }
      return;
    }

    posthog.capture(eventName, properties);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Event captured:', eventName, properties);
    }
  } catch (error) {
    console.error('[PostHog] Failed to capture event:', eventName, error);
  }
}

/**
 * Identify a user with PostHog
 */
export function identifyUser(
  userId: string,
  properties?: EventProperties
): void {
  try {
    if (!isPostHogAvailable()) {
      return;
    }

    posthog.identify(userId, properties);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] User identified:', userId, properties);
    }
  } catch (error) {
    console.error('[PostHog] Failed to identify user:', error);
  }
}

/**
 * Reset PostHog user session (on logout)
 */
export function resetUser(): void {
  try {
    if (!isPostHogAvailable()) {
      return;
    }

    posthog.reset();

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] User session reset');
    }
  } catch (error) {
    console.error('[PostHog] Failed to reset user:', error);
  }
}

/**
 * Set user properties that persist across sessions
 */
export function setUserProperties(properties: EventProperties): void {
  try {
    if (!isPostHogAvailable()) {
      return;
    }

    posthog.setPersonProperties(properties);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] User properties set:', properties);
    }
  } catch (error) {
    console.error('[PostHog] Failed to set user properties:', error);
  }
}

/**
 * Set properties that apply to all subsequent events
 */
export function setGlobalProperties(properties: EventProperties): void {
  try {
    if (!isPostHogAvailable()) {
      return;
    }

    posthog.register(properties);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Global properties set:', properties);
    }
  } catch (error) {
    console.error('[PostHog] Failed to set global properties:', error);
  }
}

/**
 * Remove global properties
 */
export function unsetGlobalProperties(propertyNames: string[]): void {
  try {
    if (!isPostHogAvailable()) {
      return;
    }

    for (const name of propertyNames) {
      posthog.unregister(name);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Global properties unset:', propertyNames);
    }
  } catch (error) {
    console.error('[PostHog] Failed to unset global properties:', error);
  }
}

/**
 * Capture a page view event
 */
export function capturePageView(url?: string, properties?: EventProperties): void {
  try {
    if (!isPostHogAvailable()) {
      return;
    }

    posthog.capture('$pageview', {
      $current_url: url ?? window.location.href,
      ...properties,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Page view captured:', url);
    }
  } catch (error) {
    console.error('[PostHog] Failed to capture page view:', error);
  }
}

/**
 * Get the PostHog client instance (use with caution)
 */
export function getPostHogClient() {
  if (!isPostHogAvailable()) {
    console.warn('[PostHog] Client not available');
    return null;
  }
  return posthog;
}

/**
 * Check if user is identified
 */
export function isUserIdentified(): boolean {
  try {
    if (!isPostHogAvailable()) {
      return false;
    }
    return posthog.get_distinct_id() !== posthog.get_property('$device_id');
  } catch {
    return false;
  }
}

/**
 * Get current distinct ID
 */
export function getDistinctId(): string | null {
  try {
    if (!isPostHogAvailable()) {
      return null;
    }
    return posthog.get_distinct_id();
  } catch {
    return null;
  }
}

/**
 * Create a feature flag checker
 */
export function isFeatureEnabled(flagKey: string): boolean {
  try {
    if (!isPostHogAvailable()) {
      return false;
    }
    return posthog.isFeatureEnabled(flagKey) ?? false;
  } catch {
    return false;
  }
}

/**
 * Get feature flag value with fallback
 */
export function getFeatureFlagValue<T = string | boolean>(
  flagKey: string,
  fallback: T
): T {
  try {
    if (!isPostHogAvailable()) {
      return fallback;
    }
    const value = posthog.getFeatureFlag(flagKey);
    return (value ?? fallback) as T;
  } catch {
    return fallback;
  }
}
