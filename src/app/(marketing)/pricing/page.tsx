"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Users, Building2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import FooterXai from "@/app/_components/landing_page/footer-xai";

// Animated particles background
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Aurora glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-lime-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px]" />
      <div className="absolute top-10 left-1/2 w-64 h-64 bg-emerald-400/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-40 right-1/3 w-48 h-48 bg-lime-400/8 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      
      {/* Top concentrated floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`top-${i}`}
          className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * 400, // Concentrated in top 400px
          }}
          animate={{
            y: [null, Math.random() * -150 - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Larger floating particles at top */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`large-${i}`}
          className="absolute w-1.5 h-1.5 bg-lime-400/25 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * 300 + 50, // Top area
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            x: [null, (Math.random() - 0.5) * 100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Scattered particles throughout */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`scatter-${i}`}
          className="absolute w-0.5 h-0.5 bg-emerald-300/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Toggle switch component
function BillingToggle({ isAnnual, setIsAnnual }: { isAnnual: boolean; setIsAnnual: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm transition-colors ${!isAnnual ? "text-white" : "text-white/50"}`}>
        Monthly
      </span>
      <button
        type="button"
        onClick={() => setIsAnnual(!isAnnual)}
        className="relative w-14 h-7 rounded-full bg-white/10 border border-white/20 transition-colors hover:border-emerald-500/30"
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-lime-400"
          animate={{ left: isAnnual ? "calc(100% - 24px)" : "4px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <span className={`text-sm transition-colors ${isAnnual ? "text-white" : "text-white/50"}`}>
        Annual
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Save 20%
        </span>
      </span>
    </div>
  );
}

// Pricing card component
function PricingCard({
  title,
  subtitle,
  price,
  period,
  description,
  features,
  buttonText,
  buttonHref,
  isPopular,
  icon: Icon,
  delay,
}: {
  title: string;
  subtitle?: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  isPopular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`relative group h-full ${isPopular ? "lg:-mt-4 lg:mb-4" : ""}`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 text-black">
            Most Popular
          </span>
        </div>
      )}

      {/* Card */}
      <div
        className={`relative h-full flex flex-col rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
          isPopular
            ? "bg-gradient-to-b from-emerald-500/10 to-black/60 border-emerald-500/30 shadow-[0_0_40px_rgba(52,211,153,0.1)]"
            : "bg-black/40 border-white/[0.08] hover:border-white/20"
        }`}
      >
        {/* Glow effect on hover */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isPopular
              ? "bg-gradient-to-b from-emerald-500/5 to-transparent"
              : "bg-gradient-to-b from-white/5 to-transparent"
          }`}
        />

        <div className="relative p-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isPopular
                  ? "bg-gradient-to-br from-emerald-400/20 to-lime-400/20 border border-emerald-500/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isPopular ? "text-emerald-400" : "text-white/70"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{title}</h3>
              {subtitle && (
                <p className="text-xs text-white/40">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-light ${
                  isPopular
                    ? "bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent"
                    : "text-white"
                }`}
              >
                {price}
              </span>
              {period && (
                <span className="text-sm text-white/40">{period}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-white/50">{description}</p>
          </div>

          {/* Features */}
          <ul className="flex-1 space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPopular
                      ? "bg-emerald-500/20"
                      : "bg-white/5"
                  }`}
                >
                  <Check
                    className={`w-3 h-3 ${
                      isPopular ? "text-emerald-400" : "text-white/60"
                    }`}
                  />
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Button */}
          <Link
            href={buttonHref}
            className={`group/btn relative w-full py-3 px-6 rounded-full text-sm font-medium text-center transition-all duration-300 flex items-center justify-center gap-2 ${
              isPopular
                ? "bg-gradient-to-r from-emerald-400 to-lime-400 text-black hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
          >
            {buttonText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plans = [
    {
      title: "Developer",
      subtitle: "For individual developers",
      price: "Pay as you go",
      description: "Start building with $5 free credit. Only pay for what you use.",
      features: [
        "+$0.10 per 1M input tokens",
        "+$0.20 per 1M output tokens",
        "$5 free credit to start",
        "1,000 requests per hour",
        "All AI models access",
        "Basic analytics dashboard",
        "Community support",
        "99% uptime SLA",
      ],
      buttonText: "Start Free",
      buttonHref: "/sign-up",
      icon: Zap,
      isPopular: false,
    },
    {
      title: "Team",
      subtitle: "For growing teams",
      price: isAnnual ? "$200" : "$20",
      period: isAnnual ? "/member/year" : "/member/month",
      description: isAnnual
        ? "Save 20% with annual billing. Advanced features for teams."
        : "Per member pricing. Flexible monthly billing.",
      features: [
        "Everything in Developer",
        "Advanced intelligent routing",
        "10,000 requests per hour",
        "Priority model access",
        "Team collaboration tools",
        "Advanced analytics & insights",
        "Email & chat support",
        "99.9% uptime SLA",
      ],
      buttonText: "Start Trial",
      buttonHref: "/sign-up?plan=team",
      icon: Users,
      isPopular: true,
    },
    {
      title: "Enterprise",
      subtitle: "For large organizations",
      price: "Custom",
      description: "Tailored solutions with dedicated support and on-premise options.",
      features: [
        "Everything in Team",
        "Unlimited requests",
        "Custom model fine-tuning",
        "On-premise deployment",
        "SOC 2 Type II compliance",
        "SSO & SAML integration",
        "24/7 phone support",
        "Dedicated account manager",
      ],
      buttonText: "Contact Sales",
      buttonHref: "/contact",
      icon: Building2,
      isPopular: false,
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative min-h-screen bg-[#030303]">
      <ParticlesBackground />

      {/* Content */}
      <div className="relative z-10 pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/70">Simple, transparent pricing</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-light text-white mb-6">
              Choose your{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent">
                Aurora
              </span>{" "}
              plan
            </h1>

            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Start free with $5 credit. Scale seamlessly as you grow. 
              No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Billing toggle */}
          <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.title}
                {...plan}
                delay={0.1 + index * 0.1}
              />
            ))}
          </div>

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 text-center"
          >
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
              {[
                { label: "99.9% Uptime", value: "SLA Guaranteed" },
                { label: "Sub-ms", value: "Routing Latency" },
                { label: "10M+", value: "Requests Processed" },
                { label: "SOC 2", value: "Type II Compliant" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-medium text-white">{stat.label}</div>
                  <div className="text-xs text-white/40">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* FAQ prompt */}
            <p className="text-white/50 mb-4">
              Have questions?{" "}
              <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Contact our team
              </Link>{" "}
              or check out our{" "}
              <Link href="/docs" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                documentation
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <FooterXai />
    </main>
  );
}
