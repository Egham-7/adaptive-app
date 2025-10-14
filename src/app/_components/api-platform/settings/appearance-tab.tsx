"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Moon className="h-5 w-5" />
						Appearance
					</CardTitle>
					<CardDescription>
						Customize how the interface looks for you
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<Label>Theme</Label>
						<RadioGroup value={theme} onValueChange={handleThemeChange}>
							<div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
								<RadioGroupItem value="light" id="light" />
								<Label
									htmlFor="light"
									className="flex flex-1 cursor-pointer items-center gap-3"
								>
									<Sun className="h-5 w-5" />
									<div>
										<div className="font-medium">Light</div>
										<div className="text-muted-foreground text-sm">
											Light mode theme
										</div>
									</div>
								</Label>
							</div>

							<div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
								<RadioGroupItem value="dark" id="dark" />
								<Label
									htmlFor="dark"
									className="flex flex-1 cursor-pointer items-center gap-3"
								>
									<Moon className="h-5 w-5" />
									<div>
										<div className="font-medium">Dark</div>
										<div className="text-muted-foreground text-sm">
											Dark mode theme
										</div>
									</div>
								</Label>
							</div>

							<div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
								<RadioGroupItem value="system" id="system" />
								<Label
									htmlFor="system"
									className="flex flex-1 cursor-pointer items-center gap-3"
								>
									<Monitor className="h-5 w-5" />
									<div>
										<div className="font-medium">System</div>
										<div className="text-muted-foreground text-sm">
											Use system preference
										</div>
									</div>
								</Label>
							</div>
						</RadioGroup>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
