/**
 * Billing & Subscription Event Tracking
 * Track payment, subscription, and credit management events
 */

import { captureEvent } from "../client";
import type {
	BillingToggleSwitchedProps,
	CheckoutSessionInitiatedProps,
	CreditPurchasedProps,
	PaymentFailedProps,
	PricingPageViewedProps,
	PromotionalCreditAppliedProps,
	SubscriptionChangedProps,
	SubscriptionCreatedProps,
} from "../types";

/**
 * Track pricing page view
 */
export function trackPricingPageViewed(props?: PricingPageViewedProps): void {
	captureEvent("pricing_page_viewed", props);
}

/**
 * Track billing cycle toggle
 */
export function trackBillingToggleSwitched(
	props: BillingToggleSwitchedProps,
): void {
	captureEvent("billing_toggle_switched", props);
}

/**
 * Track checkout session initiation
 */
export function trackCheckoutSessionInitiated(
	props: CheckoutSessionInitiatedProps,
): void {
	captureEvent("checkout_session_initiated", props);
}

/**
 * Track subscription creation
 */
export function trackSubscriptionCreated(
	props: SubscriptionCreatedProps,
): void {
	captureEvent("subscription_created", props);
}

/**
 * Track subscription upgrade
 */
export function trackSubscriptionUpgraded(
	props: SubscriptionChangedProps,
): void {
	captureEvent("subscription_upgraded", {
		...props,
		changeType: "upgraded",
	});
}

/**
 * Track subscription downgrade
 */
export function trackSubscriptionDowngraded(
	props: SubscriptionChangedProps,
): void {
	captureEvent("subscription_downgraded", {
		...props,
		changeType: "downgraded",
	});
}

/**
 * Track subscription cancellation
 */
export function trackSubscriptionCanceled(
	props?: Omit<SubscriptionChangedProps, "changeType">,
): void {
	captureEvent("subscription_canceled", {
		...props,
		changeType: "canceled",
	});
}

/**
 * Track subscription renewal
 */
export function trackSubscriptionRenewed(
	props?: Omit<SubscriptionChangedProps, "changeType">,
): void {
	captureEvent("subscription_renewed", {
		...props,
		changeType: "renewed",
	});
}

/**
 * Track payment failure
 */
export function trackPaymentFailed(props: PaymentFailedProps): void {
	captureEvent("payment_failed", props);
}

/**
 * Track credit purchase
 */
export function trackCreditPurchased(props: CreditPurchasedProps): void {
	captureEvent("credit_purchased", props);
}

/**
 * Track promotional credit application
 */
export function trackPromotionalCreditApplied(
	props: PromotionalCreditAppliedProps,
): void {
	captureEvent("promotional_credit_applied", props);
}
