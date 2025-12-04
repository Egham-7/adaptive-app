"use client";
import { cn } from "@/lib/shared/utils";
import React, { type ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
	children: ReactNode;
	showRadialGradient?: boolean;
}

export const AuroraBackground = ({
	className,
	children,
	showRadialGradient = true,
	...props
}: AuroraBackgroundProps) => {
	return (
		<div
			className={cn(
				"relative flex flex-col min-h-screen w-full items-center justify-start bg-black text-white transition-bg overflow-hidden",
				className
			)}
			{...props}
		>
			<div className="absolute inset-0 overflow-hidden">
				<div
					className={cn(
						`
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--emerald-500)_10%,var(--green-400)_15%,var(--lime-300)_20%,var(--emerald-400)_25%,var(--green-500)_30%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert-0
            after:content-[""] after:absolute after:inset-0 
            after:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform
            animate-aurora`,
						showRadialGradient &&
							`[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
					)}
				/>
			</div>
			{children}
		</div>
	);
};
