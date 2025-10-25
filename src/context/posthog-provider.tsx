"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { trackSignIn } from "@/lib/posthog/events/auth";

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
	const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
	if (posthogKey) {
		posthog.init(posthogKey, {
			api_host: "/ingest",
			ui_host: "https://eu.posthog.com",
			person_profiles: "identified_only",
			capture_pageview: false, // We'll manually capture pageviews
			capture_pageleave: true,
		});
	}
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogAuthWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const auth = useAuth();
	const userInfo = useUser();
	const hasTrackedSignIn = useRef(false);

	useEffect(() => {
		if (userInfo.user) {
			posthog.identify(userInfo.user.id, {
				email: userInfo.user.primaryEmailAddress?.emailAddress,
				name: userInfo.user.fullName,
			});

			// Track sign-in event once per session
			if (!hasTrackedSignIn.current) {
				trackSignIn({
					signInMethod: "clerk",
				});
				hasTrackedSignIn.current = true;
			}
		} else if (!auth.isSignedIn) {
			posthog.reset();
			hasTrackedSignIn.current = false;
		}
	}, [auth, userInfo]);

	return <>{children}</>;
}
