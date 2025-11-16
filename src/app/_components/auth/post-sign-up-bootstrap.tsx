"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import {
	AlertCircle,
	Building2,
	CheckCircle,
	FolderKanban,
	Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperNav,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from "@/components/ui/stepper";
import { api } from "@/trpc/react";

type BootstrapResult = {
	organizationId: string;
	organizationSlug: string | null;
	projectId: number;
};

type BootstrapStep =
	| "idle"
	| "creating_org"
	| "creating_project"
	| "activating"
	| "navigating"
	| "complete"
	| "error";

export function PostSignUpBootstrap() {
	const router = useRouter();
	const { organization } = useOrganization();
	const { setActive, userMemberships } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});
	const bootstrap = api.organizations.bootstrapAfterSignup.useMutation();
	const hasTriggeredRef = useRef(false);
	const [provision, setProvision] = useState<BootstrapResult | null>(null);
	const [hasNavigated, setHasNavigated] = useState(false);
	const [currentStep, setCurrentStep] = useState<BootstrapStep>("idle");
	const bootstrapStartTime = useRef<number>(0);

	const logDebug = useCallback((message: string, data?: unknown) => {
		const timestamp = Date.now() - bootstrapStartTime.current;
		console.log(`[PostSignUp ${timestamp}ms] ${message}`, data || "");
	}, []);

	const navigateToDashboard = useCallback(
		(target: BootstrapResult) => {
			if (hasNavigated) {
				logDebug("Navigation already completed, skipping");
				return;
			}

			logDebug("Attempting navigation", {
				organizationSlug: target.organizationSlug,
				projectId: target.projectId,
				hasClerkSlug: !!organization?.slug,
			});

			// Use the slug from bootstrap response, fallback to Clerk's organization
			const slug = target.organizationSlug ?? organization?.slug;

			if (slug) {
				const dashboardUrl = `/api-platform/orgs/${slug}/projects/${target.projectId}`;
				logDebug("Navigating to project dashboard", { url: dashboardUrl });
				setCurrentStep("navigating");
				router.replace(dashboardUrl);
				setHasNavigated(true);
				setCurrentStep("complete");

				toast.success("Workspace ready!", {
					description: "Welcome to your new workspace",
					icon: <CheckCircle className="h-4 w-4" />,
				});
			} else {
				// Fallback to organizations list if slug is unavailable
				logDebug("No slug available, navigating to organizations list");
				const orgsUrl = "/api-platform/orgs";
				router.replace(orgsUrl);
				setHasNavigated(true);
				setCurrentStep("complete");

				toast.warning("Workspace created", {
					description: "Please select your organization to continue",
				});
			}
		},
		[organization?.slug, router, hasNavigated, logDebug],
	);

	const setActiveOrganization = useCallback(
		async (data: BootstrapResult) => {
			if (!setActive) {
				logDebug("setActive not available, skipping organization activation");
				setProvision(data);
				return;
			}

			try {
				setCurrentStep("activating");
				logDebug("Activating organization", {
					organizationId: data.organizationId,
				});

				await setActive({ organization: data.organizationId });
				await userMemberships?.revalidate?.();

				logDebug("Organization activated successfully");
				setProvision(data);
			} catch (error) {
				logDebug("Failed to activate organization", error);
				console.error("Failed to activate organization after signup:", error);

				// Even if activation fails, try to navigate with the data we have
				setProvision(data);

				toast.error("Organization activation failed", {
					description: "Attempting to continue anyway...",
					icon: <AlertCircle className="h-4 w-4" />,
				});
			}
		},
		[setActive, userMemberships, logDebug],
	);

	const bootstrapWorkspace = useCallback(async () => {
		try {
			bootstrapStartTime.current = Date.now();
			setCurrentStep("creating_org");
			logDebug("Starting workspace bootstrap - Creating organization");

			const result = await bootstrap.mutateAsync();

			logDebug("Bootstrap successful", {
				organizationId: result.organizationId,
				organizationSlug: result.organizationSlug,
				projectId: result.projectId,
			});

			setCurrentStep("creating_project");
			logDebug("Organization created, project created");

			await setActiveOrganization(result);
		} catch (error) {
			setCurrentStep("error");
			logDebug("Bootstrap failed", error);
			console.error("Failed to bootstrap workspace:", error);

			toast.error("Failed to create workspace", {
				description:
					error instanceof Error ? error.message : "Please try again",
				icon: <AlertCircle className="h-4 w-4" />,
				duration: 5000,
			});
		}
	}, [bootstrap, setActiveOrganization, logDebug]);

	// Trigger bootstrap on mount
	useEffect(() => {
		if (hasTriggeredRef.current) {
			return;
		}
		hasTriggeredRef.current = true;
		void bootstrapWorkspace();
	}, [bootstrapWorkspace]);

	// Navigate immediately when provision data is available
	useEffect(() => {
		if (!provision || hasNavigated) {
			return;
		}

		logDebug("Provision data available, attempting immediate navigation");

		// Try to navigate immediately with the data from bootstrap
		// Don't wait for Clerk's organization sync
		navigateToDashboard(provision);
	}, [provision, hasNavigated, navigateToDashboard, logDebug]);

	// Fallback timeout - navigate after 3 seconds if we haven't already
	useEffect(() => {
		if (!provision || hasNavigated) {
			return;
		}

		logDebug("Setting up fallback navigation timeout (3s)");

		const timeout = window.setTimeout(() => {
			logDebug("Fallback timeout triggered");
			navigateToDashboard(provision);
		}, 3000);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [hasNavigated, navigateToDashboard, provision, logDebug]);

	const handleRetry = () => {
		if (bootstrap.isPending) return;

		logDebug("User triggered retry");

		bootstrap.reset();
		hasTriggeredRef.current = false;
		setProvision(null);
		setHasNavigated(false);
		setCurrentStep("idle");
		bootstrapStartTime.current = 0;

		void bootstrapWorkspace();
	};

	const getStepMessage = () => {
		switch (currentStep) {
			case "creating_org":
				return "Creating your organization...";
			case "creating_project":
				return "Setting up your first project...";
			case "activating":
				return "Activating your workspace...";
			case "navigating":
				return "Taking you to your dashboard...";
			case "complete":
				return "All set!";
			default:
				return "Preparing your workspace...";
		}
	};

	const getCurrentStepNumber = () => {
		switch (currentStep) {
			case "creating_org":
				return 1;
			case "creating_project":
				return 2;
			case "activating":
				return 3;
			case "navigating":
			case "complete":
				return 3;
			default:
				return 0;
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-2xl space-y-8">
				{/* Header */}
				<div className="space-y-2 text-center">
					<h1 className="font-semibold text-2xl">Setting up your workspace</h1>
					<p className="text-muted-foreground">
						{currentStep === "error"
							? "Something went wrong during setup"
							: "We're preparing everything for you. This only takes a moment."}
					</p>
				</div>

				{/* Stepper Progress */}
				{currentStep !== "error" && (
					<Stepper value={getCurrentStepNumber()} className="w-full">
						<StepperNav className="mb-8">
							<StepperItem
								step={1}
								completed={getCurrentStepNumber() > 1}
								loading={currentStep === "creating_org"}
							>
								<StepperTrigger>
									<StepperIndicator>
										{currentStep === "creating_org" ? (
											<Loader2 className="h-3 w-3 animate-spin" />
										) : getCurrentStepNumber() > 1 ? (
											<CheckCircle className="h-3 w-3" />
										) : (
											<Building2 className="h-3 w-3" />
										)}
									</StepperIndicator>
									<div className="flex flex-col items-start">
										<StepperTitle>Create Organization</StepperTitle>
										<StepperDescription className="hidden sm:block">
											Setting up your workspace
										</StepperDescription>
									</div>
								</StepperTrigger>
								<StepperSeparator />
							</StepperItem>

							<StepperItem
								step={2}
								completed={getCurrentStepNumber() > 2}
								loading={currentStep === "creating_project"}
							>
								<StepperTrigger>
									<StepperIndicator>
										{currentStep === "creating_project" ? (
											<Loader2 className="h-3 w-3 animate-spin" />
										) : getCurrentStepNumber() > 2 ? (
											<CheckCircle className="h-3 w-3" />
										) : (
											<FolderKanban className="h-3 w-3" />
										)}
									</StepperIndicator>
									<div className="flex flex-col items-start">
										<StepperTitle>Create Project</StepperTitle>
										<StepperDescription className="hidden sm:block">
											Your first project
										</StepperDescription>
									</div>
								</StepperTrigger>
								<StepperSeparator />
							</StepperItem>

							<StepperItem
								step={3}
								completed={currentStep === "complete"}
								loading={
									currentStep === "activating" || currentStep === "navigating"
								}
							>
								<StepperTrigger>
									<StepperIndicator>
										{currentStep === "activating" ||
										currentStep === "navigating" ? (
											<Loader2 className="h-3 w-3 animate-spin" />
										) : currentStep === "complete" ? (
											<CheckCircle className="h-3 w-3" />
										) : (
											"3"
										)}
									</StepperIndicator>
									<div className="flex flex-col items-start">
										<StepperTitle>Activate</StepperTitle>
										<StepperDescription className="hidden sm:block">
											Finalizing setup
										</StepperDescription>
									</div>
								</StepperTrigger>
							</StepperItem>
						</StepperNav>
					</Stepper>
				)}

				{/* Status Message */}
				{currentStep !== "error" && (
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-10 w-10 animate-spin text-primary" />
						<p className="text-muted-foreground text-sm">{getStepMessage()}</p>
					</div>
				)}

				{/* Error State */}
				{bootstrap.isError && currentStep === "error" && (
					<div className="flex flex-col items-center gap-6 text-center">
						<AlertCircle className="h-16 w-16 text-destructive" />
						<div className="space-y-2">
							<h2 className="font-semibold text-xl">Something went wrong</h2>
							<p className="text-muted-foreground">
								{bootstrap.error?.message ||
									"We couldn't set up your workspace. Please try again."}
							</p>
						</div>
						<Button
							onClick={handleRetry}
							disabled={bootstrap.isPending}
							size="lg"
						>
							{bootstrap.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Retrying...
								</>
							) : (
								"Try again"
							)}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
