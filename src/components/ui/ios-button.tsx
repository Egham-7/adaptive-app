"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shared/utils";

const iosButtonVariants = cva(
	[
		"inline-flex items-center justify-center",
		"rounded-full min-w-[100px] px-5 py-2.5",
		"text-sm leading-[18px] font-[500] text-white",
		"font-sans font-normal",
		"transition-all duration-200 ease-out",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		// iOS 26 style with black transparent background and pill shape
		"bg-black/40 backdrop-blur-xl",
		"border border-white/[0.08]",
		"shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.15)]",
		"hover:bg-black/60 hover:border-white/15",
		"active:scale-[0.98] active:bg-black/70",
	],
	{
		variants: {
			variant: {
				default: "",
				emerald: [
					"bg-[#34d399]/10",
					"border-[#34d399]/30",
					"hover:bg-[#34d399]/20 hover:border-[#34d399]/40",
					"active:bg-[#34d399]/25",
				],
				bordered: [
					"bg-transparent",
					"border-2 border-[#34d399]",
					"hover:bg-[rgba(52,211,153,0.1)] hover:border-[#a3e635]",
					"active:bg-[rgba(52,211,153,0.15)]",
					"data-[state=open]:bg-[rgba(52,211,153,0.15)] data-[state=open]:border-[#a3e635]",
				],
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface IosButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iosButtonVariants> {
	asChild?: boolean;
}

const IosButton = React.forwardRef<HTMLButtonElement, IosButtonProps>(
	({ className, variant, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(iosButtonVariants({ variant, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
IosButton.displayName = "IosButton";

export { IosButton, iosButtonVariants };
