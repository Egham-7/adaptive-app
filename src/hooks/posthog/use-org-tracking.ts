'use client';

/**
 * Organization Tracking Hook
 * React hooks for tracking organization-related events
 */

import { useCallback } from 'react';
import {
  trackOrganizationCreated,
  trackOrganizationViewed,
  trackOrganizationDeleted,
  trackOrganizationSettingsOpened,
  trackMemberInvited,
  trackMemberRoleChanged,
  trackTeamMemberRemoved,
  trackInvitationAccepted,
  trackInvitationDeclined,
} from '@/lib/posthog/events/organizations';
import type {
  OrganizationCreatedProps,
  OrganizationViewedProps,
  OrganizationDeletedProps,
  MemberInvitedProps,
  MemberRoleChangedProps,
  TeamMemberRemovedProps,
} from '@/lib/posthog/types';

export function useOrgTracking() {
  const handleCreated = useCallback((props: OrganizationCreatedProps) => {
    trackOrganizationCreated(props);
  }, []);

  const handleViewed = useCallback((props: OrganizationViewedProps) => {
    trackOrganizationViewed(props);
  }, []);

  const handleDeleted = useCallback((props: OrganizationDeletedProps) => {
    trackOrganizationDeleted(props);
  }, []);

  const handleSettingsOpened = useCallback((props: { organizationId: string; tab?: string }) => {
    trackOrganizationSettingsOpened(props);
  }, []);

  const handleMemberInvited = useCallback((props: MemberInvitedProps) => {
    trackMemberInvited(props);
  }, []);

  const handleMemberRoleChanged = useCallback((props: MemberRoleChangedProps) => {
    trackMemberRoleChanged(props);
  }, []);

  const handleMemberRemoved = useCallback((props: TeamMemberRemovedProps) => {
    trackTeamMemberRemoved(props);
  }, []);

  const handleInvitationAccepted = useCallback((props: { organizationId: string; role: string }) => {
    trackInvitationAccepted(props);
  }, []);

  const handleInvitationDeclined = useCallback((props: { organizationId: string }) => {
    trackInvitationDeclined(props);
  }, []);

  return {
    trackCreated: handleCreated,
    trackViewed: handleViewed,
    trackDeleted: handleDeleted,
    trackSettingsOpened: handleSettingsOpened,
    trackMemberInvited: handleMemberInvited,
    trackMemberRoleChanged: handleMemberRoleChanged,
    trackMemberRemoved: handleMemberRemoved,
    trackInvitationAccepted: handleInvitationAccepted,
    trackInvitationDeclined: handleInvitationDeclined,
  };
}
