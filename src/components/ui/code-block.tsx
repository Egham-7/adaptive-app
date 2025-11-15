"use client";

import { Languages } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useState } from "react";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/shared/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CodeBlockProps = {
	children?: React.ReactNode;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
	return (
		<div
			className={cn(
				"not-prose flex w-full flex-col overflow-clip border min-w-0",
				"border-border bg-card text-card-foreground rounded-xl",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export type CodeBlockCodeProps = {
	code: string;
	language?: string;
	theme?: string;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
	code,
	language = "tsx",
	theme,
	className,
	...props
}: CodeBlockCodeProps) {
	const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		let isMounted = true;
		async function highlight() {
			if (!code) {
				if (isMounted) {
					setHighlightedHtml("<pre><code></code></pre>");
				}
				return;
			}

			if (theme === undefined && !resolvedTheme) {
				return;
			}

			const selectedTheme =
				theme || (resolvedTheme === "dark" ? "github-dark" : "github-light");

			const html = await codeToHtml(code, {
				lang: language,
				theme: selectedTheme,
				transformers: [],
			});

			if (isMounted) {
				setHighlightedHtml(html);
			}
		}
		void highlight();
		return () => {
			isMounted = false;
		};
	}, [code, language, theme, resolvedTheme]);

	const classNames = cn(
		"w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4 [&>pre]:w-full [&>pre]:min-w-0",
		className,
	);

	return highlightedHtml ? (
		<div
			className={classNames}
			dangerouslySetInnerHTML={{ __html: highlightedHtml }}
			role="region"
			aria-label={`Code block in ${language}`}
			{...props}
		/>
	) : (
		<div
			className={classNames}
			role="region"
			aria-label={`Code block in ${language}`}
			{...props}
		>
			<pre>
				<code>{code}</code>
			</pre>
		</div>
	);
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
	return (
		<div className={cn("flex items-center justify-between", className)} {...props}>
			{children}
		</div>
	);
}

export interface CodeBlockLanguageOption {
	id: string;
	label: string;
	description?: string;
}

interface CodeBlockLanguageSelectorProps {
	options: CodeBlockLanguageOption[];
	value: string;
	onChange: (id: string) => void;
	className?: string;
}

function CodeBlockLanguageSelector({
	options,
	value,
	onChange,
	className,
}: CodeBlockLanguageSelectorProps) {
	if (options.length <= 1) return null;

	const activeOption = useMemo(
		() => options.find((option) => option.id === value) ?? options[0],
		[options, value],
	);

	if (!activeOption) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				type="button"
				className={cn(
					"border-input bg-background hover:bg-accent text-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
					className,
				)}
			>
				<Languages className="h-3.5 w-3.5" />
				{activeOption.label}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[10rem]">
				{options.map((option) => (
					<DropdownMenuItem
						key={option.id}
						className="flex flex-col items-start gap-0"
						onClick={() => onChange(option.id)}
					>
						<span className="text-sm font-medium">{option.label}</span>
						{option.description && (
							<span className="text-muted-foreground text-xs">
								{option.description}
							</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock, CodeBlockLanguageSelector };
