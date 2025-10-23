/**
 * Authentication Event Tracking
 * Track user authentication and authorization events
 */

import { captureEvent } from '../client';
import type {
  SignUpEventProps,
  SignInEventProps,
  UnauthorizedAccessEventProps,
} from '../types';

/**
 * Track user sign up
 */
export function trackSignUp(props?: SignUpEventProps): void {
  captureEvent('sign_up', props);
}

/**
 * Track user sign in
 */
export function trackSignIn(props?: SignInEventProps): void {
  captureEvent('sign_in', props);
}

/**
 * Track user sign out
 */
export function trackSignOut(): void {
  captureEvent('sign_out');
}

/**
 * Track unauthorized access attempt
 */
export function trackUnauthorizedAccess(props: UnauthorizedAccessEventProps): void {
  captureEvent('unauthorized_access', props);
}
