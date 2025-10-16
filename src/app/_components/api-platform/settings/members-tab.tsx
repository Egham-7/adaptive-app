"use client";

import { Crown, MoreVertical, Users as UsersIcon } from "lucide-react";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useOrganizationInvitations } from "@/hooks/organizations/use-organization-invitations";
import { useOrganizationMembers } from "@/hooks/organizations/use-organization-members";
import { useRemoveOrganizationMember } from "@/hooks/organizations/use-remove-organization-member";
import { useUpdateOrganizationMemberRole } from "@/hooks/organizations/use-update-organization-member-role";
import { InvitationsTable } from "./invitations-table";
import { InviteMemberDialog } from "./invite-member-dialog";

interface MembersTabProps {
	organizationId: string;
}

export const MembersTab: React.FC<MembersTabProps> = ({ organizationId }) => {
	const { data: members, isLoading } = useOrganizationMembers(organizationId);

	const { data: invitations } = useOrganizationInvitations(organizationId);

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
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<UsersIcon className="h-5 w-5" />
								Organization Members
							</CardTitle>
							<CardDescription>
								{currentMembers.length} member
								{currentMembers.length !== 1 ? "s" : ""} · {totalCount}/5 total
								slots used
							</CardDescription>
						</div>
						<InviteMemberDialog
							organizationId={organizationId}
							currentMemberCount={currentMembers.length}
							pendingInvitationCount={pendingInvitations.length}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Member</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currentMembers.map((member) => (
								<TableRow key={member.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={member.imageUrl} />
												<AvatarFallback>
													{member.firstName?.[0]}
													{member.lastName?.[0]}
												</AvatarFallback>
											</Avatar>
											<span>
												{member.firstName} {member.lastName}
											</span>
										</div>
									</TableCell>
									<TableCell>{member.email}</TableCell>
									<TableCell>
										<Badge
											variant={
												member.role === "org:admin" ? "default" : "secondary"
											}
										>
											{member.role === "org:admin" && (
												<Crown className="mr-1 h-3 w-3" />
											)}
											{member.role === "org:admin" ? "Admin" : "Member"}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(member.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{member.role === "org:member" ? (
													<DropdownMenuItem
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
													className="text-destructive"
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
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<InvitationsTable organizationId={organizationId} />
		</div>
	);
};
