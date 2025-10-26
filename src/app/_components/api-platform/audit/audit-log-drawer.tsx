"use client";

import { Filter, History, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { AuditAction, AuditHistoryEntry } from "@/types/audit-log";
import {
	filterAuditHistory,
	getUniqueUsers,
	initialAuditLogFilters,
} from "@/types/audit-log";
import { AuditLogEntry } from "./audit-log-entry";

interface AuditLogDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	historyData: AuditHistoryEntry[];
	isLoading?: boolean;
	error?: string;
	entityType?: string;
}

/**
 * AuditLogDrawer - Reusable side panel for displaying audit history
 *
 * Features:
 * - Filter by action type (created/updated/deleted)
 * - Filter by user
 * - Date range filtering
 * - Search in changes
 * - Virtualized list for performance
 * - Loading and error states
 */
export function AuditLogDrawer({
	open,
	onOpenChange,
	title,
	description,
	historyData,
	isLoading = false,
	error,
	entityType,
}: AuditLogDrawerProps) {
	const [filters, setFilters] = useState(initialAuditLogFilters);
	const [showFilters, setShowFilters] = useState(false);

	// Get unique users for filter dropdown
	const uniqueUsers = useMemo(() => getUniqueUsers(historyData), [historyData]);

	// Apply filters
	const filteredData = useMemo(
		() => filterAuditHistory(historyData, filters),
		[historyData, filters],
	);

	// Count active filters
	const activeFilterCount =
		(filters.actions.length > 0 ? 1 : 0) +
		(filters.users.length > 0 ? 1 : 0) +
		(filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
		(filters.searchQuery ? 1 : 0);

	// Reset filters
	const resetFilters = () => {
		setFilters(initialAuditLogFilters);
	};

	// Toggle action filter
	const toggleActionFilter = (action: AuditAction) => {
		setFilters((prev) => ({
			...prev,
			actions: prev.actions.includes(action)
				? prev.actions.filter((a) => a !== action)
				: [...prev.actions, action],
		}));
	};

	// Set user filter
	const setUserFilter = (user: string) => {
		if (user === "all") {
			setFilters((prev) => ({ ...prev, users: [] }));
		} else {
			setFilters((prev) => ({ ...prev, users: [user] }));
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full p-6 sm:max-w-2xl">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<History className="h-5 w-5" />
						<SheetTitle>{title}</SheetTitle>
					</div>
					{description && <SheetDescription>{description}</SheetDescription>}
				</SheetHeader>

				<div className="mt-6 flex h-[calc(100vh-10rem)] flex-col space-y-4">
					{/* Filter Controls */}
					<div className="space-y-3">
						{/* Search Bar */}
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search in changes..."
								value={filters.searchQuery}
								onChange={(e) =>
									setFilters((prev) => ({
										...prev,
										searchQuery: e.target.value,
									}))
								}
								className="pr-9 pl-9"
							/>
							{filters.searchQuery && (
								<button
									type="button"
									onClick={() =>
										setFilters((prev) => ({ ...prev, searchQuery: "" }))
									}
									className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>

						{/* Filter Toggle Button */}
						<div className="flex items-center justify-between">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowFilters(!showFilters)}
								className="gap-2"
							>
								<Filter className="h-4 w-4" />
								Filters
								{activeFilterCount > 0 && (
									<Badge variant="secondary" className="ml-1">
										{activeFilterCount}
									</Badge>
								)}
							</Button>

							{activeFilterCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={resetFilters}
									className="gap-2"
								>
									<X className="h-4 w-4" />
									Clear
								</Button>
							)}
						</div>

						{/* Expandable Filters */}
						{showFilters && (
							<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
								{/* Action Type Filters */}
								<div className="space-y-2">
									<div className="font-medium text-sm">Action Type</div>
									<div className="flex flex-wrap gap-2">
										<FilterToggle
											active={filters.actions.includes("created")}
											onClick={() => toggleActionFilter("created")}
											className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
										>
											Created
										</FilterToggle>
										<FilterToggle
											active={filters.actions.includes("updated")}
											onClick={() => toggleActionFilter("updated")}
											className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
										>
											Updated
										</FilterToggle>
										<FilterToggle
											active={filters.actions.includes("deleted")}
											onClick={() => toggleActionFilter("deleted")}
											className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
										>
											Deleted
										</FilterToggle>
									</div>
								</div>

								{/* User Filter */}
								{uniqueUsers.length > 0 && (
									<div className="space-y-2">
										<div className="font-medium text-sm">User</div>
										<Select
											value={filters.users[0] || "all"}
											onValueChange={setUserFilter}
										>
											<SelectTrigger aria-label="Select user filter">
												<SelectValue placeholder="All users" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All users</SelectItem>
												{uniqueUsers.map((user) => (
													<SelectItem key={user} value={user}>
														{user}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Results Summary */}
					<div className="flex items-center justify-between text-muted-foreground text-sm">
						<span>
							{filteredData.length} of {historyData.length} entries
						</span>
						{entityType && <span className="capitalize">{entityType}</span>}
					</div>

					{/* Content Area */}
					<div className="min-h-0 flex-1">
						{isLoading ? (
							<LoadingState />
						) : error ? (
							<ErrorState error={error} />
						) : filteredData.length === 0 ? (
							<EmptyState hasFilters={activeFilterCount > 0} />
						) : (
							<ScrollArea className="h-full">
								<div className="space-y-3 pr-4">
									{filteredData.map((entry) => (
										<AuditLogEntry key={entry.id} entry={entry} />
									))}
								</div>
							</ScrollArea>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

/**
 * FilterToggle - Toggle button for filters
 */
function FilterToggle({
	active,
	onClick,
	children,
	className,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Button
			variant={active ? "default" : "outline"}
			size="sm"
			onClick={onClick}
			className={active ? className : ""}
		>
			{children}
		</Button>
	);
}

/**
 * LoadingState - Skeleton loading state
 */
function LoadingState() {
	return (
		<div className="space-y-3">
			{[1, 2, 3].map((i) => (
				<div key={i} className="animate-pulse space-y-2 rounded-lg border p-4">
					<div className="h-4 w-3/4 rounded bg-muted" />
					<div className="h-3 w-1/2 rounded bg-muted" />
				</div>
			))}
		</div>
	);
}

/**
 * ErrorState - Error display
 */
function ErrorState({ error }: { error: string }) {
	return (
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
	);
}

/**
 * EmptyState - No results display
 */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
	return (
		<div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
			<History className="h-12 w-12 text-muted-foreground/50" />
			<p className="font-medium text-sm">
				{hasFilters ? "No matching entries found" : "No history available"}
			</p>
			<p className="text-muted-foreground text-sm">
				{hasFilters
					? "Try adjusting your filters"
					: "Changes will appear here once they occur"}
			</p>
		</div>
	);
}
