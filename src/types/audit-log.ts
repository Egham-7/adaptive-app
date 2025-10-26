import { z } from "zod";

/**
 * Generic audit history entry that works across all entities
 * (adaptive configs, provider configs, API keys, etc.)
 */
export const auditHistoryEntrySchema = z.object({
	id: z.number(),
	action: z.enum(["created", "updated", "deleted"]),
	changes: z.string(), // JSON string of changes
	changed_by: z.string(),
	changed_at: z.string(),
	entity_type: z.string().optional(), // "adaptive_config" | "provider_config" | "api_key"
	entity_id: z.union([z.number(), z.string()]).optional(),
});

export type AuditHistoryEntry = z.infer<typeof auditHistoryEntrySchema>;

/**
 * Action type for color coding in UI
 */
export type AuditAction = "created" | "updated" | "deleted";

/**
 * Filter state for audit log drawer
 */
export interface AuditLogFilters {
	actions: AuditAction[];
	users: string[];
	dateRange: {
		from?: Date;
		to?: Date;
	};
	searchQuery: string;
}

/**
 * Initial empty filters state
 */
export const initialAuditLogFilters: AuditLogFilters = {
	actions: [],
	users: [],
	dateRange: {},
	searchQuery: "",
};

/**
 * Parsed change object for structured display
 */
export interface ParsedChange {
	field: string;
	oldValue: unknown;
	newValue: unknown;
	changeType: "added" | "modified" | "removed";
}

/**
 * Props for individual audit log entry component
 */
export interface AuditLogEntryProps {
	entry: AuditHistoryEntry;
	defaultExpanded?: boolean;
}

/**
 * Props for change diff viewer component
 */
export interface ChangeDiffViewerProps {
	changes: string; // JSON string
	viewMode: "structured" | "json";
}

/**
 * Action badge configuration
 */
export const actionBadgeConfig: Record<
	AuditAction,
	{
		color: string;
		label: string;
		variant: "default" | "secondary" | "destructive";
	}
> = {
	created: {
		color: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
		label: "Created",
		variant: "default",
	},
	updated: {
		color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
		label: "Updated",
		variant: "secondary",
	},
	deleted: {
		color: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
		label: "Deleted",
		variant: "destructive",
	},
};

/**
 * Utility to parse JSON changes string into structured format
 */
export function parseChanges(changesJson: string): ParsedChange[] {
	try {
		const changes = JSON.parse(changesJson);
		const result: ParsedChange[] = [];

		// Handle different change formats
		if (typeof changes === "object" && changes !== null) {
			// Format 1: { field: { old: ..., new: ... } }
			// Format 2: { field: newValue }
			// Format 3: { added: [...], modified: [...], removed: [...] }

			if (changes.added || changes.modified || changes.removed) {
				// Format 3: Structured diff
				if (changes.added) {
					for (const [field, value] of Object.entries(changes.added)) {
						result.push({
							field,
							oldValue: undefined,
							newValue: value,
							changeType: "added",
						});
					}
				}
				if (changes.modified) {
					for (const [field, values] of Object.entries(
						changes.modified as Record<string, { old: unknown; new: unknown }>,
					)) {
						result.push({
							field,
							oldValue: values.old,
							newValue: values.new,
							changeType: "modified",
						});
					}
				}
				if (changes.removed) {
					for (const [field, value] of Object.entries(changes.removed)) {
						result.push({
							field,
							oldValue: value,
							newValue: undefined,
							changeType: "removed",
						});
					}
				}
			} else {
				// Format 1 or 2: Simple object
				for (const [field, value] of Object.entries(changes)) {
					if (
						typeof value === "object" &&
						value !== null &&
						"old" in value &&
						"new" in value
					) {
						// Format 1
						const changeValue = value as { old: unknown; new: unknown };
						const changeType =
							changeValue.old === undefined
								? "added"
								: changeValue.new === undefined
									? "removed"
									: "modified";

						result.push({
							field,
							oldValue: changeValue.old,
							newValue: changeValue.new,
							changeType,
						});
					} else {
						// Format 2
						result.push({
							field,
							oldValue: undefined,
							newValue: value,
							changeType: "added",
						});
					}
				}
			}
		}

		return result;
	} catch (error) {
		console.error("Failed to parse changes:", error);
		return [];
	}
}

/**
 * Generate human-readable summary of changes
 */
export function generateChangeSummary(
	changes: ParsedChange[],
	entityType?: string,
): string {
	if (changes.length === 0) {
		return "No changes recorded";
	}

	const added = changes.filter((c) => c.changeType === "added");
	const modified = changes.filter((c) => c.changeType === "modified");
	const removed = changes.filter((c) => c.changeType === "removed");

	const parts: string[] = [];

	if (added.length > 0) {
		parts.push(`Added ${added.length} field${added.length > 1 ? "s" : ""}`);
	}
	if (modified.length > 0) {
		parts.push(
			`Updated ${modified.length} field${modified.length > 1 ? "s" : ""}`,
		);
	}
	if (removed.length > 0) {
		parts.push(
			`Removed ${removed.length} field${removed.length > 1 ? "s" : ""}`,
		);
	}

	let summary = parts.join(", ");

	if (entityType) {
		summary = `${entityType}: ${summary}`;
	}

	return summary;
}

/**
 * Format value for display (handles various types)
 */
export function formatValue(value: unknown): string {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return value.toString();
	if (typeof value === "string") return value;
	if (Array.isArray(value)) {
		return `[${value.map(formatValue).join(", ")}]`;
	}
	if (typeof value === "object") {
		return JSON.stringify(value, null, 2);
	}
	return String(value);
}

/**
 * Filter audit history entries based on filter criteria
 */
export function filterAuditHistory(
	entries: AuditHistoryEntry[],
	filters: AuditLogFilters,
): AuditHistoryEntry[] {
	return entries.filter((entry) => {
		// Filter by action
		if (filters.actions.length > 0 && !filters.actions.includes(entry.action)) {
			return false;
		}

		// Filter by user
		if (filters.users.length > 0 && !filters.users.includes(entry.changed_by)) {
			return false;
		}

		// Filter by date range
		if (filters.dateRange.from || filters.dateRange.to) {
			const entryDate = new Date(entry.changed_at);
			if (filters.dateRange.from && entryDate < filters.dateRange.from) {
				return false;
			}
			if (filters.dateRange.to && entryDate > filters.dateRange.to) {
				return false;
			}
		}

		// Filter by search query
		if (filters.searchQuery) {
			const query = filters.searchQuery.toLowerCase();
			const searchableText = [
				entry.changed_by,
				entry.action,
				entry.changes,
				entry.entity_type,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			if (!searchableText.includes(query)) {
				return false;
			}
		}

		return true;
	});
}

/**
 * Get unique users from audit history for filter dropdown
 */
export function getUniqueUsers(entries: AuditHistoryEntry[]): string[] {
	const users = new Set(entries.map((e) => e.changed_by));
	return Array.from(users).sort();
}
