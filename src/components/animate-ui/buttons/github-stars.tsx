"use client";

import { Github, Star } from "lucide-react";
import {
	AnimatePresence,
	type HTMLMotionProps,
	motion,
	type SpringOptions,
	type UseInViewOptions,
	useInView,
	useMotionValue,
	useSpring,
} from "motion/react";
import * as React from "react";
import { SlidingNumber } from "@/components/animate-ui/text/sliding-number";
import { cn } from "@/lib/shared/utils";

type FormatNumberResult = { number: string[]; unit: string };

function formatNumber(num: number, formatted: boolean): FormatNumberResult {
	if (formatted) {
		if (num < 1000) {
			return { number: [num.toString()], unit: "" };
		}
		const units = ["k", "M", "B", "T"];
		let unitIndex = 0;
		let n = num;
		while (n >= 1000 && unitIndex < units.length) {
			n /= 1000;
			unitIndex++;
		}
		const finalNumber = Math.floor(n).toString();
		return { number: [finalNumber], unit: units[unitIndex - 1] ?? "" };
	}
	return { number: num.toLocaleString("en-US").split(","), unit: "" };
}

type GitHubStarsButtonProps = HTMLMotionProps<"a"> & {
	username: string;
	repo: string;
	transition?: SpringOptions;
	formatted?: boolean;
	inView?: boolean;
	inViewMargin?: UseInViewOptions["margin"];
	inViewOnce?: boolean;
};

function GitHubStarsButton({
	ref,
	username,
	repo,
	transition = { stiffness: 90, damping: 50 },
	formatted = false,
	inView = false,
	inViewOnce = true,
	inViewMargin = "0px",
	className,
	...props
}: GitHubStarsButtonProps) {
	const motionVal = useMotionValue(0);
	const springVal = useSpring(motionVal, transition);
	const motionNumberRef = React.useRef(0);
	const isCompletedRef = React.useRef(false);
	const [, forceRender] = React.useReducer((x) => x + 1, 0);
	const [stars, setStars] = React.useState(0);
	const [isCompleted, setIsCompleted] = React.useState(false);
	const [displayParticles, setDisplayParticles] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(true);

	const repoUrl = React.useMemo(
		() => `https://github.com/${username}/${repo}`,
		[username, repo],
	);

	React.useEffect(() => {
		fetch(`https://api.github.com/repos/${username}/${repo}`)
			.then((response) => response.json())
			.then((data) => {
				if (data && typeof data.stargazers_count === "number") {
					setStars(data.stargazers_count);
				}
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	}, [username, repo]);

	const handleDisplayParticles = React.useCallback(() => {
		setDisplayParticles(true);
		setTimeout(() => setDisplayParticles(false), 1500);
	}, []);

	const localRef = React.useRef<HTMLAnchorElement>(null);
	React.useImperativeHandle(ref, () => localRef.current as HTMLAnchorElement);

	const inViewResult = useInView(localRef, {
		once: inViewOnce,
		margin: inViewMargin,
	});
	const isComponentInView = !inView || inViewResult;

	React.useEffect(() => {
		const unsubscribe = springVal.on("change", (latest: number) => {
			const newValue = Math.round(latest);
			if (motionNumberRef.current !== newValue) {
				motionNumberRef.current = newValue;
				forceRender();
			}
			if (stars !== 0 && newValue >= stars && !isCompletedRef.current) {
				isCompletedRef.current = true;
				setIsCompleted(true);
				handleDisplayParticles();
			}
		});
		return () => unsubscribe();
	}, [springVal, stars, handleDisplayParticles]);

	React.useEffect(() => {
		if (stars > 0 && isComponentInView) motionVal.set(stars);
	}, [motionVal, stars, isComponentInView]);

	const fillPercentage = Math.min(100, (motionNumberRef.current / stars) * 100);
	const formattedResult = formatNumber(motionNumberRef.current, formatted);
	const ghostFormattedNumber = formatNumber(stars, formatted);

	const renderNumberSegments = (
		segments: string[],
		unit: string,
		isGhost: boolean,
	) => (
		<span
			className={cn(
				"flex items-center gap-px",
				isGhost ? "invisible" : "absolute top-0 left-0",
			)}
		>
			{segments.map((segment, index) => (
				<React.Fragment key={index}>
					{Array.from(segment).map((digit, digitIndex) => (
						<SlidingNumber key={`${index}-${digitIndex}`} number={+digit} />
					))}
				</React.Fragment>
			))}

			{formatted && unit && <span className="leading-[1]">{unit}</span>}
		</span>
	);

	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			handleDisplayParticles();
			setTimeout(() => window.open(repoUrl, "_blank"), 500);
		},
		[handleDisplayParticles, repoUrl],
	);

	if (isLoading) return null;

	return (
		<motion.a
			ref={localRef}
			href={repoUrl}
			rel="noopener noreferrer"
			target="_blank"
			whileTap={{ scale: 0.95 }}
			whileHover={{ scale: 1.05 }}
			onClick={handleClick}
			className={cn(
				"flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-transparent border-2 border-[#34d399] px-4 py-2 font-normal text-white text-sm outline-none transition-all hover:bg-[rgba(52,211,153,0.1)] hover:border-[#a3e635] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<Github size={18} aria-label="GitHub" />
			<Star size={18} aria-label="Star" className="text-[#a3e635]" />
			{!isLoading && stars > 0 && (
				<span className="text-sm font-semibold">{stars.toLocaleString()}</span>
			)}
		</motion.a>
	);
}

export { GitHubStarsButton, type GitHubStarsButtonProps };
