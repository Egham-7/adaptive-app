"use client";

import { useCallback, useEffect, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { useTourCompletion } from "@/hooks/use-tour-completion";

export function ApiKeysTour() {
	const { isCompleted, markComplete, isLoading } = useTourCompletion(
		"api-platform/api-keys",
	);
	const [runTour, setRunTour] = useState(false);

	const steps: Step[] = [
		{
			target: "#create-api-key-button",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Create Your First API Key</h3>
					<p className="text-muted-foreground text-sm">
						Click here to create a new API key for your project. API keys are
						required to authenticate requests to the Adaptive API.
					</p>
				</div>
			),
			placement: "bottom",
			disableBeacon: true,
		},
		{
			target: "#api-keys-description",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Security Best Practices</h3>
					<p className="text-muted-foreground text-sm">
						Keep your API keys secure! Never share them publicly or expose them
						in client-side code. Adaptive will automatically disable any leaked
						keys.
					</p>
				</div>
			),
			placement: "top",
			disableBeacon: true,
		},
		{
			target: "#api-keys-table",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Manage Your Keys</h3>
					<p className="text-muted-foreground text-sm">
						View all your API keys here. You can see budget usage, rate limits,
						expiration dates, and manage each key. Create your first key to get
						started!
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
