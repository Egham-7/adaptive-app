"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollAssembleProps {
	children: ReactNode;
	className?: string;
	direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
	delay?: number;
	duration?: number;
}

export function ScrollAssemble({
	children,
	className,
	direction = "up",
	delay = 0,
	duration = 0.8,
}: ScrollAssembleProps) {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const getInitialTransform = () => {
		switch (direction) {
			case "up":
				return { y: 100, opacity: 0 };
			case "down":
				return { y: -100, opacity: 0 };
			case "left":
				return { x: 100, opacity: 0 };
			case "right":
				return { x: -100, opacity: 0 };
			case "scale":
				return { scale: 0.8, opacity: 0 };
			case "fade":
				return { opacity: 0 };
			default:
				return { y: 100, opacity: 0 };
		}
	};

	return (
		<motion.div
			ref={ref}
			initial={getInitialTransform()}
			whileInView={{
				y: 0,
				x: 0,
				scale: 1,
				opacity: 1,
			}}
			viewport={{ once: true, margin: "-100px" }}
			transition={{
				duration,
				delay,
				ease: [0.25, 0.1, 0.25, 1],
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

interface ScrollProgressBuildProps {
	children: ReactNode;
	className?: string;
}

export function ScrollProgressBuild({
	children,
	className,
}: ScrollProgressBuildProps) {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center center"],
	});

	const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
	const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 30, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 0.95, 1]);
	const blur = useTransform(scrollYProgress, [0, 0.5, 1], [10, 5, 0]);

	return (
		<motion.div
			ref={ref}
			style={{
				opacity,
				y,
				scale,
				filter: `blur(${blur}px)`,
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

interface StaggerChildrenProps {
	children: ReactNode;
	className?: string;
	staggerDelay?: number;
}

export function StaggerChildren({
	children,
	className,
	staggerDelay = 0.1,
}: StaggerChildrenProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			variants={{
				visible: {
					transition: {
						staggerChildren: staggerDelay,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export const staggerItemVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
	},
} as const;
