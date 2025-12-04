"use client";

import { Crown, MoreVertical, Users as UsersIcon } from "lucide-react";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizationMembers } from "@/hooks/organizations/use-organization-members";
import { usePendingOrganizationInvitations } from "@/hooks/organizations/use-pending-organization-invitations";
import { useRemoveOrganizationMember } from "@/hooks/organizations/use-remove-organization-member";
import { useUpdateOrganizationMemberRole } from "@/hooks/organizations/use-update-organization-member-role";
import type { OrganizationMember } from "@/types/organizations";
import { InvitationsTable } from "./invitations-table";
import { InviteMemberDialog } from "./invite-member-dialog";

interface MembersTabProps {
	organizationId: string;
}

export const MembersTab: React.FC<MembersTabProps> = ({ organizationId }) => {
	const { data: members, isLoading } = useOrganizationMembers(organizationId);

	const { data: invitations } =
		usePendingOrganizationInvitations(organizationId);

	const removeMember = useRemoveOrganizationMember();

	const updateMemberRole = useUpdateOrganizationMemberRole();

	const handleRemoveMember = (userId: string, email: string) => {
		if (
			confirm(`Are you sure you want to remove ${email} from the organization?`)
		) {
			removeMember.mutate({
				organizationId,
				userId,
			});
		}
	};

	const handleChangeRole = (
		userId: string,
		newRole: "org:admin" | "org:member",
	) => {
		updateMemberRole.mutate({
			organizationId,
			userId,
			role: newRole,
		});
	};

	if (isLoading) {
		return <div>Loading members...</div>;
	}

	const currentMembers = members?.members || [];
	const pendingInvitations = invitations?.invitations || [];
	const totalCount = currentMembers.length + pendingInvitations.length;

	return (
		<div className="space-y-6">
			{/* Members Card */}
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
							<UsersIcon className="h-5 w-5 text-[#34d399]" />
						</div>
						<div>
							<h3 className="font-medium text-white">Organization Members</h3>
							<p className="text-sm text-white/40">
								{currentMembers.length} member
								{currentMembers.length !== 1 ? "s" : ""} · {totalCount}/5 total
								slots used
							</p>
						</div>
					</div>
					<InviteMemberDialog
						organizationId={organizationId}
						currentMemberCount={currentMembers.length}
						pendingInvitationCount={pendingInvitations.length}
					/>
				</div>

				{/* Members Table */}
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-white/10">
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Member</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Email</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Role</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Joined</th>
								<th className="text-right py-3 px-4 text-sm font-medium text-white/50">Actions</th>
							</tr>
						</thead>
						<tbody>
							{currentMembers.map((member: OrganizationMember) => (
								<tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
									<td className="py-3 px-4">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8 border border-white/10">
												<AvatarImage src={member.imageUrl} />
												<AvatarFallback className="bg-white/5 text-white text-xs">
													{member.firstName?.[0]}
													{member.lastName?.[0]}
												</AvatarFallback>
											</Avatar>
											<span className="text-white font-medium">
												{member.firstName} {member.lastName}
											</span>
										</div>
									</td>
									<td className="py-3 px-4 text-white/60">{member.email}</td>
									<td className="py-3 px-4">
										<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
											member.role === "org:admin" 
												? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30" 
												: "bg-white/5 text-white/60 border border-white/10"
										}`}>
											{member.role === "org:admin" && (
												<Crown className="h-3 w-3" />
											)}
											{member.role === "org:admin" ? "Admin" : "Member"}
										</span>
									</td>
									<td className="py-3 px-4 text-white/40 text-sm">
										{new Date(member.createdAt).toLocaleDateString()}
									</td>
									<td className="py-3 px-4 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 backdrop-blur-xl">
												{member.role === "org:member" ? (
													<DropdownMenuItem
														className="text-white/70 hover:text-white focus:text-white focus:bg-white/10"
														onClick={() => {
															if (member.userId) {
																handleChangeRole(member.userId, "org:admin");
															}
														}}
													>
														Promote to Admin
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														className="text-white/70 hover:text-white focus:text-white focus:bg-white/10"
														onClick={() => {
															if (member.userId) {
																handleChangeRole(member.userId, "org:member");
															}
														}}
													>
														Change to Member
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
													onClick={() => {
														if (member.userId && member.email) {
															handleRemoveMember(member.userId, member.email);
														}
													}}
												>
													Remove from Organization
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<InvitationsTable organizationId={organizationId} />
		</div>
	);
};
