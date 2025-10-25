"use client";

import { UnsavedFormsProvider } from "@/context/unsaved-forms-context";

export default function ProjectsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <UnsavedFormsProvider>{children}</UnsavedFormsProvider>;
}
