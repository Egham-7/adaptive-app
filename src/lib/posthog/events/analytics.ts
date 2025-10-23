/**
 * Analytics & Dashboard Event Tracking
 * Track user interactions with analytics and monitoring features
 */

import { captureEvent } from '../client';
import type {
  UsageDashboardViewedProps,
  UsageChartViewedProps,
  ProviderComparisonViewedProps,
  CostAnalysisGeneratedProps,
} from '../types';

/**
 * Track usage dashboard view
 */
export function trackUsageDashboardViewed(props: UsageDashboardViewedProps): void {
  captureEvent('usage_dashboard_viewed', props);
}

/**
 * Track usage chart interaction
 */
export function trackUsageChartViewed(props: UsageChartViewedProps): void {
  captureEvent('usage_chart_viewed', props);
}

/**
 * Track provider comparison view
 */
export function trackProviderComparisonViewed(props: ProviderComparisonViewedProps): void {
  captureEvent('provider_comparison_viewed', {
    ...props,
    providers: props.providers.join(','),
  });
}

/**
 * Track cost analysis generation
 */
export function trackCostAnalysisGenerated(props: CostAnalysisGeneratedProps): void {
  captureEvent('cost_analysis_generated', props);
}
