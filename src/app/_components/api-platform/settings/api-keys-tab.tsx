"use client";

import { Key } from "lucide-react";
import type React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ApiKeysTabProps {
	organizationId: string;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = () => {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						Organization API Keys
					</CardTitle>
					<CardDescription>
						Manage API keys for your organization
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Key className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							Organization API Keys
						</h3>
						<p className="mb-4 max-w-md text-muted-foreground text-sm">
							Organization-level API keys are managed per project. Visit your
							project settings to create and manage API keys.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
