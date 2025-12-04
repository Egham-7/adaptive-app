"use client";

import { Monitor, Moon, Palette, Sun, Check } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/shared/utils";

type Theme = "light" | "dark" | "system";

export const AppearanceTab: React.FC = () => {
	const [theme, setTheme] = useState<Theme>("system");

	useEffect(() => {
		const storedTheme = localStorage.getItem("theme") as Theme;
		if (storedTheme) {
			setTheme(storedTheme);
		} else {
			setTheme("system");
		}
	}, []);

	const handleThemeChange = (value: Theme) => {
		setTheme(value);
		localStorage.setItem("theme", value);

		const root = window.document.documentElement;
		root.classList.remove("light", "dark");

		if (value === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(value);
		}
	};

	const themeOptions = [
		{
			value: "light" as Theme,
			label: "Light",
			description: "Light mode theme",
			icon: Sun,
		},
		{
			value: "dark" as Theme,
			label: "Dark",
			description: "Dark mode theme",
			icon: Moon,
		},
		{
			value: "system" as Theme,
			label: "System",
			description: "Use system preference",
			icon: Monitor,
		},
	];

	return (
		<div className="space-y-6">
			<Card className="border-white/10 bg-black/40 backdrop-blur-xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-white">
						<Palette className="h-5 w-5 text-emerald-400" />
						Appearance
					</CardTitle>
					<CardDescription className="text-white/60">
						Customize how the interface looks for you
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<label className="text-sm font-medium text-white/80">Theme</label>
						<div className="grid gap-3">
							{themeOptions.map((option) => {
								const Icon = option.icon;
								const isSelected = theme === option.value;
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => handleThemeChange(option.value)}
										className={cn(
											"flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
											isSelected
												? "border-emerald-500/50 bg-emerald-500/10"
												: "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
										)}
									>
										<div
											className={cn(
												"flex h-10 w-10 items-center justify-center rounded-lg",
												isSelected
													? "bg-emerald-500/20 text-emerald-400"
													: "bg-white/10 text-white/60"
											)}
										>
											<Icon className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<div
												className={cn(
													"font-medium",
													isSelected ? "text-emerald-400" : "text-white"
												)}
											>
												{option.label}
											</div>
											<div className="text-sm text-white/50">
												{option.description}
											</div>
										</div>
										{isSelected && (
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
												<Check className="h-4 w-4 text-black" />
											</div>
										)}
									</button>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
