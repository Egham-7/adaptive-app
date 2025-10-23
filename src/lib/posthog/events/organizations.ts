/**
 * Organization Event Tracking
 * Track organization management and team collaboration events
 */

import { captureEvent } from "../client";
import type {
	MemberInvitedProps,
	MemberRoleChangedProps,
	OrganizationCreatedProps,
	OrganizationDeletedProps,
	OrganizationViewedProps,
	TeamMemberRemovedProps,
} from "../types";

/**
 * Track organization creation
 */
export function trackOrganizationCreated(
	props: OrganizationCreatedProps,
): void {
	captureEvent("organization_created", props);
}

/**
 * Track organization page view
 */
export function trackOrganizationViewed(props: OrganizationViewedProps): void {
	captureEvent("organization_viewed", props);
}

/**
 * Track organization deletion
 */
export function trackOrganizationDeleted(
	props: OrganizationDeletedProps,
): void {
	captureEvent("organization_deleted", props);
}

/**
 * Track organization settings opened
 */
export function trackOrganizationSettingsOpened(props: {
	organizationId: string;
	tab?: string;
}): void {
	captureEvent("organization_settings_opened", props);
}

/**
 * Track team member invitation
 */
export function trackMemberInvited(props: MemberInvitedProps): void {
	captureEvent("member_invited", props);
}

/**
 * Track member role change
 */
export function trackMemberRoleChanged(props: MemberRoleChangedProps): void {
	captureEvent("member_role_changed", props);
}

/**
 * Track team member removal
 */
export function trackTeamMemberRemoved(props: TeamMemberRemovedProps): void {
	captureEvent("team_member_removed", props);
}

/**
 * Track invitation acceptance
 */
export function trackInvitationAccepted(props: {
	organizationId: string;
	role: string;
}): void {
	captureEvent("invitation_accepted", props);
}

/**
 * Track invitation decline
 */
export function trackInvitationDeclined(props: {
	organizationId: string;
}): void {
	captureEvent("invitation_declined", props);
}

/**
 * Track organization switch
 */
export function trackOrganizationSwitched(props: {
	organizationId: string;
	organizationName: string;
}): void {
	captureEvent("organization_switched", props);
}

/**
 * Track organization settings update
 */
export function trackOrganizationSettingsUpdated(props: {
	organizationId: string;
	settingsChanged?: string[];
}): void {
	captureEvent("organization_settings_updated", {
		organizationId: props.organizationId,
		settingsChangedCount: props.settingsChanged?.length,
		settingsChangedList: props.settingsChanged?.join(","),
	});
}
