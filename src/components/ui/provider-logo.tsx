"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ProviderLogoProps {
  provider: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

const themeAwareProviders = {
  "z-ai": {
    lightSrc: "/logos/z-ai-light.png",
    darkSrc: "/logos/z-ai-dark.png",
  },
  // Add other providers here if they get theme-aware logos
};

export function ProviderLogo({
  provider,
  width = 24,
  height = 24,
  className = "",
  alt,
}: ProviderLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themeConfig = themeAwareProviders[provider.toLowerCase() as keyof typeof themeAwareProviders];

  if (themeConfig) {
    // Use theme-aware logo
    const src = resolvedTheme === "dark" ? themeConfig.darkSrc : themeConfig.lightSrc;
    return (
      <Image
        src={src}
        alt={alt || `${provider} logo`}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // Fallback to static logo
  const staticSrc = getProviderLogo(provider);
  if (!staticSrc) {
    return null;
  }

  return (
    <Image
      src={staticSrc}
      alt={alt || `${provider} logo`}
      width={width}
      height={height}
      className={className}
    />
  );
}

// Keep the original function for backward compatibility
export const getProviderLogo = (provider: string): string | undefined => {
	const logoMap: { [key: string]: string } = {
		anthropic: "/logos/anthropic.jpeg",
		openai: "/logos/openai.webp",
		meta: "/logos/meta.png",
		gemini: "/logos/google-ai-studio.svg",
		google: "/logos/google-ai-studio.svg",
		"google-ai-studio": "/logos/google-ai-studio.svg",
		"z-ai": "/logos/z-ai-light.png", // Default to light for backward compatibility
	};
	return logoMap[provider.toLowerCase()];
};