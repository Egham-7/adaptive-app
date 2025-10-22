import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Toaster } from "sonner";
import { PostHogPageView } from "@/components/posthog-page-view";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
	PostHogAuthWrapper,
	PostHogProvider,
} from "@/context/posthog-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
	title: "Adaptive",
	description: "Adaptive",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body>
					<Script
						defer
						src="https://analytics.llmadaptive.uk/script.js"
						data-website-id="f746c473-ac95-49e7-a215-d20c223951ce"
					/>
					<PostHogProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<TRPCReactProvider>
								<HydrateClient>
									<PostHogAuthWrapper>
										<Suspense>
											<PostHogPageView />
										</Suspense>
										<SidebarProvider>
											<div className="min-h-screen w-full bg-background">
												{children}
											</div>
										</SidebarProvider>
									</PostHogAuthWrapper>
								</HydrateClient>
							</TRPCReactProvider>
						</ThemeProvider>
					</PostHogProvider>
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	);
}
