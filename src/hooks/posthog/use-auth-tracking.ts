'use client';

/**
 * Authentication Tracking Hook
 * React hooks for tracking auth-related events
 */

import { useCallback } from 'react';
import {
  trackSignUp,
  trackSignIn,
  trackSignOut,
  trackUnauthorizedAccess,
} from '@/lib/posthog/events/auth';
import type {
  SignUpEventProps,
  SignInEventProps,
  UnauthorizedAccessEventProps,
} from '@/lib/posthog/types';

export function useAuthTracking() {
  const handleSignUp = useCallback((props?: SignUpEventProps) => {
    trackSignUp(props);
  }, []);

  const handleSignIn = useCallback((props?: SignInEventProps) => {
    trackSignIn(props);
  }, []);

  const handleSignOut = useCallback(() => {
    trackSignOut();
  }, []);

  const handleUnauthorizedAccess = useCallback((props: UnauthorizedAccessEventProps) => {
    trackUnauthorizedAccess(props);
  }, []);

  return {
    trackSignUp: handleSignUp,
    trackSignIn: handleSignIn,
    trackSignOut: handleSignOut,
    trackUnauthorizedAccess: handleUnauthorizedAccess,
  };
}
