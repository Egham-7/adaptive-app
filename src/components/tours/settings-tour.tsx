"use client";

import { useCallback, useEffect, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { useTourCompletion } from "@/hooks/use-tour-completion";

export function SettingsTour() {
	const { isCompleted, markComplete, isLoading } = useTourCompletion(
		"api-platform/settings",
	);
	const [runTour, setRunTour] = useState(false);

	const steps: Step[] = [
		{
			target: "body",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Project Settings</h3>
					<p className="text-muted-foreground text-sm">
						Welcome to your project settings! Here you can manage your project's
						configuration, update details, and control access.
					</p>
				</div>
			),
			placement: "center",
			disableBeacon: true,
		},
		{
			target: "nav",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Settings Navigation</h3>
					<p className="text-muted-foreground text-sm">
						Use this sidebar to navigate between different settings sections.
						You can manage general project information and team members.
					</p>
				</div>
			),
			placement: "right",
			disableBeacon: true,
		},
		{
			target: ".space-y-6",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Update Project Details</h3>
					<p className="text-muted-foreground text-sm">
						Change your project name and description here. These changes will be
						reflected across your entire project.
					</p>
				</div>
			),
			placement: "top",
			disableBeacon: true,
		},
	];

	const handleJoyrideCallback = useCallback(
		(data: CallBackProps) => {
			const { status } = data;

			if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
				markComplete();
				setRunTour(false);
			}
		},
		[markComplete],
	);

	useEffect(() => {
		if (!isLoading && !isCompleted) {
			setTimeout(() => setRunTour(true), 1000);
		}
	}, [isLoading, isCompleted]);

	if (isLoading || isCompleted) {
		return null;
	}

	return (
		<Joyride
			steps={steps}
			run={runTour}
			continuous
			showProgress
			showSkipButton
			scrollToFirstStep
			disableOverlay
			spotlightClicks
			callback={handleJoyrideCallback}
			styles={{
				options: {
					primaryColor: "#253957",
					textColor: "#eeeeee",
					backgroundColor: "#0b2142",
					arrowColor: "#0b2142",
					overlayColor: "rgba(0, 0, 0, 0.5)",
					zIndex: 10000,
				},
				tooltip: {
					borderRadius: "0.75rem",
					padding: "1.5rem",
					backgroundColor: "#0b2142",
					border: "2px solid #040c16",
					boxShadow: "2px 2px 10px 2px hsl(0 0% 0% / 0.5)",
				},
				tooltipContent: {
					padding: "0.5rem 0",
					color: "#eeeeee",
				},
			}}
			locale={{
				back: "Back",
				close: "Close",
				last: "Finish",
				next: "Next",
				skip: "Skip Tour",
			}}
		/>
	);
}
