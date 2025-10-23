"use client";

/**
 * Billing Tracking Hook
 * React hooks for tracking billing and subscription events
 */

import { useCallback } from "react";
import {
	trackBillingToggleSwitched,
	trackCheckoutSessionInitiated,
	trackCreditPurchased,
	trackPaymentFailed,
	trackPricingPageViewed,
	trackPromotionalCreditApplied,
	trackSubscriptionCanceled,
	trackSubscriptionCreated,
	trackSubscriptionDowngraded,
	trackSubscriptionRenewed,
	trackSubscriptionUpgraded,
} from "@/lib/posthog/events/billing";
import type {
	BillingToggleSwitchedProps,
	CheckoutSessionInitiatedProps,
	CreditPurchasedProps,
	PaymentFailedProps,
	PricingPageViewedProps,
	PromotionalCreditAppliedProps,
	SubscriptionChangedProps,
	SubscriptionCreatedProps,
} from "@/lib/posthog/types";

export function useBillingTracking() {
	const handlePricingPageViewed = useCallback(
		(props?: PricingPageViewedProps) => {
			trackPricingPageViewed(props);
		},
		[],
	);

	const handleBillingToggleSwitched = useCallback(
		(props: BillingToggleSwitchedProps) => {
			trackBillingToggleSwitched(props);
		},
		[],
	);

	const handleCheckoutSessionInitiated = useCallback(
		(props: CheckoutSessionInitiatedProps) => {
			trackCheckoutSessionInitiated(props);
		},
		[],
	);

	const handleSubscriptionCreated = useCallback(
		(props: SubscriptionCreatedProps) => {
			trackSubscriptionCreated(props);
		},
		[],
	);

	const handleSubscriptionUpgraded = useCallback(
		(props: SubscriptionChangedProps) => {
			trackSubscriptionUpgraded(props);
		},
		[],
	);

	const handleSubscriptionDowngraded = useCallback(
		(props: SubscriptionChangedProps) => {
			trackSubscriptionDowngraded(props);
		},
		[],
	);

	const handleSubscriptionCanceled = useCallback(
		(props?: Omit<SubscriptionChangedProps, "changeType">) => {
			trackSubscriptionCanceled(props);
		},
		[],
	);

	const handleSubscriptionRenewed = useCallback(
		(props?: Omit<SubscriptionChangedProps, "changeType">) => {
			trackSubscriptionRenewed(props);
		},
		[],
	);

	const handlePaymentFailed = useCallback((props: PaymentFailedProps) => {
		trackPaymentFailed(props);
	}, []);

	const handleCreditPurchased = useCallback((props: CreditPurchasedProps) => {
		trackCreditPurchased(props);
	}, []);

	const handlePromotionalCreditApplied = useCallback(
		(props: PromotionalCreditAppliedProps) => {
			trackPromotionalCreditApplied(props);
		},
		[],
	);

	return {
		trackPricingPageViewed: handlePricingPageViewed,
		trackBillingToggleSwitched: handleBillingToggleSwitched,
		trackCheckoutSessionInitiated: handleCheckoutSessionInitiated,
		trackSubscriptionCreated: handleSubscriptionCreated,
		trackSubscriptionUpgraded: handleSubscriptionUpgraded,
		trackSubscriptionDowngraded: handleSubscriptionDowngraded,
		trackSubscriptionCanceled: handleSubscriptionCanceled,
		trackSubscriptionRenewed: handleSubscriptionRenewed,
		trackPaymentFailed: handlePaymentFailed,
		trackCreditPurchased: handleCreditPurchased,
		trackPromotionalCreditApplied: handlePromotionalCreditApplied,
	};
}
