"use client";

import { Check, Settings2, Zap } from "lucide-react";
import { Handle, Position } from "reactflow";
import { SocialLogo } from "@/components/ui/social-logo";
import { cn } from "@/lib/shared/utils";

interface AdaptiveNodeCardProps {
	isConfigured: boolean;
	onClick: () => void;
	highlight?: boolean;
}

export function AdaptiveNodeCard({
	isConfigured,
	onClick,
	highlight = false,
}: AdaptiveNodeCardProps) {
	const handleClick = (e: React.MouseEvent) => {
		// Don't trigger onClick on right-click (context menu)
		if (e.button === 2) {
			return;
		}
		onClick();
	};

	// Determine status text
	const getStatusText = () => {
		if (!isConfigured) return "Click to Configure";
		return "Project Config";
	};

	// Badge text is always "Project"
	const getBadgeText = () => {
		return "Project";
	};

	return (
		<>
			{/* Source handles for connections to all providers */}
			<Handle
				type="source"
				position={Position.Top}
				id="top"
				style={{ opacity: 0 }}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right"
				style={{ opacity: 0 }}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom"
				style={{ opacity: 0 }}
			/>
			<Handle
				type="source"
				position={Position.Left}
				id="left"
				style={{ opacity: 0 }}
			/>

			<button
				type="button"
				className={cn(
					"relative flex cursor-pointer flex-col items-center justify-center",
					"rounded-2xl border-4 bg-gradient-to-br shadow-2xl transition-all duration-300",
					"hover:scale-105 hover:shadow-3xl",
					"h-[320px] w-[320px]",
					isConfigured
						? "border-primary from-primary/20 via-background to-primary/10 shadow-primary/20"
						: "border-muted-foreground/40 border-dashed from-muted via-background to-muted shadow-muted/20",
					highlight && "animate-pulse ring-4 ring-primary/50",
				)}
				onClick={handleClick}
			>
				{/* Decorative corner accents */}
				<div className="absolute top-3 right-3">
					<Settings2
						className={cn(
							"h-5 w-5 transition-colors",
							isConfigured ? "text-primary" : "text-muted-foreground",
						)}
					/>
				</div>

				{/* Status Badge */}
				{isConfigured && (
					<div className="absolute top-3 left-3">
						<div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2 py-1 shadow-sm">
							<Check className="h-3 w-3 text-success" />
							<span className="font-medium text-success text-xs">
								{getBadgeText()}
							</span>
						</div>
					</div>
				)}

				{/* Main Content */}
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					{/* Logo with glow effect */}
					<div
						className={cn(
							"relative rounded-2xl p-4 transition-all",
							isConfigured
								? "bg-primary/10 ring-2 ring-primary/20"
								: "bg-muted ring-2 ring-muted-foreground/20",
						)}
					>
						<SocialLogo width={80} height={80} className="rounded-lg" />
						{isConfigured && (
							<div className="-bottom-1 -right-1 absolute rounded-full bg-primary p-1.5 shadow-lg">
								<Zap
									className="h-4 w-4 text-primary-foreground"
									fill="currentColor"
								/>
							</div>
						)}
					</div>

					{/* Title */}
					<div className="space-y-1">
						<h3 className="font-bold text-xl">Adaptive Router</h3>
						<p className="max-w-[240px] text-muted-foreground text-xs leading-relaxed">
							Intelligent routing hub for cost optimization and performance
						</p>
					</div>

					{/* Status Indicator */}
					<div
						className={cn(
							"rounded-full px-4 py-1.5 font-semibold text-xs transition-colors",
							isConfigured
								? "bg-success/20 text-success"
								: "bg-muted-foreground/20 text-muted-foreground",
						)}
					>
						{getStatusText()}
					</div>
				</div>
			</button>
		</>
	);
}
