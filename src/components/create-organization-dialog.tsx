"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { useCreateOrganization } from "@/hooks/organizations/use-create-organization";

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

			if (setActive) {
				await setActive({ organization: org.id });
			}

			await userMemberships?.revalidate?.();

			toast.success("Organization created successfully");
			onOpenChange(false);
			form.reset();
			router.push("/api-platform/onboarding");
		} catch (error) {
			toast.error("Failed to create organization");
			console.error(error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Organization</DialogTitle>
					<DialogDescription>
						Create a new organization to manage your projects and team members.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input placeholder="My Organization" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="my-organization" {...field} />
									</FormControl>
									<FormDescription>
										A unique identifier for your organization URL. Leave blank
										to auto-generate.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createOrgMutation.isPending}>
								{createOrgMutation.isPending ? "Creating..." : "Create"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
