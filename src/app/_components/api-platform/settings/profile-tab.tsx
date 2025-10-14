"use client";

import type { OrganizationResource } from "@clerk/types";
import { Building2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileTabProps {
	organization: OrganizationResource | null | undefined;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ organization }) => {
	const [fullName, setFullName] = useState(organization?.name || "");
	const [displayName, setDisplayName] = useState(organization?.slug || "");

	const handleSave = async () => {
		if (!organization) return;

		try {
			await organization.update({
				name: fullName,
				slug: displayName,
			});
		} catch (error) {
			console.error("Error updating organization:", error);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Organization Profile
					</CardTitle>
					<CardDescription>
						Manage your organization's basic information
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={organization?.imageUrl} />
							<AvatarFallback className="text-lg">
								{organization?.name?.[0]?.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<div className="space-y-1">
								<h3 className="font-semibold text-xl">
									{organization?.name || "Organization"}
								</h3>
								<p className="text-muted-foreground text-sm">
									{organization?.membersCount} member
									{organization?.membersCount !== 1 ? "s" : ""}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="Enter organization name"
							/>
							<p className="text-muted-foreground text-xs">
								This is the display name for your organization
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="displayName">Display Name (slug)</Label>
							<Input
								id="displayName"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="organization-slug"
							/>
							<p className="text-muted-foreground text-xs">
								Used in URLs and for identification
							</p>
						</div>
					</div>

					<div className="flex justify-end">
						<Button onClick={handleSave}>Save Changes</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
