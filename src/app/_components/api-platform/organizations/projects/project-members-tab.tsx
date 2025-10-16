"use client";

import { MoreVertical, UserPlus, Users as UsersIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

interface ProjectMembersTabProps {
	projectId: number;
	organizationId: string;
	currentUserRole?: "admin" | "member" | null;
}

export const ProjectMembersTab: React.FC<ProjectMembersTabProps> = ({
	projectId,
	organizationId,
	currentUserRole,
}) => {
	const utils = api.useUtils();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const [newMemberRole, setNewMemberRole] = useState<"admin" | "member">(
		"member",
	);
	const [_editingRoleUserId, setEditingRoleUserId] = useState<string | null>(
		null,
	);

	const isAdmin = currentUserRole === "admin";

	const { data: members, isLoading } = api.projects.listMembers.useQuery({
		projectId,
	});

	const { data: orgMembersData } = api.organizations.listMembers.useQuery({
		organizationId,
	});

	const addMember = api.projects.addMember.useMutation({
		onSuccess: () => {
			toast.success("Member added to the project");
			utils.projects.listMembers.invalidate({ projectId });
			utils.projects.getById.invalidate({ id: projectId });
			setIsAddDialogOpen(false);
			setSelectedUserIds([]);
			setNewMemberRole("member");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to add member");
		},
	});

	const removeMember = api.projects.removeMember.useMutation({
		onSuccess: () => {
			toast.success("Member removed from the project");
			utils.projects.listMembers.invalidate({ projectId });
			utils.projects.getById.invalidate({ id: projectId });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to remove member");
		},
	});

	const updateMemberRole = api.projects.updateMemberRole.useMutation({
		onSuccess: () => {
			toast.success("Member role updated successfully");
			utils.projects.listMembers.invalidate({ projectId });
			utils.projects.getById.invalidate({ id: projectId });
			setEditingRoleUserId(null);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update member role");
		},
	});

	const handleAddMember = async () => {
		if (selectedUserIds.length === 0) {
			toast.error("Please select at least one member");
			return;
		}

		try {
			await Promise.all(
				selectedUserIds.map((userId) =>
					addMember.mutateAsync({
						projectId,
						userId,
						role: newMemberRole,
					}),
				),
			);
		} catch (error) {
			console.error("Error adding members:", error);
		}
	};

	const handleRemoveMember = (userId: string) => {
		if (
			confirm("Are you sure you want to remove this member from the project?")
		) {
			removeMember.mutate({
				projectId,
				userId,
			});
		}
	};

	const handleUpdateRole = (userId: string, newRole: "admin" | "member") => {
		updateMemberRole.mutate({
			projectId,
			userId,
			role: newRole,
		});
	};

	const getUserInitials = (name?: string) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (isLoading) {
		return <div>Loading members...</div>;
	}

	const currentMembers = members || [];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<UsersIcon className="h-5 w-5" />
								Project Members
							</CardTitle>
							<CardDescription>
								{currentMembers.length} member
								{currentMembers.length !== 1 ? "s" : ""}
							</CardDescription>
						</div>
						{isAdmin && (
							<Button onClick={() => setIsAddDialogOpen(true)}>
								<UserPlus className="mr-2 h-4 w-4" />
								Add Member
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{currentMembers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<UsersIcon className="mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-4 text-muted-foreground">
								No members in this project yet
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{currentMembers.map((member) => (
									<TableRow key={member.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src={member.userImageUrl ?? undefined} />
													<AvatarFallback>
														{getUserInitials(
															member.userName ?? member.userEmail ?? undefined,
														)}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="font-medium">
														{member.userName ||
															member.userEmail ||
															member.user_id}
													</span>
													{member.userEmail && member.userName && (
														<span className="text-muted-foreground text-xs">
															{member.userEmail}
														</span>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													member.role === "admin" ? "secondary" : "outline"
												}
											>
												{member.role.charAt(0).toUpperCase() +
													member.role.slice(1)}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(member.created_at).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											{isAdmin && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => {
																const newRole =
																	member.role === "admin" ? "member" : "admin";
																handleUpdateRole(member.user_id, newRole);
															}}
														>
															{member.role === "admin"
																? "Change to Member"
																: "Change to Admin"}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => handleRemoveMember(member.user_id)}
														>
															Remove from Project
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Add Members to Project</DialogTitle>
						<DialogDescription>
							Select members from your organization to add to this project.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Organization Members</Label>
							<div className="max-h-96 space-y-2 overflow-y-auto rounded-md border p-4">
								{orgMembersData?.members
									.filter(
										(orgMember) =>
											!members?.some((m) => m.user_id === orgMember.userId),
									)
									.map((orgMember) => {
										const isSelected = selectedUserIds.includes(
											orgMember.userId ?? "",
										);
										const memberId = `member-${orgMember.userId}`;
										return (
											<Label
												key={orgMember.userId}
												htmlFor={memberId}
												className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 font-normal transition-colors ${
													isSelected
														? "border-primary bg-primary/10"
														: "hover:bg-accent"
												}`}
											>
												<Checkbox
													id={memberId}
													checked={isSelected}
													onCheckedChange={() => {
														if (!orgMember.userId) return;
														setSelectedUserIds((prev) =>
															isSelected
																? prev.filter((id) => id !== orgMember.userId)
																: [...prev, orgMember.userId!],
														);
													}}
												/>
												<Avatar className="h-10 w-10">
													<AvatarImage src={orgMember.imageUrl ?? undefined} />
													<AvatarFallback>
														{getUserInitials(
															`${orgMember.firstName ?? ""} ${orgMember.lastName ?? ""}`.trim() ||
																orgMember.email,
														)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1">
													<div className="font-medium">
														{orgMember.firstName || orgMember.lastName
															? `${orgMember.firstName ?? ""} ${orgMember.lastName ?? ""}`.trim()
															: orgMember.email}
													</div>
													{orgMember.email &&
														(orgMember.firstName || orgMember.lastName) && (
															<div className="text-muted-foreground text-sm">
																{orgMember.email}
															</div>
														)}
												</div>
											</Label>
										);
									})}
								{orgMembersData?.members.filter(
									(orgMember) =>
										!members?.some((m) => m.user_id === orgMember.userId),
								).length === 0 && (
									<div className="py-8 text-center text-muted-foreground">
										All organization members are already in this project
									</div>
								)}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={newMemberRole}
								onValueChange={(value) =>
									setNewMemberRole(value as "admin" | "member")
								}
							>
								<SelectTrigger id="role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsAddDialogOpen(false);
								setSelectedUserIds([]);
							}}
						>
							Cancel
						</Button>
						<Button onClick={handleAddMember} disabled={addMember.isPending}>
							{addMember.isPending
								? "Adding..."
								: `Add ${selectedUserIds.length > 0 ? selectedUserIds.length : ""} Member${selectedUserIds.length !== 1 ? "s" : ""}`}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
