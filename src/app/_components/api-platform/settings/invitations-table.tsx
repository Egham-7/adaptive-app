"use client";

import { Mail, Trash2 } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePendingOrganizationInvitations } from "@/hooks/organizations/use-pending-organization-invitations";
import { useRevokeOrganizationInvitation } from "@/hooks/organizations/use-revoke-organization-invitation";

interface InvitationsTableProps {
	organizationId: string;
}

export const InvitationsTable: React.FC<InvitationsTableProps> = ({
	organizationId,
}) => {
	const { data: invitations, isLoading } =
		usePendingOrganizationInvitations(organizationId);

	const { mutate: revokeInvitation, isPending } =
		useRevokeOrganizationInvitation();

	const handleRevoke = (invitationId: string) => {
		if (confirm("Are you sure you want to revoke this invitation?")) {
			revokeInvitation({
				organizationId,
				invitationId,
			});
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Pending Invitations
					</CardTitle>
					<CardDescription>Loading invitations...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const pendingInvitations = invitations?.invitations || [];

	if (pendingInvitations.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Pending Invitations
					</CardTitle>
					<CardDescription>No pending invitations</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Pending Invitations
				</CardTitle>
				<CardDescription>
					{pendingInvitations.length} pending invitation
					{pendingInvitations.length !== 1 ? "s" : ""}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Invited</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{pendingInvitations.map((invitation) => (
							<TableRow key={invitation.id}>
								<TableCell className="font-medium">
									{invitation.emailAddress}
								</TableCell>
								<TableCell>
									<Badge variant="outline">
										{invitation.role === "org:admin" ? "Admin" : "Member"}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(invitation.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRevoke(invitation.id)}
										disabled={isPending}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};
