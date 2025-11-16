"use client";

import { useParams } from "next/navigation";
import { ArchitectureCanvas } from "@/app/_components/api-platform/architecture/architecture-canvas";
import { ArchitectureTour } from "@/components/tours";
import { useProjectProviders } from "@/hooks/provider-configs";

export default function ArchitecturePage() {
	const params = useParams();
	const projectId = Number(params.projectId as string);

	const { data: providersData, isLoading } = useProjectProviders(projectId);

	console.log("Providers Data:", providersData);

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Loading architecture view...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<ArchitectureTour />
			<div className="h-[calc(100vh-9rem)] w-full">
				<ArchitectureCanvas
					projectId={projectId}
					providers={providersData?.providers ?? []}
				/>
			</div>
		</>
	);
}
