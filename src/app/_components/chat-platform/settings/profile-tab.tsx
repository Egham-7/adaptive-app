"use client";

import type { UserResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type { UserMetadata } from "@/types/settings";

const userProfileFormSchema = z.object({
	fullName: z
		.string()
		.max(100, "Full name must be less than 100 characters")
		.optional(),
	preferredName: z
		.string()
		.max(50, "Preferred name must be less than 50 characters")
		.optional(),
	jobRole: z
		.string()
		.max(100, "Job role must be less than 100 characters")
		.optional(),
	personalPreferences: z
		.string()
		.max(1000, "Personal preferences must be less than 1000 characters")
		.optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;

interface ProfileTabProps {
	user: UserResource | null | undefined;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user }) => {
	const { data: preferences } = api.user.getPreferences.useQuery();

	const utils = api.useUtils();
	const updateMetadataMutation = api.user.updateMetadata.useMutation({
		onMutate: async (newMetadata: UserMetadata) => {
			await utils.user.getPreferences.cancel();

			const previousData = utils.user.getPreferences.getData();

			if (previousData) {
				utils.user.getPreferences.setData(undefined, (old) => {
					if (!old) return old;
					return {
						...old,
						...newMetadata,
					};
				});
			}

			return { previousData };
		},
		onError: (_err, _newMetadata, context) => {
			if (context?.previousData) {
				utils.user.getPreferences.setData(undefined, context.previousData);
			}
		},
		onSettled: () => {
			utils.user.getPreferences.invalidate();
		},
	});

	const form = useForm<UserProfileFormValues>({
		resolver: zodResolver(userProfileFormSchema),
		defaultValues: {
			fullName: preferences?.fullName ?? user?.fullName ?? "",
			preferredName: preferences?.preferredName ?? user?.firstName ?? "",
			jobRole: preferences?.jobRole ?? "",
			personalPreferences: preferences?.personalPreferences ?? "",
		},
	});

	useEffect(() => {
		if (preferences || user) {
			form.reset({
				fullName: preferences?.fullName ?? user?.fullName ?? "",
				preferredName: preferences?.preferredName ?? user?.firstName ?? "",
				jobRole: preferences?.jobRole ?? "",
				personalPreferences: preferences?.personalPreferences ?? "",
			});
		}
	}, [preferences, user, form]);

	const updateMetadata = async (field: keyof UserMetadata, value: string) => {
		try {
			await updateMetadataMutation.mutateAsync({ [field]: value });
		} catch (error) {
			console.error("Error updating metadata:", error);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						User Profile
					</CardTitle>
					<CardDescription>Personalize your AI chat experience</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={user?.imageUrl} />
							<AvatarFallback className="text-lg">
								{user?.firstName?.[0]}
								{user?.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<div className="space-y-1">
								<h3 className="font-semibold text-xl">
									{user?.fullName || "User"}
								</h3>
								<p className="text-muted-foreground">
									{user?.primaryEmailAddress?.emailAddress}
								</p>
							</div>
						</div>
					</div>

					<Form {...form}>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="fullName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your full name"
													{...field}
													onBlur={(e) => {
														field.onBlur();
														updateMetadata("fullName", e.target.value);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="preferredName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>What should we call you?</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your preferred name"
													{...field}
													onBlur={(e) => {
														field.onBlur();
														updateMetadata("preferredName", e.target.value);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="jobRole"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Job Role</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., Software Engineer, Designer, Manager"
													{...field}
													onBlur={(e) => {
														field.onBlur();
														updateMetadata("jobRole", e.target.value);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormItem>
									<FormLabel>Email (Read-only)</FormLabel>
									<FormControl>
										<Input
											type="email"
											value={user?.primaryEmailAddress?.emailAddress || ""}
											disabled
											className="bg-muted"
										/>
									</FormControl>
									<FormDescription>
										Manage email in Account settings
									</FormDescription>
								</FormItem>
							</div>

							<FormField
								control={form.control}
								name="personalPreferences"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Personal Preferences for Adaptive</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tell Adaptive about your work style, communication preferences, or anything else that would help personalize your experience..."
												rows={4}
												{...field}
												onBlur={(e) => {
													field.onBlur();
													updateMetadata("personalPreferences", e.target.value);
												}}
											/>
										</FormControl>
										<FormDescription>
											This helps Adaptive understand how to best assist you
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</Form>

					<Separator />
				</CardContent>
			</Card>
		</div>
	);
};
