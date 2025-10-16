"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateOrganizationInvitation } from "@/hooks/organizations/use-create-organization-invitation";

interface InviteMemberDialogProps {
	organizationId: string;
	currentMemberCount: number;
	pendingInvitationCount: number;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
	organizationId,
	currentMemberCount,
	pendingInvitationCount,
}) => {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"org:admin" | "org:member">("org:member");

	const totalCount = currentMemberCount + pendingInvitationCount;
	const isAtLimit = totalCount >= 5;

	const createInvitation = useCreateOrganizationInvitation();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		createInvitation.mutate(
			{
				organizationId,
				emailAddress: email,
				role,
			},
			{
				onSuccess: () => {
					setOpen(false);
					setEmail("");
					setRole("org:member");
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={isAtLimit}>
					<Plus className="mr-2 h-4 w-4" />
					{isAtLimit ? "Member Limit Reached (5/5)" : "Invite Member"}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Invite Team Member</DialogTitle>
						<DialogDescription>
							Send an invitation to join your organization. You can have up to 5
							members (including admins and pending invitations).
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="colleague@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={role}
								onValueChange={(value) =>
									setRole(value as "org:admin" | "org:member")
								}
							>
								<SelectTrigger id="role">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="org:member">Member</SelectItem>
									<SelectItem value="org:admin">Admin</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">
								Admins can manage organization settings and members
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createInvitation.isPending}>
							{createInvitation.isPending ? "Sending..." : "Send Invitation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
