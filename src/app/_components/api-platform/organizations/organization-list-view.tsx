"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Building2, Plus, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import { AuroraHeroBackground } from "@/components/ui/aurora-hero-background";
import { IosButton } from "@/components/ui/ios-button";
import { cn } from "@/lib/shared/utils";

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
			<AuroraHeroBackground>
				<div className="container mx-auto max-w-6xl px-4 py-12">
					<div className="mb-12 text-center">
						<h1 className="mb-3 font-light text-4xl md:text-5xl tracking-tight text-white">
							Your Organizations
						</h1>
						<p className="text-white/50 text-lg">
							Select an organization to continue
						</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="animate-pulse rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6"
							>
								<div className="h-6 w-3/4 rounded-lg bg-white/10 mb-4" />
								<div className="h-4 w-1/2 rounded-lg bg-white/10 mb-6" />
								<div className="h-12 w-full rounded-xl bg-white/10" />
							</div>
						))}
					</div>
				</div>
			</AuroraHeroBackground>
		);
	}

	const organizations = userMemberships.data || [];

	return (
		<>
			<AuroraHeroBackground>
				<div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
					<motion.div 
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="mb-12 text-center"
					>
						<h1 
							className="mb-4 font-light text-4xl md:text-5xl lg:text-6xl tracking-tight"
							style={{
								background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Your Organizations
						</h1>
						<p className="text-white/50 text-lg md:text-xl">
							{organizations.length > 0
								? "Select an organization to continue"
								: "Create your first organization to get started"}
						</p>
					</motion.div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{/* Create Organization Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							onClick={() => setShowCreateDialog(true)}
							className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/20 bg-black/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#34d399]/50 hover:bg-black/50 flex items-center justify-center min-h-[140px]"
						>
							<div className="flex flex-col items-center gap-3 text-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-[#34d399]/30 group-hover:bg-[#34d399]/10 transition-all duration-300">
									<Plus className="h-6 w-6 text-white/50 group-hover:text-[#34d399] transition-colors" />
								</div>
								<div>
									<h3 className="font-medium text-white/70 group-hover:text-white transition-colors">
										Create Organization
									</h3>
									<p className="text-sm text-white/40">
										Set up a new team
									</p>
								</div>
							</div>
						</motion.div>

						{/* Organization Cards */}
						{organizations.map((membership, index) => {
							const org = membership.organization;
							const isActive = activeOrg?.id === org.id;

							return (
								<motion.div
									key={org.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
								onClick={() => handleOrgSelect(org.id, org.slug ?? "")}
								className={cn(
									"group cursor-pointer rounded-2xl border backdrop-blur-xl p-6 transition-all duration-300",
									isActive
										? "border-[#34d399]/40 bg-black/50"
										: "border-white/10 bg-black/40 hover:border-[#34d399]/30 hover:bg-black/50"
								)}
							>
									<div className="flex items-center gap-3 mb-4">
									<div
										className={cn(
											"flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
											isActive
												? "bg-white/10 text-white border border-white/20"
												: "bg-white/5 border border-white/10 group-hover:border-white/20"
										)}
									>
											<Building2 className="h-6 w-6" />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-white truncate">
												{org.name}
											</h3>
											<div className="flex items-center gap-1.5 text-white/40">
												<Users className="h-3.5 w-3.5" />
												<span className="text-sm">
													{org.membersCount}{" "}
													{org.membersCount === 1 ? "member" : "members"}
												</span>
												{isActive && (
													<span className="ml-2 text-xs text-white/60 font-medium">
														Active
													</span>
												)}
											</div>
										</div>
									</div>
									<IosButton
										variant="bordered"
										className="w-full"
									>
										{isActive ? "Open Organization" : "Select Organization"}
										<ArrowRight className="h-4 w-4" />
									</IosButton>
								</motion.div>
							);
						})}
					</div>

					{organizations.length === 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="mt-12 text-center"
						>
							<p className="text-white/40 text-sm">
								You don't have any organizations yet. Create one to get started!
							</p>
						</motion.div>
					)}
				</div>
			</AuroraHeroBackground>

			<CreateOrganizationDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
			/>
		</>
	);
}
