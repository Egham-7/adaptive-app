"use client";

import { Home, Maximize2, Plus } from "lucide-react";
import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function CanvasControls() {
	const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow();

	const handleResetView = useCallback(() => {
		setCenter(0, 0, { zoom: 1, duration: 300 });
	}, [setCenter]);

	const handleFitView = useCallback(() => {
		fitView({ padding: 0.2, duration: 300 });
	}, [fitView]);

	const handleZoomIn = useCallback(() => {
		zoomIn();
	}, [zoomIn]);

	const handleZoomOut = useCallback(() => {
		zoomOut();
	}, [zoomOut]);

	return (
		<TooltipProvider>
			<div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleResetView}
							variant="outline"
							size="icon"
							className="h-9 w-9 bg-background"
						>
							<Home className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						<p>Reset View</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleFitView}
							variant="outline"
							size="icon"
							className="h-9 w-9 bg-background"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						<p>Fit to Content</p>
					</TooltipContent>
				</Tooltip>

				<div className="my-1 h-px w-full bg-border" />

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleZoomIn}
							variant="outline"
							size="icon"
							className="h-9 w-9 bg-background"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						<p>Zoom In</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleZoomOut}
							variant="outline"
							size="icon"
							className="h-9 w-9 bg-background"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								role="img"
								aria-label="Minus icon"
							>
								<title>Minus icon</title>
								<path d="M5 12h14" />
							</svg>
						</Button>
					</TooltipTrigger>
				<TooltipContent side="right">
					<p>Zoom Out</p>
				</TooltipContent>
			</Tooltip>
		</div>
	</TooltipProvider>
	);
}
