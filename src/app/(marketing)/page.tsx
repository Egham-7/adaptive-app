import { Suspense } from "react";
import FooterXai from "@/app/_components/landing_page/footer-xai";
import HeroXai from "@/app/_components/landing_page/hero-xai";
import UnifiedSection from "@/app/_components/landing_page/unified-section";
import UniverseSection from "@/app/_components/landing_page/universe-section";

export default function LandingPage() {
	return (
		<Suspense>
			<main className="relative min-h-screen bg-[#030303]">
				{/* Hero section with aurora effect */}
				<HeroXai />
				{/* Universe section - visual transition */}
				<UniverseSection />
				{/* Unified section - Products, News, and CTA with continuous aurora */}
				<UnifiedSection />
				{/* Footer */}
				<FooterXai />
			</main>
		</Suspense>
	);
}
