"use client";

import { Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const PrivacyTab: React.FC = () => {
	const [metricsLogging, setMetricsLogging] = useState(true);

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
						<Shield className="h-5 w-5 text-[#34d399]" />
					</div>
					<div>
						<h3 className="font-medium text-white">Privacy Controls</h3>
						<p className="text-sm text-white/40">
							Manage your organization's privacy and data collection preferences
						</p>
					</div>
				</div>

				<div className="space-y-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex-1">
							<Label
								htmlFor="metrics-logging"
								className="cursor-pointer font-medium text-base text-white"
							>
								Enable Metrics Logging
							</Label>
							<p className="text-white/40 text-sm">
								Allow collection of usage metrics and analytics for improving
								service quality
							</p>
						</div>
						<Switch
							id="metrics-logging"
							checked={metricsLogging}
							onCheckedChange={setMetricsLogging}
							className="data-[state=checked]:bg-[#34d399]"
						/>
					</div>

					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<h4 className="mb-2 font-medium text-sm text-white/70">Data Collection Notice</h4>
						<p className="text-white/40 text-xs leading-relaxed">
							When metrics logging is enabled, we collect anonymous usage data
							including API call frequency, response times, and error rates.
							This data helps us improve service reliability and performance. We
							never collect or log the content of your API requests or
							responses.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
