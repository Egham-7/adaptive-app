"use client";

import {
	Github,
	Twitter,
	Linkedin,
	Mail,
} from "lucide-react";
import Link from "next/link";
import { ScrollAssemble } from "@/components/ui/scroll-assemble";
import { Logo } from "@/components/ui/logo";

const footerLinks = {
	product: [
		{ label: "API Platform", href: "/api-platform" },
		{ label: "Chat Platform", href: "/chat-platform" },
		{ label: "Pricing", href: "/pricing" },
		{ label: "Documentation", href: "/docs" },
	],
	company: [
		{ label: "About", href: "/about" },
		{ label: "Blog", href: "/blog" },
		{ label: "Careers", href: "/careers" },
		{ label: "Contact", href: "/contact" },
	],
	legal: [
		{ label: "Privacy", href: "/privacy" },
		{ label: "Terms", href: "/terms" },
		{ label: "Security", href: "/security" },
	],
	social: [
		{ label: "Twitter", href: "https://twitter.com", icon: Twitter },
		{ label: "GitHub", href: "https://github.com", icon: Github },
		{ label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
	],
};

export default function FooterXai() {
	return (
		<footer id="about" className="relative bg-[#010101] overflow-hidden">
			{/* Top separator line - gradient fade */}
			<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
			
			{/* Footer Background Image */}
			<div 
				className="absolute inset-0"
				style={{
					backgroundImage: 'url(/footerbg.png)',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
				aria-hidden="true"
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
				{/* Main footer content */}
				<ScrollAssemble direction="up">
					<div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
						{/* Brand column */}
						<div className="lg:col-span-2">
							<Link
								href="/"
								className="inline-flex items-center mb-4"
							>
								<Logo 
									brand="adaptive" 
									imageWidth={32} 
									imageHeight={32} 
									textSize="lg"
									showText={false}
								/>
								<span className="text-xl font-light text-white ml-2">Aurora</span>
							</Link>
							<p className="text-sm text-white/40 leading-relaxed max-w-sm mb-6">
								The intelligent AI gateway. Route to any model, optimize costs,
								and scale with confidence.
							</p>

							{/* Newsletter signup */}
							<div className="relative max-w-sm">
								<input
									type="email"
									placeholder="Enter your email"
									className="w-full h-11 pl-4 pr-12 rounded-full bg-black/40 border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#a3e635]/30 transition-colors backdrop-blur-xl"
								/>
								<button
									type="button"
									className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-[#a3e635]/30 flex items-center justify-center hover:bg-black/80 hover:border-[#a3e635]/50 transition-colors"
								>
									<Mail className="w-4 h-4 text-[#a3e635]" />
								</button>
							</div>
						</div>

						{/* Product links */}
						<div>
							<h3 className="text-xs uppercase tracking-wider text-white/30 mb-4">
								Product
							</h3>
							<ul className="space-y-3">
								{footerLinks.product.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-white/50 hover:text-white transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company links */}
						<div>
							<h3 className="text-xs uppercase tracking-wider text-white/30 mb-4">
								Company
							</h3>
							<ul className="space-y-3">
								{footerLinks.company.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-white/50 hover:text-white transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Legal links */}
						<div>
							<h3 className="text-xs uppercase tracking-wider text-white/30 mb-4">
								Legal
							</h3>
							<ul className="space-y-3">
								{footerLinks.legal.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-white/50 hover:text-white transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</ScrollAssemble>

				{/* Divider */}
				<ScrollAssemble direction="fade" delay={0.2}>
					<div className="border-t border-white/[0.05] pt-8">
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							{/* Copyright */}
							<p className="text-xs text-white/30">
								© {new Date().getFullYear()} Aurora. All rights reserved.
							</p>

							{/* Social links */}
							<div className="flex items-center gap-4">
								{footerLinks.social.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="w-8 h-8 rounded-full bg-black/40 border border-white/[0.08] flex items-center justify-center hover:bg-black/60 hover:border-white/[0.15] transition-colors backdrop-blur-xl"
									>
										<link.icon className="w-4 h-4 text-white/50" />
									</Link>
								))}
							</div>
						</div>
					</div>
				</ScrollAssemble>
			</div>
		</footer>
	);
}
