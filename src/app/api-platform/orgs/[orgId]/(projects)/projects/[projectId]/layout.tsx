"use client";

import type { ReactNode } from "react";
import { ProjectTopbar } from "@/app/_components/api-platform/organizations/projects/project-topbar";
import { NewUserTour } from "@/components/ui/new-user-tour";

export default function ProjectLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<ProjectTopbar />
			<main className="flex-1">{children}</main>
			<NewUserTour />
		</div>
	);
}
