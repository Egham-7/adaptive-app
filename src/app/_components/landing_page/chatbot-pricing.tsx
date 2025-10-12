"use client";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import SubscribeButton from "../stripe/subscribe-button";

export default function ChatbotPricing() {
	const { user } = useUser();

	// Use tRPC to fetch subscription status
	const {
		data: isSubscribed,
		isLoading: loading,
		error,
	} = api.subscription.isSubscribed.useQuery(undefined, {
		enabled: !!user,
	});

	return (
		<div className="w-full p-6">
			<h2 className="mb-8 text-center font-bold text-2xl">Choose Your Plan</h2>
			{error && (
				<div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-800 text-sm">
					Unable to load subscription status. Please try refreshing the page.
				</div>
			)}
			<div className="mx-auto grid w-full gap-6 md:grid-cols-2">
				{/* Free Plan */}
				<Card>
					<CardHeader>
						<CardTitle className="font-medium">Free</CardTitle>
						<div className="my-3 flex items-baseline">
							<span className="font-semibold text-2xl">$0</span>
							<span className="ml-1 text-muted-foreground text-sm">/month</span>
						</div>
						<CardDescription className="text-sm">
							Perfect for trying out our chatbot
						</CardDescription>
						{user ? (
							<Button disabled variant="outline" className="mt-4 w-full">
								You are already signed up
							</Button>
						) : (
							<Button asChild variant="outline" className="mt-4 w-full">
								<SignUpButton />
							</Button>
						)}
					</CardHeader>
					<CardContent className="space-y-4">
						<hr className="border-dashed" />
						<ul className="list-outside space-y-3 text-sm">
							{[
								"7 messages per day",
								"Basic AI capabilities",
								"Community support",
							].map((item) => (
								<li key={item} className="flex items-center gap-2">
									<Check className="size-3 text-primary" />
									{item}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				{/* Pro Plan */}
				<Card className="relative">
					<span className="-top-3 absolute inset-x-0 mx-auto flex h-6 w-fit items-center rounded-full bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary))] px-3 py-1 font-medium text-primary-foreground text-xs ring-1 ring-white/20 ring-inset ring-offset-1 ring-offset-gray-950/5">
						Popular
					</span>
					<CardHeader>
						<CardTitle className="font-medium">Pro</CardTitle>
						<div className="my-3 flex items-baseline">
							<span className="font-semibold text-2xl">$4.99</span>
							<span className="ml-1 text-muted-foreground text-sm">/month</span>
						</div>
						<CardDescription className="text-sm">
							For unlimited chatbot usage
						</CardDescription>
						{loading ? (
							<Button disabled variant="outline" className="mt-4 w-full">
								Checking subscription status...
							</Button>
						) : !user ? (
							<Button disabled variant="outline" className="mt-4 w-full">
								Please log in to subscribe
							</Button>
						) : !isSubscribed ? (
							<div className="mt-4 w-full">
								<SubscribeButton />
							</div>
						) : (
							<Button disabled variant="outline" className="mt-4 w-full">
								You are already subscribed
							</Button>
						)}
					</CardHeader>
					<CardContent className="space-y-4">
						<hr className="border-dashed" />
						<ul className="list-outside space-y-3 text-sm">
							{[
								"Unlimited messages",
								"Advanced AI capabilities",
								"Priority support",
								"API access",
							].map((item) => (
								<li key={item} className="flex items-center gap-2">
									<Check className="size-3 text-primary" />
									{item}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
