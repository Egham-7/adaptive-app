"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Sparkles, ChevronDown, Plus } from "lucide-react";
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
							<SidebarMenuButton className="w-fit px-1.5 hover:bg-white/5">
								<div className="flex aspect-square size-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-lime-400">
									<Sparkles className="size-3 text-black" />
								</div>
								<span className="truncate font-medium text-white">{activeOrg.name}</span>
								<ChevronDown className="text-white/50" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-64 rounded-xl border-white/10 bg-black/95 backdrop-blur-xl"
							align="start"
							side="bottom"
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-white/50 text-xs">
								Organizations
							</DropdownMenuLabel>
							{userMemberships.data?.map((membership) => (
								<DropdownMenuItem
									key={membership.organization.id}
									onClick={() => handleOrgSwitch(membership.organization.slug)}
									className="gap-2 p-2 text-white hover:bg-white/10 focus:bg-white/10"
								>
									<div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-lime-400">
										<Sparkles className="size-3 text-black" />
									</div>
									{membership.organization.name}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator className="bg-white/10" />
							<DropdownMenuItem
								className="gap-2 p-2 text-white hover:bg-white/10 focus:bg-white/10"
								onClick={() => setShowCreateDialog(true)}
							>
								<div className="flex size-6 items-center justify-center rounded-md border border-white/20 bg-white/5">
									<Plus className="size-4 text-white/70" />
								</div>
								<div className="font-medium text-white/60">
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
