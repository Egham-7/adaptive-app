import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Pricing - Aurora | Intelligent AI Model Router",
	description:
		"Simple, transparent pricing for Aurora AI router. Start free with $5 credit. Pay-as-you-go Developer plan, Team plan at $200/year, and custom Enterprise solutions.",
	keywords: [
		"AI pricing",
		"LLM router pricing",
		"AI model routing cost",
		"pay as you go AI",
		"enterprise AI pricing",
		"team AI plan",
	],
	openGraph: {
		title: "Pricing - Aurora | Intelligent AI Model Router",
		description:
			"Simple, transparent pricing. Start free with $5 credit. Scale seamlessly as you grow.",
		type: "website",
	},
};

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
