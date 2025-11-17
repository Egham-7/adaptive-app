"use client";

import { Check } from "lucide-react";
import { Handle, Position } from "reactflow";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { cn } from "@/lib/shared/utils";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

interface ProviderNodeCardProps {
	providerName: string;
	isCustom: boolean;
	isConfigured: boolean;
	onClick: () => void;
}

export function ProviderNodeCard({
	providerName,
	isCustom,
	isConfigured,
	onClick,
}: ProviderNodeCardProps) {
	const metadata = !isCustom
		? PROVIDER_METADATA[providerName as ProviderName]
		: null;

	const handleClick = (e: React.MouseEvent) => {
		// Don't trigger onClick on right-click (context menu)
		if (e.button === 2) {
			return;
		}
		onClick();
	};

	return (
		<>
			{/* Target handles for connections from adaptive router - all 4 sides */}
			<Handle
				type="target"
				position={Position.Top}
				id="top"
				style={{ opacity: 0 }}
			/>
			<Handle
				type="target"
				position={Position.Right}
				id="right"
				style={{ opacity: 0 }}
			/>
			<Handle
				type="target"
				position={Position.Bottom}
				id="bottom"
				style={{ opacity: 0 }}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left"
				style={{ opacity: 0 }}
			/>

			<button
				type="button"
				className={cn(
					"w-[260px] rounded-lg border-2 bg-background shadow-md transition-all hover:shadow-lg",
					"flex cursor-pointer flex-col",
					isConfigured
						? "border-emerald-500 border-solid"
						: "border-muted-foreground/30 border-dashed",
				)}
				onClick={handleClick}
			>
				{/* Status Badge */}
				{isConfigured && (
					<div className="absolute top-2 left-2">
						<div className="rounded-full border border-success/20 bg-success/10 p-0.5 shadow-sm">
							<Check className="h-3.5 w-3.5 text-success" />
						</div>
					</div>
				)}

				{/* Card Content */}
				<div className="p-6">
					{/* Provider Logo & Name */}
					<div className="mb-3 flex items-center gap-3">
						<ProviderLogo
							provider={providerName}
							width={32}
							height={32}
							className="rounded"
							alt={metadata?.displayName || providerName}
						/>
						<div className="min-w-0 flex-1">
							<h3 className="truncate font-semibold text-sm">
								{metadata?.displayName ?? providerName}
							</h3>
							{isCustom && (
								<p className="text-muted-foreground text-xs">Custom Provider</p>
							)}
						</div>
					</div>

					{/* Description */}
					<p className="mb-4 line-clamp-2 min-h-[2rem] text-muted-foreground text-xs">
						{metadata?.description ?? "Custom LLM provider configuration"}
					</p>

					{/* Status Text */}
					<div className="flex items-center justify-between">
						<span
							className={cn(
								"font-medium text-xs",
								isConfigured ? "text-success" : "text-muted-foreground",
							)}
						>
							{isConfigured ? "Configured" : "Not configured"}
						</span>
					</div>
				</div>
			</button>
		</>
	);
}
