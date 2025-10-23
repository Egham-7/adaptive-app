"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOrgTracking } from "@/hooks/posthog/use-org-tracking";

export function OrganizationSwitcher() {
	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const { organization: activeOrg } = useOrganization();
	const { isLoaded, setActive, userMemberships } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});
	const { trackSwitched } = useOrgTracking();

	if (!isLoaded || !activeOrg) {
		return null;
	}

	const handleOrgSwitch = async (orgSlug: string | null) => {
		if (!setActive || !orgSlug) return;

		const membership = userMemberships.data?.find(
			(m) => m.organization.slug === orgSlug,
		);

		if (membership) {
			// Track organization switch
			trackSwitched({
				organizationId: membership.organization.id,
				organizationName: membership.organization.name,
			});

			await setActive({ organization: membership.organization.id });
			router.push(`/api-platform/orgs/${orgSlug}`);
		}
	};

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton className="w-fit px-1.5">
								<div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
									<Building2 className="size-3" />
								</div>
								<span className="truncate font-medium">{activeOrg.name}</span>
								<ChevronDown className="opacity-50" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-64 rounded-lg"
							align="start"
							side="bottom"
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-muted-foreground text-xs">
								Organizations
							</DropdownMenuLabel>
							{userMemberships.data?.map((membership) => (
								<DropdownMenuItem
									key={membership.organization.id}
									onClick={() => handleOrgSwitch(membership.organization.slug)}
									className="gap-2 p-2"
								>
									<div className="flex size-6 items-center justify-center rounded-xs border">
										<Building2 className="size-4 shrink-0" />
									</div>
									{membership.organization.name}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 p-2"
								onClick={() => setShowCreateDialog(true)}
							>
								<div className="flex size-6 items-center justify-center rounded-md border bg-background">
									<Plus className="size-4" />
								</div>
								<div className="font-medium text-muted-foreground">
									Add organization
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<CreateOrganizationDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
			/>
		</>
	);
}
