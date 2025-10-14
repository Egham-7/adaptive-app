"use client";

import { Crown, MoreVertical, Users as UsersIcon } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
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
import { api } from "@/trpc/react";
import { InvitationsTable } from "./invitations-table";
import { InviteMemberDialog } from "./invite-member-dialog";

interface MembersTabProps {
	organizationId: string;
}

export const MembersTab: React.FC<MembersTabProps> = ({ organizationId }) => {
	const utils = api.useUtils();

	const { data: members, isLoading } = api.organizations.listMembers.useQuery({
		organizationId,
	});

	const removeMember = api.organizations.removeMember.useMutation({
		onSuccess: () => {
			toast.success("Member removed from the organization");
			utils.organizations.listMembers.invalidate({ organizationId });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to remove member");
		},
	});

	const updateMemberRole = api.organizations.updateMemberRole.useMutation({
		onSuccess: () => {
			toast.success("Member role updated successfully");
			utils.organizations.listMembers.invalidate({ organizationId });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update member role");
		},
	});

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
								{currentMembers.length !== 1 ? "s" : ""}
							</CardDescription>
						</div>
						<InviteMemberDialog organizationId={organizationId} />
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
