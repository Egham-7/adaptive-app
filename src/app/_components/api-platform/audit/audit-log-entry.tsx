"use client";

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { AuditLogEntryProps } from "@/types/audit-log";
import {
	actionBadgeConfig,
	generateChangeSummary,
	parseChanges,
} from "@/types/audit-log";
import { ChangeDiffViewer } from "./change-diff-viewer";
import { UserDisplay } from "./user-display";

/**
 * AuditLogEntry - Displays a single audit history entry
 *
 * Features:
 * - Action badge with color coding
 * - User info with avatar
 * - Timestamp display
 * - Collapsible details with change viewer
 * - Change summary
 */
export function AuditLogEntry({
	entry,
	defaultExpanded = false,
}: AuditLogEntryProps) {
	const [viewMode] = useState<"structured" | "json">("structured");

	// Parse changes for summary
	const parsedChanges = parseChanges(entry.changes);
	const summary = generateChangeSummary(parsedChanges, entry.entity_type);

	// Format timestamp
	const timestamp = new Date(entry.changed_at);
	const formattedDate = timestamp.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	const formattedTime = timestamp.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Get action configuration
	const actionConfig = actionBadgeConfig[entry.action];
	const ActionIcon = getActionIcon(entry.action);

	return (
		<div className="rounded-lg border transition-colors hover:border-primary/50">
			<Accordion
				type="single"
				collapsible
				defaultValue={defaultExpanded ? "details" : undefined}
			>
				<AccordionItem value="details" className="border-0">
					<AccordionTrigger className="px-4 py-3 hover:no-underline">
						<div className="flex flex-1 items-start gap-3 text-left">
							{/* Action Icon & Badge */}
							<div className="flex min-w-fit items-center gap-2">
								<ActionIcon className="h-4 w-4" />
								<Badge className={actionConfig.color}>
									{actionConfig.label}
								</Badge>
							</div>

							{/* Main Content */}
							<div className="min-w-0 flex-1 space-y-1">
								<p className="truncate font-medium text-sm">{summary}</p>
								<div className="flex items-center gap-2 text-muted-foreground text-xs">
									<UserDisplay userId={entry.changed_by} />
									<span>•</span>
									<time dateTime={entry.changed_at}>
										{formattedDate} at {formattedTime}
									</time>
								</div>
							</div>
						</div>
					</AccordionTrigger>

					<AccordionContent className="px-4 pt-0 pb-4">
						<div className="mt-2 space-y-3">
							{/* Change Summary Stats */}
							<div className="flex items-center gap-4 text-muted-foreground text-xs">
								<span>
									{parsedChanges.length} change
									{parsedChanges.length !== 1 ? "s" : ""}
								</span>
								{entry.entity_type && (
									<>
										<span>•</span>
										<span className="capitalize">{entry.entity_type}</span>
									</>
								)}
								{entry.entity_id && (
									<>
										<span>•</span>
										<span>ID: {entry.entity_id}</span>
									</>
								)}
							</div>

							{/* Change Diff Viewer */}
							<ChangeDiffViewer changes={entry.changes} viewMode={viewMode} />
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

/**
 * Get icon component for action type
 */
function getActionIcon(action: "created" | "updated" | "deleted") {
	switch (action) {
		case "created":
			return CheckCircle;
		case "updated":
			return AlertCircle;
		case "deleted":
			return XCircle;
		default:
			return AlertCircle;
	}
}
