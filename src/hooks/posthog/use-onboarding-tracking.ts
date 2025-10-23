"use client";

/**
 * Onboarding Tracking Hook
 * React hooks for tracking onboarding flow events
 */

import { useCallback } from "react";
import {
	trackOnboardingCompleted,
	trackOnboardingSkipped,
	trackOnboardingStepViewed,
	trackPromotionalCreditsAdded,
} from "@/lib/posthog/events/onboarding";
import type {
	OnboardingCompletedProps,
	OnboardingStep,
	OnboardingStepViewedProps,
	PromotionalCreditsAddedProps,
} from "@/lib/posthog/types";

export function useOnboardingTracking() {
	const handleStepViewed = useCallback((props: OnboardingStepViewedProps) => {
		trackOnboardingStepViewed(props);
	}, []);

	const handleCompleted = useCallback((props: OnboardingCompletedProps) => {
		trackOnboardingCompleted(props);
	}, []);

	const handleSkipped = useCallback(
		(props?: { step?: OnboardingStep; reason?: string }) => {
			trackOnboardingSkipped(props);
		},
		[],
	);

	const handlePromotionalCreditsAdded = useCallback(
		(props: PromotionalCreditsAddedProps) => {
			trackPromotionalCreditsAdded(props);
		},
		[],
	);

	return {
		trackStepViewed: handleStepViewed,
		trackCompleted: handleCompleted,
		trackSkipped: handleSkipped,
		trackPromotionalCreditsAdded: handlePromotionalCreditsAdded,
	};
}
