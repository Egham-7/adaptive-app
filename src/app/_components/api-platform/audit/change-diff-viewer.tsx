"use client";

import { ArrowRight, Code, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChangeDiffViewerProps } from "@/types/audit-log";
import { formatValue, parseChanges } from "@/types/audit-log";

/**
 * ChangeDiffViewer - Displays changes in either structured or JSON format
 *
 * Supports toggling between:
 * - Structured view: Field-by-field display with old → new values
 * - JSON view: Syntax-highlighted JSON diff
 */
export function ChangeDiffViewer({ changes, viewMode }: ChangeDiffViewerProps) {
	const parsedChanges = parseChanges(changes);

	// Handle empty or invalid changes
	if (!changes || changes === "{}") {
		return (
			<div className="py-2 text-muted-foreground text-sm italic">
				No changes recorded
			</div>
		);
	}

	return (
		<Tabs defaultValue={viewMode} className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="structured" className="gap-2">
					<FileText className="h-4 w-4" />
					Structured
				</TabsTrigger>
				<TabsTrigger value="json" className="gap-2">
					<Code className="h-4 w-4" />
					JSON
				</TabsTrigger>
			</TabsList>

			<TabsContent value="structured" className="mt-4">
				<StructuredView changes={parsedChanges} />
			</TabsContent>

			<TabsContent value="json" className="mt-4">
				<JsonView changes={changes} />
			</TabsContent>
		</Tabs>
	);
}

/**
 * StructuredView - Shows field-by-field changes in a readable format
 */
function StructuredView({
	changes,
}: {
	changes: ReturnType<typeof parseChanges>;
}) {
	if (changes.length === 0) {
		return (
			<div className="py-2 text-muted-foreground text-sm italic">
				Unable to parse changes
			</div>
		);
	}

	return (
		<ScrollArea className="h-full max-h-96">
			<div className="space-y-3">
				{changes.map((change, index) => (
					<ChangeItem key={`${change.field}-${index}`} change={change} />
				))}
			</div>
		</ScrollArea>
	);
}

/**
 * ChangeItem - Individual field change display
 */
function ChangeItem({
	change,
}: {
	change: ReturnType<typeof parseChanges>[number];
}) {
	const { field, oldValue, newValue, changeType } = change;

	// Format field name (convert snake_case to readable format)
	const formattedField = field
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return (
		<div className="space-y-2 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<span className="font-medium text-sm">{formattedField}</span>
				<ChangeTypeBadge type={changeType} />
			</div>

			{changeType === "added" && (
				<div className="flex items-start gap-2">
					<Badge
						variant="outline"
						className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
					>
						Added
					</Badge>
					<code className="flex-1 break-all rounded bg-muted px-2 py-1 text-sm">
						{formatValue(newValue)}
					</code>
				</div>
			)}

			{changeType === "removed" && (
				<div className="flex items-start gap-2">
					<Badge
						variant="outline"
						className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
					>
						Removed
					</Badge>
					<code className="flex-1 break-all rounded bg-muted px-2 py-1 text-sm line-through opacity-70">
						{formatValue(oldValue)}
					</code>
				</div>
			)}

			{changeType === "modified" && (
				<div className="space-y-2">
					<div className="flex items-start gap-2">
						<Badge
							variant="outline"
							className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
						>
							Old
						</Badge>
						<code className="flex-1 break-all rounded bg-muted px-2 py-1 text-sm opacity-70">
							{formatValue(oldValue)}
						</code>
					</div>
					<div className="flex items-center justify-center">
						<ArrowRight className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="flex items-start gap-2">
						<Badge
							variant="outline"
							className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
						>
							New
						</Badge>
						<code className="flex-1 break-all rounded bg-muted px-2 py-1 text-sm">
							{formatValue(newValue)}
						</code>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * ChangeTypeBadge - Badge for change type (added/modified/removed)
 */
function ChangeTypeBadge({ type }: { type: "added" | "modified" | "removed" }) {
	const config = {
		added: {
			label: "Added",
			className:
				"bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
		},
		modified: {
			label: "Modified",
			className:
				"bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
		},
		removed: {
			label: "Removed",
			className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
		},
	};

	const { label, className } = config[type];

	return (
		<Badge variant="secondary" className={className}>
			{label}
		</Badge>
	);
}

/**
 * JsonView - Shows raw JSON with syntax highlighting
 */
function JsonView({ changes }: { changes: string }) {
	let formattedJson: string;
	try {
		const parsed = JSON.parse(changes);
		formattedJson = JSON.stringify(parsed, null, 2);
	} catch {
		formattedJson = changes;
	}

	return (
		<ScrollArea className="h-full max-h-96">
			<pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
				<code className="language-json">{formattedJson}</code>
			</pre>
		</ScrollArea>
	);
}
