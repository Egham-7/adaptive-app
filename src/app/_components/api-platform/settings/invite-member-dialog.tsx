"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { IosButton } from "@/components/ui/ios-button";
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
				<IosButton variant="bordered" disabled={isAtLimit}>
					<Plus className="h-4 w-4" />
					{isAtLimit ? "Member Limit Reached (5/5)" : "Invite Member"}
				</IosButton>
			</DialogTrigger>
			<DialogContent className="bg-[#0a0a0a] border border-white/10 backdrop-blur-xl">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className="text-white">Invite Team Member</DialogTitle>
						<DialogDescription className="text-white/50">
							Send an invitation to join your organization. You can have up to 5
							members (including admins and pending invitations).
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-white/70">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="colleague@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#34d399]/50 focus:ring-[#34d399]/20"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role" className="text-white/70">Role</Label>
							<Select
								value={role}
								onValueChange={(value) =>
									setRole(value as "org:admin" | "org:member")
								}
							>
								<SelectTrigger id="role" className="bg-white/5 border-white/10 text-white">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent className="bg-[#0a0a0a] border-white/10">
									<SelectItem value="org:member" className="text-white/70 focus:text-white focus:bg-white/10">Member</SelectItem>
									<SelectItem value="org:admin" className="text-white/70 focus:text-white focus:bg-white/10">Admin</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-white/40 text-xs">
								Admins can manage organization settings and members
							</p>
						</div>
					</div>
					<DialogFooter className="gap-2">
						<IosButton
							type="button"
							variant="bordered"
							onClick={() => setOpen(false)}
						>
							Cancel
						</IosButton>
						<IosButton type="submit" variant="bordered" disabled={createInvitation.isPending}>
							{createInvitation.isPending ? "Sending..." : "Send Invitation"}
						</IosButton>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
