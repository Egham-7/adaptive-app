"use client";

import { Loader2 } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import type React from "react";

type LoadingLinkProps = {
	href: string;
	children: React.ReactNode;
	onNavigate?: () => void;
};

export function LoadingLink({ href, children, onNavigate }: LoadingLinkProps) {
	const { pending } = useLinkStatus();

	return (
		<Link href={href} className="flex items-center gap-2" onClick={onNavigate}>
			{pending && <Loader2 className="h-4 w-4 animate-spin" />}
			{children}
		</Link>
	);
}
