import { cn } from "@/lib/shared/utils";

interface GridBackgroundProps {
	className?: string;
	gridSize?: number;
	children?: React.ReactNode;
}

export function GridBackground({
	className,
	gridSize = 40,
	children,
}: GridBackgroundProps) {
	return (
		<div className={cn("relative w-full h-full", className)}>
			{/* Grid Background with theme colors */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
					backgroundSize: `${gridSize}px ${gridSize}px`,
				}}
			/>
			{/* Content */}
			{children}
		</div>
	);
}
