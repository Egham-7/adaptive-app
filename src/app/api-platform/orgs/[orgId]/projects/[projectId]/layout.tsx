"use client";

import type { ReactNode } from "react";
import { NewUserTour } from "@/components/ui/new-user-tour";

export default function ProjectLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<NewUserTour />
		</>
	);
}
