/**
 * Project Event Tracking
 * Track project management and operations
 */

import { captureEvent } from "../client";
import type {
	ProjectCreatedProps,
	ProjectDeletedProps,
	ProjectSettingsUpdatedProps,
	ProjectViewedProps,
} from "../types";

/**
 * Track project creation
 */
export function trackProjectCreated(props: ProjectCreatedProps): void {
	captureEvent("project_created", props);
}

/**
 * Track project page view
 */
export function trackProjectViewed(props: ProjectViewedProps): void {
	captureEvent("project_viewed", props);
}

/**
 * Track project dashboard view
 */
export function trackProjectDashboardViewed(props: {
	projectId: string;
	organizationId: string;
}): void {
	captureEvent("project_dashboard_viewed", props);
}

/**
 * Track project deletion
 */
export function trackProjectDeleted(props: ProjectDeletedProps): void {
	captureEvent("project_deleted", props);
}

/**
 * Track project settings opened
 */
export function trackProjectSettingsOpened(props: {
	projectId: string;
	organizationId: string;
	tab?: string;
}): void {
	captureEvent("project_settings_opened", props);
}

/**
 * Track project settings update
 */
export function trackProjectSettingsUpdated(
	props: ProjectSettingsUpdatedProps,
): void {
	captureEvent("project_settings_updated", {
		...props,
		settingsChanged: props.settingsChanged?.join(","),
	});
}
