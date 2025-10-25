"use client";

import { AlertCircle, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SupportDialog } from "@/components/support";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";

interface BillingTabProps {
	organizationId: string;
}

export function BillingTab({ organizationId }: BillingTabProps) {
	const [supportOpen, setSupportOpen] = useState(false);
	const [page, setPage] = useState(0);
	const pageSize = 10;

	// Fetch credit data
	const { data: balance, isLoading: balanceLoading } =
		api.credits.getBalance.useQuery({
			organizationId,
		});

	const { data: stats, isLoading: statsLoading } =
		api.credits.getStats.useQuery({
			organizationId,
		});

	const { data: transactions, isLoading: transactionsLoading } =
		api.credits.getTransactionHistory.useQuery({
			organizationId,
			limit: pageSize,
			offset: page * pageSize,
		});

	const isLoading = balanceLoading || statsLoading || transactionsLoading;

	const handleContactSupport = () => {
		setSupportOpen(true);
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-5 w-24 rounded bg-muted" />
							</CardHeader>
							<CardContent>
								<div className="h-8 w-32 rounded bg-muted" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="font-semibold text-2xl">Billing & Credits</h2>
				<p className="text-muted-foreground">
					Manage your organization's credits and billing information
				</p>
			</div>

			{/* Billing Disabled Alert */}
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Self-service billing is currently disabled. Please contact our support
					team to purchase additional credits.
				</AlertDescription>
			</Alert>

			{/* Credit Balance Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Current Balance
						</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{balance?.balance?.toFixed(2) || "0.00"}
						</div>
						<p className="text-muted-foreground text-xs">credits remaining</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Total Purchased
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{stats?.totalPurchased?.toFixed(2) || "0.00"}
						</div>
						<p className="text-muted-foreground text-xs">lifetime credits</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Used</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{stats?.totalUsed?.toFixed(2) || "0.00"}
						</div>
						<p className="text-muted-foreground text-xs">credits consumed</p>
					</CardContent>
				</Card>
			</div>

			{/* Buy Credits Button (Disabled) */}
			<Card>
				<CardHeader>
					<CardTitle>Purchase Credits</CardTitle>
					<CardDescription>
						Add credits to your organization account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">
						To purchase additional credits or set up a custom billing plan,
						please contact our support team.
					</p>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="inline-block">
									<Button disabled className="cursor-not-allowed opacity-50">
										Buy Credits
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Billing is currently disabled. Please contact support.</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<Button variant="outline" onClick={handleContactSupport}>
						Contact Support
					</Button>
				</CardContent>
			</Card>

			{/* Transaction History */}
			<Card>
				<CardHeader>
					<CardTitle>Transaction History</CardTitle>
					<CardDescription>
						View your credit purchase and usage history
					</CardDescription>
				</CardHeader>
				<CardContent>
					{transactions && transactions.transactions.length > 0 ? (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Balance</TableHead>
										<TableHead>Description</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{transactions.transactions.map((transaction) => (
										<TableRow key={transaction.id}>
											<TableCell className="text-sm">
												{formatDate(new Date(transaction.created_at))}
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
														transaction.type === "purchase"
															? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
															: transaction.type === "usage"
																? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
																: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
													}`}
												>
													{transaction.readableType}
												</span>
											</TableCell>
											<TableCell
												className={`font-medium ${
													transaction.amount > 0
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{transaction.formattedAmount}
											</TableCell>
											<TableCell>{transaction.formattedBalance}</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{transaction.description || "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* Pagination */}
							<div className="mt-4 flex items-center justify-between">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(0, p - 1))}
									disabled={page === 0}
								>
									Previous
								</Button>
								<span className="text-muted-foreground text-sm">
									Page {page + 1}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => p + 1)}
									disabled={!transactions || !transactions.hasMore}
								>
									Next
								</Button>
							</div>
						</>
					) : (
						<div className="py-8 text-center text-muted-foreground">
							No transaction history available
						</div>
					)}
				</CardContent>
			</Card>

			{/* Support Dialog */}
			<SupportDialog
				open={supportOpen}
				onOpenChange={setSupportOpen}
				defaultCategory="billing"
				additionalContext={`Organization ID: ${organizationId}\nCurrent Balance: ${balance?.balance?.toFixed(2) || "0.00"} credits`}
			/>
		</div>
	);
}
