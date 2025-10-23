/**
 * Performance Event Tracking
 * Track application performance metrics and monitoring
 */

import { captureEvent } from "../client";
import type {
	ApiResponseTimeProps,
	ChatResponseTimeProps,
	ConversionEventProps,
	FeatureAdoptionProps,
	PerformanceMetricProps,
	UsageMilestoneProps,
} from "../types";

/**
 * Track API response time
 */
export function trackApiResponseTime(props: ApiResponseTimeProps): void {
	captureEvent("api_response_time_recorded", props);
}

/**
 * Track chat response time
 */
export function trackChatResponseTime(props: ChatResponseTimeProps): void {
	captureEvent("chat_response_time_recorded", props);
}

/**
 * Track generic performance metric
 */
export function trackPerformanceMetric(props: PerformanceMetricProps): void {
	captureEvent("performance_metric_recorded", props);
}

/**
 * Track usage milestone reached
 */
export function trackUsageMilestone(props: UsageMilestoneProps): void {
	captureEvent("usage_milestone_reached", props);
}

/**
 * Track feature adoption
 */
export function trackFeatureAdoption(props: FeatureAdoptionProps): void {
	captureEvent("feature_adoption", props);
}

/**
 * Track conversion event
 */
export function trackConversionEvent(props: ConversionEventProps): void {
	captureEvent("conversion_event", props);
}

/**
 * Track page load time
 */
export function trackPageLoadTime(props: {
	pagePath: string;
	loadTimeMs: number;
}): void {
	trackPerformanceMetric({
		metricName: "page_load_time",
		value: props.loadTimeMs,
		unit: "ms",
		pagePath: props.pagePath,
	});
}

/**
 * Track first contentful paint
 */
export function trackFirstContentfulPaint(props: {
	pagePath: string;
	fcpMs: number;
}): void {
	trackPerformanceMetric({
		metricName: "first_contentful_paint",
		value: props.fcpMs,
		unit: "ms",
		pagePath: props.pagePath,
	});
}

/**
 * Track largest contentful paint
 */
export function trackLargestContentfulPaint(props: {
	pagePath: string;
	lcpMs: number;
}): void {
	trackPerformanceMetric({
		metricName: "largest_contentful_paint",
		value: props.lcpMs,
		unit: "ms",
		pagePath: props.pagePath,
	});
}

/**
 * Track cumulative layout shift
 */
export function trackCumulativeLayoutShift(props: {
	pagePath: string;
	clsScore: number;
}): void {
	trackPerformanceMetric({
		metricName: "cumulative_layout_shift",
		value: props.clsScore,
		unit: "count",
		pagePath: props.pagePath,
	});
}

/**
 * Track time to interactive
 */
export function trackTimeToInteractive(props: {
	pagePath: string;
	ttiMs: number;
}): void {
	trackPerformanceMetric({
		metricName: "time_to_interactive",
		value: props.ttiMs,
		unit: "ms",
		pagePath: props.pagePath,
	});
}
