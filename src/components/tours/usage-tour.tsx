"use client";

import { useCallback, useEffect, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { useTourCompletion } from "@/hooks/use-tour-completion";

export function UsageTour() {
	const { isCompleted, markComplete, isLoading } =
		useTourCompletion("api-platform/usage");
	const [runTour, setRunTour] = useState(false);

	const steps: Step[] = [
		{
			target: "#usage-visualizations",
			content: (
				<div>
					<h3 className="mb-2 font-semibold">Monitor Your Usage</h3>
					<p className="text-muted-foreground text-sm">
						Track your API usage, costs, and performance in real-time. View
						detailed analytics including request trends, cost breakdowns, and
						provider performance.
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
