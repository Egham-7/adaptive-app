import type { RouterOutputs } from "./router";

/**
 * Organization member type
 */
export type OrganizationMember =
	RouterOutputs["organizations"]["listMembers"]["members"][number];

/**
 * Organization members response type
 */
export type OrganizationMembersResponse =
	RouterOutputs["organizations"]["listMembers"];

/**
 * Organization invitation type
 */
export type OrganizationInvitation =
	RouterOutputs["organizations"]["listInvitations"]["invitations"][number];

/**
 * Organization invitations response type
 */
export type OrganizationInvitationsResponse =
	RouterOutputs["organizations"]["listInvitations"];
