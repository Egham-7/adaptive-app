"use client";

import { AlertCircle, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SupportDialog } from "@/components/support";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { IosButton } from "@/components/ui/ios-button";
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
						<div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
							<div className="h-5 w-24 rounded bg-white/10 mb-4" />
							<div className="h-8 w-32 rounded bg-white/10" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 
					className="font-light text-2xl tracking-tight"
					style={{
						background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
					}}
				>
					Billing & Credits
				</h2>
				<p className="text-white/40">
					Manage your organization's credits and billing information
				</p>
			</div>

			{/* Billing Disabled Alert */}
			<div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-4 flex items-start gap-3">
				<AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
				<p className="text-white/70 text-sm">
					Self-service billing is currently disabled. Please contact our support
					team to purchase additional credits.
				</p>
			</div>

			{/* Credit Balance Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<span className="font-medium text-sm text-white/60">Current Balance</span>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
							<CreditCard className="h-4 w-4 text-[#34d399]" />
						</div>
					</div>
					<div className="font-bold text-2xl text-white">
						{balance?.balance?.toFixed(2) || "0.00"}
					</div>
					<p className="text-white/40 text-xs">credits remaining</p>
				</div>

				<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<span className="font-medium text-sm text-white/60">Total Purchased</span>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
							<DollarSign className="h-4 w-4 text-white/40" />
						</div>
					</div>
					<div className="font-bold text-2xl text-white">
						{stats?.totalPurchased?.toFixed(2) || "0.00"}
					</div>
					<p className="text-white/40 text-xs">lifetime credits</p>
				</div>

				<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<span className="font-medium text-sm text-white/60">Total Used</span>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
							<TrendingUp className="h-4 w-4 text-white/40" />
						</div>
					</div>
					<div className="font-bold text-2xl text-white">
						{stats?.totalUsed?.toFixed(2) || "0.00"}
					</div>
					<p className="text-white/40 text-xs">credits consumed</p>
				</div>
			</div>

			{/* Buy Credits Card */}
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="mb-4">
					<h3 className="font-medium text-white">Purchase Credits</h3>
					<p className="text-sm text-white/40">
						Add credits to your organization account
					</p>
				</div>
				<div className="space-y-4">
					<p className="text-white/50 text-sm">
						To purchase additional credits or set up a custom billing plan,
						please contact our support team.
					</p>
					<div className="flex gap-3">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="inline-block">
										<IosButton variant="bordered" disabled className="opacity-50">
											Buy Credits
										</IosButton>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-[#0a0a0a] border-white/10 text-white/70">
									<p>Billing is currently disabled. Please contact support.</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<IosButton variant="bordered" onClick={handleContactSupport}>
							Contact Support
						</IosButton>
					</div>
				</div>
			</div>

			{/* Transaction History */}
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="mb-6">
					<h3 className="font-medium text-white">Transaction History</h3>
					<p className="text-sm text-white/40">
						View your credit purchase and usage history
					</p>
				</div>

				{transactions && transactions.transactions.length > 0 ? (
					<>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-white/10">
										<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Date</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Type</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Amount</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Balance</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Description</th>
									</tr>
								</thead>
								<tbody>
									{transactions.transactions.map((transaction) => (
										<tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
											<td className="py-3 px-4 text-white/60 text-sm">
												{formatDate(new Date(transaction.created_at))}
											</td>
											<td className="py-3 px-4">
												<span
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
														transaction.type === "purchase"
															? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30"
															: transaction.type === "usage"
																? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
																: "bg-purple-500/10 text-purple-400 border border-purple-500/30"
													}`}
												>
													{transaction.readableType}
												</span>
											</td>
											<td
												className={`py-3 px-4 font-medium ${
													transaction.amount > 0
														? "text-[#34d399]"
														: "text-red-400"
												}`}
											>
												{transaction.formattedAmount}
											</td>
											<td className="py-3 px-4 text-white">{transaction.formattedBalance}</td>
											<td className="py-3 px-4 text-white/40 text-sm">
												{transaction.description || "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						<div className="mt-4 flex items-center justify-between">
							<IosButton
								variant="bordered"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
							>
								Previous
							</IosButton>
							<span className="text-white/40 text-sm">
								Page {page + 1}
							</span>
							<IosButton
								variant="bordered"
								onClick={() => setPage((p) => p + 1)}
								disabled={!transactions || !transactions.hasMore}
							>
								Next
							</IosButton>
						</div>
					</>
				) : (
					<div className="py-8 text-center text-white/40">
						No transaction history available
					</div>
				)}
			</div>

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
