'use client';

/**
 * Project Tracking Hook
 * React hooks for tracking project-related events
 */

import { useCallback } from 'react';
import {
  trackProjectCreated,
  trackProjectViewed,
  trackProjectDashboardViewed,
  trackProjectDeleted,
  trackProjectSettingsOpened,
  trackProjectSettingsUpdated,
} from '@/lib/posthog/events/projects';
import type {
  ProjectCreatedProps,
  ProjectViewedProps,
  ProjectDeletedProps,
  ProjectSettingsUpdatedProps,
} from '@/lib/posthog/types';

export function useProjectTracking() {
  const handleCreated = useCallback((props: ProjectCreatedProps) => {
    trackProjectCreated(props);
  }, []);

  const handleViewed = useCallback((props: ProjectViewedProps) => {
    trackProjectViewed(props);
  }, []);

  const handleDashboardViewed = useCallback((props: { projectId: string; organizationId: string }) => {
    trackProjectDashboardViewed(props);
  }, []);

  const handleDeleted = useCallback((props: ProjectDeletedProps) => {
    trackProjectDeleted(props);
  }, []);

  const handleSettingsOpened = useCallback(
    (props: { projectId: string; organizationId: string; tab?: string }) => {
      trackProjectSettingsOpened(props);
    },
    []
  );

  const handleSettingsUpdated = useCallback((props: ProjectSettingsUpdatedProps) => {
    trackProjectSettingsUpdated(props);
  }, []);

  return {
    trackCreated: handleCreated,
    trackViewed: handleViewed,
    trackDashboardViewed: handleDashboardViewed,
    trackDeleted: handleDeleted,
    trackSettingsOpened: handleSettingsOpened,
    trackSettingsUpdated: handleSettingsUpdated,
  };
}
