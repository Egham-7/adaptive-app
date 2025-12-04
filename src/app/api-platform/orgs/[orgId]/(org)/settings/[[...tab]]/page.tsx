"use client";

import { useOrganization } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
	Settings, 
	Palette, 
	Users, 
	FolderKanban, 
	Key, 
	CreditCard, 
	Shield,
	ChevronRight
} from "lucide-react";
import { ApiKeysTab } from "@/app/_components/api-platform/settings/api-keys-tab";
import { AppearanceTab } from "@/app/_components/api-platform/settings/appearance-tab";
import { BillingTab } from "@/app/_components/api-platform/settings/billing-tab";
import { MembersTab } from "@/app/_components/api-platform/settings/members-tab";
import { PrivacyTab } from "@/app/_components/api-platform/settings/privacy-tab";
import { ProfileTab } from "@/app/_components/api-platform/settings/profile-tab";
import { ProjectsTab } from "@/app/_components/api-platform/settings/projects-tab";
import { cn } from "@/lib/shared/utils";

const navItems = [
	{ id: "general", label: "General", icon: Settings },
	{ id: "appearance", label: "Appearance", icon: Palette },
	{ id: "members", label: "Members", icon: Users },
	{ id: "projects", label: "Projects", icon: FolderKanban },
	{ id: "api-keys", label: "API Keys", icon: Key },
	{ id: "billing", label: "Billing", icon: CreditCard },
	{ id: "privacy", label: "Privacy Controls", icon: Shield },
];

const OrganizationSettingsPage: React.FC = () => {
	const { organization, isLoaded } = useOrganization();
	const params = useParams();
	const router = useRouter();
	const orgId = params.orgId as string;
	const activeTab = (params.tab as string[])?.[0] || "general";

	const handleTabChange = (value: string) => {
		router.push(`/api-platform/orgs/${orgId}/settings/${value}`);
	};

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-black">
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#34d399]" />
				</div>
			</div>
		);
	}

	if (!organization) {
		return (
			<div className="min-h-screen bg-black">
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-white/60">Organization not found</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<motion.div 
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="w-72 border-r border-white/10 bg-black/20 backdrop-blur-xl p-6"
				>
					<div className="mb-8">
						<h2 
							className="text-2xl font-light tracking-tight"
							style={{
								background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Settings
						</h2>
						<p className="text-white/40 text-sm mt-1">{organization.name}</p>
					</div>
					
					<nav className="space-y-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeTab === item.id;
							
							return (
								<button
									key={item.id}
									type="button"
									onClick={() => handleTabChange(item.id)}
									className={cn(
										"w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
										isActive
											? "bg-white/10 text-white border border-white/20"
											: "text-white/50 hover:text-white hover:bg-white/5"
									)}
								>
									<Icon className={cn(
										"h-4 w-4 transition-colors",
										isActive ? "text-[#34d399]" : ""
									)} />
									<span className="flex-1 text-sm font-medium">{item.label}</span>
									{isActive && (
										<ChevronRight className="h-4 w-4 text-white/40" />
									)}
								</button>
							);
						})}
					</nav>
				</motion.div>

				{/* Content */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="flex-1 p-8 overflow-auto"
				>
					<div className="max-w-4xl mx-auto">
						{activeTab === "general" && <ProfileTab organization={organization} />}
						{activeTab === "appearance" && <AppearanceTab />}
						{activeTab === "members" && (
							<MembersTab organizationId={organization.id} />
						)}
						{activeTab === "projects" && (
							<ProjectsTab organizationId={organization.id} />
						)}
						{activeTab === "api-keys" && (
							<ApiKeysTab organizationId={organization.id} />
						)}
						{activeTab === "billing" && (
							<BillingTab organizationId={organization.id} />
						)}
						{activeTab === "privacy" && <PrivacyTab />}
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default OrganizationSettingsPage;
