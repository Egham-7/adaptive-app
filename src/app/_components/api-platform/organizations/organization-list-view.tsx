"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Building2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function OrganizationListView() {
	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const { organization: activeOrg } = useOrganization();
	const { isLoaded, setActive, userMemberships } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});

	const handleOrgSelect = async (orgId: string, orgSlug: string) => {
		if (!setActive) return;

		try {
			await setActive({ organization: orgId });
			router.push(`/api-platform/orgs/${orgSlug}`);
		} catch (error) {
			console.error("Failed to switch organization:", error);
		}
	};

	if (!isLoaded) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-12">
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl">Your Organizations</h1>
					<p className="text-muted-foreground">
						Select an organization to continue
					</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-6 w-3/4 rounded bg-muted" />
								<div className="h-4 w-1/2 rounded bg-muted" />
							</CardHeader>
							<CardContent>
								<div className="h-10 w-full rounded bg-muted" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	const organizations = userMemberships.data || [];

	return (
		<>
			<div className="container mx-auto max-w-6xl px-4 py-12">
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl">Your Organizations</h1>
					<p className="text-muted-foreground">
						{organizations.length > 0
							? "Select an organization to continue"
							: "Create your first organization to get started"}
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Create Organization Card */}
					<Card className="border-2 border-muted-foreground/25 border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-muted-foreground">
								<Plus className="h-5 w-5" />
								Create Organization
							</CardTitle>
							<CardDescription>
								Set up a new organization for your team
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={() => setShowCreateDialog(true)}
								variant="outline"
								className="w-full"
							>
								<Plus className="mr-2 h-4 w-4" />
								New Organization
							</Button>
						</CardContent>
					</Card>

					{/* Organization Cards */}
					{organizations.map((membership) => {
						const org = membership.organization;
						const isActive = activeOrg?.id === org.id;

						return (
							<Card
								key={org.id}
								className={`transition-all hover:shadow-lg ${
									isActive
										? "border-primary bg-primary/5 ring-2 ring-primary/20"
										: ""
								}`}
							>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<div
											className={`flex h-10 w-10 items-center justify-center rounded-lg ${
												isActive
													? "bg-primary text-primary-foreground"
													: "bg-muted"
											}`}
										>
											<Building2 className="h-5 w-5" />
										</div>
										<div className="flex-1 truncate">
											<div className="truncate font-semibold text-base">
												{org.name}
											</div>
											{isActive && (
												<span className="text-muted-foreground text-xs">
													Active
												</span>
											)}
										</div>
									</CardTitle>
									<CardDescription className="flex items-center gap-1.5">
										<Users className="h-3.5 w-3.5" />
										<span>
											{org.membersCount}{" "}
											{org.membersCount === 1 ? "member" : "members"}
										</span>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button
										onClick={() => handleOrgSelect(org.id, org.slug ?? "")}
										variant={isActive ? "default" : "outline"}
										className="w-full"
									>
										{isActive ? "Open Organization" : "Select Organization"}
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{organizations.length === 0 && (
					<div className="mt-8 text-center">
						<p className="text-muted-foreground text-sm">
							You don't have any organizations yet. Create one to get started!
						</p>
					</div>
				)}
			</div>

			<CreateOrganizationDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
			/>
		</>
	);
}
