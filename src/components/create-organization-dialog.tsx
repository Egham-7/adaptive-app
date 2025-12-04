"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { IosButton } from "@/components/ui/ios-button";
import { useCreateOrganization } from "@/hooks/organizations/use-create-organization";
import { useOrgTracking } from "@/hooks/posthog/use-org-tracking";

const formSchema = z.object({
	name: z.string().min(1, "Organization name is required"),
	slug: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^[a-z0-9-]+$/.test(val),
			"Slug can only contain lowercase letters, numbers, and hyphens",
		),
});

type FormData = z.infer<typeof formSchema>;

interface CreateOrganizationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({
	open,
	onOpenChange,
}: CreateOrganizationDialogProps) {
	const router = useRouter();
	const { setActive, userMemberships } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});
	const createOrgMutation = useCreateOrganization();
	const { trackCreated } = useOrgTracking();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		try {
			const org = await createOrgMutation.mutateAsync({
				name: data.name,
				slug: data.slug || undefined,
			});

			// Track organization creation
			trackCreated({
				organizationId: org.id,
				organizationName: org.name,
			});

			if (setActive) {
				await setActive({ organization: org.id });
			}

			await userMemberships?.revalidate?.();

			toast.success("Organization created successfully");
			onOpenChange(false);
			form.reset();
			if (org.slug) {
				router.push(`/api-platform/orgs/${org.slug}`);
			} else {
				router.push("/api-platform/orgs");
			}
		} catch (error) {
			toast.error("Failed to create organization");
			console.error(error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
				<DialogHeader className="text-center sm:text-left">
					<div className="flex items-center gap-3 mb-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34d399]/10 border border-[#34d399]/20">
							<Building2 className="h-5 w-5 text-[#34d399]" />
						</div>
						<DialogTitle className="text-xl font-medium text-white">
							Create Organization
						</DialogTitle>
					</div>
					<DialogDescription className="text-white/50">
						Create a new organization to manage your projects and team members.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-white/80 text-sm font-medium">
										Organization Name
									</FormLabel>
									<FormControl>
										<input
											placeholder="My Organization"
											className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#34d399]/50 focus:ring-1 focus:ring-[#34d399]/20 transition-all duration-200"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-400/90" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-white/80 text-sm font-medium">
										Slug <span className="text-white/40">(Optional)</span>
									</FormLabel>
									<FormControl>
										<input
											placeholder="my-organization"
											className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#34d399]/50 focus:ring-1 focus:ring-[#34d399]/20 transition-all duration-200"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-white/40 text-xs">
										A unique identifier for your organization URL. Leave blank
										to auto-generate.
									</FormDescription>
									<FormMessage className="text-red-400/90" />
								</FormItem>
							)}
						/>
						<div className="flex justify-end gap-3 pt-2">
							<IosButton
								type="button"
								variant="default"
								onClick={() => onOpenChange(false)}
								className="min-w-[80px]"
							>
								Cancel
							</IosButton>
							<IosButton
								type="submit"
								variant="bordered"
								disabled={createOrgMutation.isPending}
								className="min-w-[140px]"
							>
								{createOrgMutation.isPending ? "Creating..." : "Create Organization"}
							</IosButton>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
