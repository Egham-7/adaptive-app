/**
 * Onboarding Event Tracking
 * Track user onboarding flow progression and completion
 */

import { captureEvent } from '../client';
import type {
  OnboardingStepViewedProps,
  OnboardingCompletedProps,
  PromotionalCreditsAddedProps,
  OnboardingStep,
} from '../types';

/**
 * Track when a user views an onboarding step
 */
export function trackOnboardingStepViewed(props: OnboardingStepViewedProps): void {
  captureEvent('onboarding_step_viewed', props);
}

/**
 * Track onboarding completion
 */
export function trackOnboardingCompleted(props: OnboardingCompletedProps): void {
  captureEvent('onboarding_completed', {
    ...props,
    skippedSteps: props.skippedSteps?.join(','),
  });
}

/**
 * Track when user skips onboarding or parts of it
 */
export function trackOnboardingSkipped(props?: {
  step?: OnboardingStep;
  reason?: string;
}): void {
  captureEvent('onboarding_skipped', props);
}

/**
 * Track promotional credits being added
 */
export function trackPromotionalCreditsAdded(props: PromotionalCreditsAddedProps): void {
  captureEvent('promotional_credits_added', props);
}
