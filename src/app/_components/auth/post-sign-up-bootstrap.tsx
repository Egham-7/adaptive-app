"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type BootstrapResult = {
	organizationId: string;
	organizationSlug: string | null;
	projectId: number;
};

export function PostSignUpBootstrap() {
	const router = useRouter();
	const { organization } = useOrganization();
	const { setActive, userMemberships } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});
	const bootstrap = api.organizations.bootstrapAfterSignup.useMutation();
	const hasTriggeredRef = useRef(false);
	const [provision, setProvision] = useState<BootstrapResult | null>(null);
	const [hasNavigated, setHasNavigated] = useState(false);

	const navigateToDashboard = useCallback(
		(target: BootstrapResult) => {
			const slug = organization?.slug ?? target.organizationSlug;
			if (slug) {
				router.replace(
					`/api-platform/orgs/${slug}/projects/${target.projectId}`,
				);
				setHasNavigated(true);
			} else if (!hasNavigated) {
				router.replace("/api-platform/orgs");
				setHasNavigated(true);
			}
		},
		[organization?.slug, router, hasNavigated],
	);

	const setActiveOrganization = useCallback(
		async (data: BootstrapResult) => {
			if (!setActive) {
				setProvision(data);
				return;
			}

			try {
				await setActive({ organization: data.organizationId });
				setProvision(data);
			} catch (error) {
				console.error("Failed to activate organization after signup:", error);
				router.replace("/api-platform/orgs");
				setHasNavigated(true);
			}
		},
		[router, setActive],
	);

	const bootstrapWorkspace = useCallback(async () => {
		try {
			const result = await bootstrap.mutateAsync();
			await userMemberships?.revalidate?.();
			await setActiveOrganization(result);
		} catch (error) {
			console.error("Failed to bootstrap workspace:", error);
		}
	}, [bootstrap, setActiveOrganization, userMemberships]);

	useEffect(() => {
		if (hasTriggeredRef.current) {
			return;
		}
		hasTriggeredRef.current = true;
		void bootstrapWorkspace();
	}, [bootstrapWorkspace]);

	useEffect(() => {
		if (!provision || hasNavigated) {
			return;
		}

		if (organization?.id === provision.organizationId && organization.slug) {
			navigateToDashboard(provision);
		}
	}, [
		hasNavigated,
		navigateToDashboard,
		organization?.id,
		organization?.slug,
		provision,
	]);

	useEffect(() => {
		if (!provision || hasNavigated) {
			return;
		}

		const timeout = window.setTimeout(() => {
			navigateToDashboard(provision);
		}, 5000);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [hasNavigated, navigateToDashboard, provision]);

	const handleRetry = () => {
		if (bootstrap.isPending) return;
		bootstrap.reset();
		hasTriggeredRef.current = false;
		setProvision(null);
		setHasNavigated(false);
		void bootstrapWorkspace();
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-md space-y-4 text-center">
				{(bootstrap.isPending ||
					(bootstrap.isIdle && !hasTriggeredRef.current)) && (
					<>
						<Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
						<div>
							<div className="font-semibold text-lg">
								Preparing your workspace
							</div>
							<p className="text-muted-foreground">
								Creating your first organization and project. This only takes a
								moment.
							</p>
						</div>
					</>
				)}
				{bootstrap.isError && (
					<>
						<div className="font-semibold text-lg">
							Something went wrong while setting up your workspace
						</div>
						<p className="text-muted-foreground">
							{bootstrap.error?.message || "Please try again."}
						</p>
						<Button onClick={handleRetry} disabled={bootstrap.isPending}>
							Try again
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
