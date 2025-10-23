"use client";

/**
 * Settings Tracking Hook
 * React hooks for tracking settings and preferences events
 */

import { useCallback } from "react";
import {
	trackPreferencesSaved,
	trackProfileSettingsOpened,
	trackProfileUpdated,
	trackProviderConfigured,
	trackProviderRemoved,
	trackSettingsOpened,
	trackThemeChanged,
} from "@/lib/posthog/events/settings";
import type {
	PreferencesSavedProps,
	ProfileUpdatedProps,
	ProviderConfiguredProps,
	SettingsOpenedProps,
	ThemeChangedProps,
} from "@/lib/posthog/types";

export function useSettingsTracking() {
	const handleProfileSettingsOpened = useCallback(() => {
		trackProfileSettingsOpened();
	}, []);

	const handleSettingsOpened = useCallback((props: SettingsOpenedProps) => {
		trackSettingsOpened(props);
	}, []);

	const handleProfileUpdated = useCallback((props: ProfileUpdatedProps) => {
		trackProfileUpdated(props);
	}, []);

	const handleThemeChanged = useCallback((props: ThemeChangedProps) => {
		trackThemeChanged(props);
	}, []);

	const handleProviderConfigured = useCallback(
		(props: ProviderConfiguredProps) => {
			trackProviderConfigured(props);
		},
		[],
	);

	const handleProviderRemoved = useCallback(
		(props: {
			provider: string;
			context: "chat" | "organization";
			organizationId?: string;
		}) => {
			trackProviderRemoved(props);
		},
		[],
	);

	const handlePreferencesSaved = useCallback((props: PreferencesSavedProps) => {
		trackPreferencesSaved(props);
	}, []);

	return {
		trackProfileSettingsOpened: handleProfileSettingsOpened,
		trackSettingsOpened: handleSettingsOpened,
		trackProfileUpdated: handleProfileUpdated,
		trackThemeChanged: handleThemeChanged,
		trackProviderConfigured: handleProviderConfigured,
		trackProviderRemoved: handleProviderRemoved,
		trackPreferencesSaved: handlePreferencesSaved,
	};
}
