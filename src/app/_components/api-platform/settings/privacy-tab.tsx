"use client";

import { Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const PrivacyTab: React.FC = () => {
	const [metricsLogging, setMetricsLogging] = useState(true);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Privacy Controls
					</CardTitle>
					<CardDescription>
						Manage your organization's privacy and data collection preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between space-x-2">
						<div className="flex-1">
							<Label
								htmlFor="metrics-logging"
								className="cursor-pointer font-medium text-base"
							>
								Enable Metrics Logging
							</Label>
							<p className="text-muted-foreground text-sm">
								Allow collection of usage metrics and analytics for improving
								service quality
							</p>
						</div>
						<Switch
							id="metrics-logging"
							checked={metricsLogging}
							onCheckedChange={setMetricsLogging}
						/>
					</div>

					<div className="rounded-lg border bg-muted/50 p-4">
						<h4 className="mb-2 font-medium text-sm">Data Collection Notice</h4>
						<p className="text-muted-foreground text-xs leading-relaxed">
							When metrics logging is enabled, we collect anonymous usage data
							including API call frequency, response times, and error rates.
							This data helps us improve service reliability and performance. We
							never collect or log the content of your API requests or
							responses.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
