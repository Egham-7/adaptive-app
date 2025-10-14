import { useAuth, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DocsButton } from "@/components/ui/docs-button";
import { LegalButton } from "@/components/ui/legal-button";
import {
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { SupportButton } from "@/components/ui/support-button";
import { ModeToggle } from "../mode-toggle";

export function ApiSidebarNavFooter() {
	const { user } = useUser();
	const { signOut } = useAuth();
	const docsId = useId();
	const supportId = useId();
	const legalId = useId();

	if (!user) {
		return null;
	}

	return (
		<SidebarFooter>
			<SidebarSeparator />
			<SidebarMenu className="space-y-2 p-2">
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage
								src={user.imageUrl || "/default-avatar.png"}
								alt={user.firstName || "User"}
							/>
							<AvatarFallback className="rounded-lg">
								{user.firstName?.[0] || "U"}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">
								{user.firstName || "Unknown User"}
							</span>
							<span className="truncate text-xs">
								{user.emailAddresses?.[0]?.emailAddress || "No Email"}
							</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<div className="flex flex-wrap items-center justify-center gap-1">
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<div id={docsId}>
								<DocsButton variant="ghost" size="icon" showText={false} />
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<div id={supportId}>
								<SupportButton variant="ghost" size="icon" showText={false} />
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<div id={legalId}>
								<LegalButton variant="ghost" size="icon" showText={false} />
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={() => signOut()} title="Log out">
							<LogOut className="h-4 w-4" />
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<ModeToggle />
						</SidebarMenuButton>
					</SidebarMenuItem>
				</div>
			</SidebarMenu>
		</SidebarFooter>
	);
}
