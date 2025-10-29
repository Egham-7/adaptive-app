"use client";

import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiKeyStep } from "@/app/_components/api-platform/onboarding/api-key-step";
import { CompleteStep } from "@/app/_components/api-platform/onboarding/complete-step";
import { ProjectStep } from "@/app/_components/api-platform/onboarding/project-step";
import { QuickstartStep } from "@/app/_components/api-platform/onboarding/quickstart-step";
import { WelcomeStep } from "@/app/_components/api-platform/onboarding/welcome-step";
import { Progress } from "@/components/ui/progress";
import { useCreateProjectApiKey } from "@/hooks/api_keys/use-create-project-api-key";
import { useOnboardingTracking } from "@/hooks/posthog/use-onboarding-tracking";
import { useCreateProject } from "@/hooks/projects/use-create-project";
import type { ProjectCreateResponse } from "@/types";

type OnboardingStep =
	| "welcome"
	| "project"
	| "api-key"
	| "quickstart"
	| "complete";

export default function OnboardingPage() {
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
	const [createdProject, setCreatedProject] =
		useState<ProjectCreateResponse | null>(null);
	const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
	const [onboardingStartTime] = useState(Date.now());
	const router = useRouter();
	const { organization } = useOrganization();

	const createProject = useCreateProject();
	const createApiKey = useCreateProjectApiKey();
	const { trackStepViewed, trackCompleted, trackSkipped } =
		useOnboardingTracking();

	// Track step views
	useEffect(() => {
		const mappedStep = (currentStep === "api-key" ? "api_key" : currentStep) as
			| "welcome"
			| "project"
			| "api_key"
			| "quickstart"
			| "complete";

		// Calculate step number inline to avoid dependency
		let stepNumber = 1;
		switch (currentStep) {
			case "welcome":
				stepNumber = 1;
				break;
			case "project":
				stepNumber = 2;
				break;
			case "api-key":
				stepNumber = 3;
				break;
			case "quickstart":
				stepNumber = 4;
				break;
			case "complete":
				stepNumber = 5;
				break;
		}

		trackStepViewed({
			step: mappedStep,
			stepNumber,
		});
	}, [currentStep, trackStepViewed]);

	const onProjectSubmit = (values: { name: string; description?: string }) => {
		if (!organization) {
			toast.error("No organization found. Please create one first.");
			return;
		}

		createProject.mutate(
			{
				...values,
				organizationId: organization.id,
			},
			{
				onSuccess: (data) => {
					setCreatedProject(data);
					setCurrentStep("api-key");
				},
				onError: (error) => {
					console.error("Failed to create project: ", error);
					toast.error(`Failed to create project: ${error.message}`);
				},
			},
		);
	};

	const handleCreateApiKey = () => {
		if (!createdProject) return;

		createApiKey.mutate(
			{
				name: "Default API Key",
				projectId: createdProject.id,
				expires_at: null,
			},
			{
				onSuccess: (data) => {
					if (data.key) {
						setCreatedApiKey(data.key);
						setCurrentStep("quickstart");
					} else {
						toast.error("API key created but key was not returned");
					}
				},
				onError: (error) => {
					console.error("Failed to create API key:", error);
					toast.error(`Failed to create API key: ${error.message}`);
				},
			},
		);
	};

	const handleSkipProject = () => {
		trackSkipped({ step: "project", reason: "user_skipped" });
		setCurrentStep("complete");
	};

	const handleSkipApiKey = () => {
		trackSkipped({ step: "api_key", reason: "user_skipped" });
		setCurrentStep("complete");
	};

	const handleSkipQuickstart = () => {
		trackSkipped({ step: "quickstart", reason: "user_skipped" });
		setCurrentStep("complete");
	};

	const getStepNumber = (step: OnboardingStep): number => {
		switch (step) {
			case "welcome":
				return 1;
			case "project":
				return 2;
			case "api-key":
				return 3;
			case "quickstart":
				return 4;
			case "complete":
				return 5;
			default:
				return 1;
		}
	};

	const getProgress = (): number => {
		return ((getStepNumber(currentStep) - 1) / 4) * 100;
	};

	const handleComplete = () => {
		// Track onboarding completion
		const completionTimeSeconds = Math.floor(
			(Date.now() - onboardingStartTime) / 1000,
		);
		trackCompleted({
			projectId: createdProject?.id ? String(createdProject.id) : undefined,
			hasApiKey: !!createdApiKey,
			completionTimeSeconds,
		});

		if (organization && createdProject) {
			router.push(
				`/api-platform/orgs/${organization.slug}/projects/${createdProject.id.toString()}`,
			);
		} else {
			router.push("/api-platform/orgs");
		}
	};

	const handleBack = () => {
		switch (currentStep) {
			case "project":
				setCurrentStep("welcome");
				break;
			case "api-key":
				setCurrentStep("project");
				break;
			case "quickstart":
				setCurrentStep("api-key");
				break;
			case "complete":
				if (createdApiKey) {
					setCurrentStep("quickstart");
				} else {
					setCurrentStep("api-key");
				}
				break;
			default:
				break;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
			<div className="container mx-auto max-w-2xl px-4 py-12">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl text-foreground">
						Welcome to Adaptive API Platform
					</h1>
					<p className="text-muted-foreground">
						Let's set up your first project
					</p>
				</div>

				{/* Progress */}
				<div className="mb-8">
					<Progress value={getProgress()} className="h-2" />
					<div className="mt-2 flex justify-between text-muted-foreground text-sm">
						<span>Step {getStepNumber(currentStep)} of 5</span>
						<span>{Math.round(getProgress())}% complete</span>
					</div>
				</div>

				{/* Welcome Step */}
				{currentStep === "welcome" && (
					<WelcomeStep onContinue={() => setCurrentStep("project")} />
				)}

				{/* Project Step */}
				{currentStep === "project" && (
					<ProjectStep
						onSubmit={onProjectSubmit}
						onBack={handleBack}
						onSkip={handleSkipProject}
						isLoading={createProject.isPending}
					/>
				)}

				{/* API Key Step */}
				{currentStep === "api-key" && (
					<ApiKeyStep
						onCreateApiKey={handleCreateApiKey}
						onSkip={handleSkipApiKey}
						onBack={handleBack}
						isLoading={createApiKey.isPending}
					/>
				)}

				{/* Quickstart Step */}
				{currentStep === "quickstart" && createdApiKey && (
					<QuickstartStep
						apiKey={createdApiKey}
						onContinue={() => setCurrentStep("complete")}
						onSkip={handleSkipQuickstart}
						onBack={handleBack}
					/>
				)}

				{/* Complete Step */}
				{currentStep === "complete" && (
					<CompleteStep onComplete={handleComplete} />
				)}
			</div>
		</div>
	);
}
