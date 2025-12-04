"use client";

import { Mail, Trash2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
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
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
						<Mail className="h-5 w-5 text-[#34d399]" />
					</div>
					<div>
						<h3 className="font-medium text-white">Pending Invitations</h3>
						<p className="text-sm text-white/40">Loading invitations...</p>
					</div>
				</div>
			</div>
		);
	}

	const pendingInvitations = invitations?.invitations || [];

	if (pendingInvitations.length === 0) {
		return (
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
						<Mail className="h-5 w-5 text-white/40" />
					</div>
					<div>
						<h3 className="font-medium text-white">Pending Invitations</h3>
						<p className="text-sm text-white/40">No pending invitations</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
			<div className="flex items-center gap-3 mb-6">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
					<Mail className="h-5 w-5 text-[#34d399]" />
				</div>
				<div>
					<h3 className="font-medium text-white">Pending Invitations</h3>
					<p className="text-sm text-white/40">
						{pendingInvitations.length} pending invitation
						{pendingInvitations.length !== 1 ? "s" : ""}
					</p>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Email</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Role</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Invited</th>
							<th className="text-right py-3 px-4 text-sm font-medium text-white/50">Actions</th>
						</tr>
					</thead>
					<tbody>
						{pendingInvitations.map((invitation) => (
							<tr key={invitation.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
								<td className="py-3 px-4 text-white font-medium">
									{invitation.emailAddress}
								</td>
								<td className="py-3 px-4">
									<span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
										{invitation.role === "org:admin" ? "Admin" : "Member"}
									</span>
								</td>
								<td className="py-3 px-4 text-white/40 text-sm">
									{new Date(invitation.createdAt).toLocaleDateString()}
								</td>
								<td className="py-3 px-4 text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRevoke(invitation.id)}
										disabled={isPending}
										className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
