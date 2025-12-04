"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/shared/utils";

export interface AuroraButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

const AuroraButton = React.forwardRef<HTMLButtonElement, AuroraButtonProps>(
	({ className, asChild = false, children, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		const [isHovered, setIsHovered] = React.useState(false);

		return (
			<Comp
				className={cn(
					"aurora-btn",
					"relative inline-flex items-center justify-center overflow-hidden",
					"rounded-full min-w-[90px] px-4 py-2",
					"text-sm leading-[18px] font-[500] text-white",
					"font-sans font-normal",
					"transition-all duration-300 ease-out",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] focus-visible:ring-offset-2",
					"disabled:pointer-events-none disabled:opacity-50",
					"bg-transparent backdrop-blur-xl",
					"border-2 border-[#34d399]",
					"shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.15)]",
					"hover:border-[#a3e635] hover:bg-[rgba(52,211,153,0.1)]",
					"active:scale-[0.98]",
					className
				)}
				ref={ref}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				{...props}
			>
				{/* Aurora gradient background - shows on hover */}
				<div
					className={cn(
						"absolute inset-0 transition-opacity duration-300",
						isHovered ? "opacity-100" : "opacity-0"
					)}
				>
					<div className="aurora-wave absolute inset-0" />
				</div>

				{/* Content */}
				<span className="relative z-10 flex items-center gap-2">{children}</span>

				<style jsx>{`
					.aurora-wave {
						background: linear-gradient(
							90deg,
							rgba(16, 185, 129, 0.3) 0%,
							rgba(52, 211, 153, 0.4) 25%,
							rgba(163, 230, 53, 0.3) 50%,
							rgba(52, 211, 153, 0.4) 75%,
							rgba(16, 185, 129, 0.3) 100%
						);
						background-size: 200% 100%;
						animation: aurora-flow 3s ease-in-out infinite;
					}

					@keyframes aurora-flow {
						0% {
							background-position: 0% 50%;
						}
						50% {
							background-position: 100% 50%;
						}
						100% {
							background-position: 0% 50%;
						}
					}

					.aurora-btn:hover .aurora-wave {
						animation: aurora-flow 2s ease-in-out infinite;
					}

					.aurora-btn:hover {
						box-shadow:
							0 0 20px rgba(52, 211, 153, 0.3),
							0 0 40px rgba(16, 185, 129, 0.2),
							inset 0 0 20px rgba(52, 211, 153, 0.1);
					}
				`}</style>
			</Comp>
		);
	}
);
AuroraButton.displayName = "AuroraButton";

export { AuroraButton };
