/**
 * Settings Event Tracking
 * Track user preferences and configuration changes
 */

import { captureEvent } from '../client';
import type {
  SettingsOpenedProps,
  ProfileUpdatedProps,
  ThemeChangedProps,
  ProviderConfiguredProps,
  PreferencesSavedProps,
} from '../types';

/**
 * Track profile settings opened
 */
export function trackProfileSettingsOpened(): void {
  captureEvent('profile_settings_opened', {
    settingsType: 'profile',
  });
}

/**
 * Track settings opened (generic)
 */
export function trackSettingsOpened(props: SettingsOpenedProps): void {
  const eventMap = {
    profile: 'profile_settings_opened',
    organization: 'organization_settings_opened',
    project: 'project_settings_opened',
    chat: 'profile_settings_opened', // Chat settings are part of profile
  } as const;

  const eventName = eventMap[props.settingsType];
  captureEvent(eventName, props);
}

/**
 * Track profile update
 */
export function trackProfileUpdated(props: ProfileUpdatedProps): void {
  captureEvent('profile_updated', {
    ...props,
    fieldsUpdated: props.fieldsUpdated.join(','),
  });
}

/**
 * Track theme change
 */
export function trackThemeChanged(props: ThemeChangedProps): void {
  captureEvent('theme_changed', props);
}

/**
 * Track provider configuration
 */
export function trackProviderConfigured(props: ProviderConfiguredProps): void {
  captureEvent('provider_configured', props);
}

/**
 * Track provider removal
 */
export function trackProviderRemoved(props: {
  provider: string;
  context: 'chat' | 'organization';
  organizationId?: string;
}): void {
  captureEvent('provider_removed', props);
}

/**
 * Track preferences saved
 */
export function trackPreferencesSaved(props: PreferencesSavedProps): void {
  captureEvent('preferences_saved', props);
}
