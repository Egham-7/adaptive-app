"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface BaseLogoProps {
  imageWidth?: number;
  imageHeight?: number;
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl";
  showText?: boolean;
  className?: string;
}

interface AdaptiveLogoProps extends BaseLogoProps {
  brand: "adaptive";
}

interface CursorLogoProps extends BaseLogoProps {
  brand: "cursor";
}

interface ClineLogoProps extends BaseLogoProps {
  brand: "cline";
}

interface KiloCodeLogoProps extends BaseLogoProps {
  brand: "kilo-code";
}

interface RooCodeLogoProps extends BaseLogoProps {
  brand: "roo-code";
}

interface QwenLogoProps extends BaseLogoProps {
  brand: "qwen";
}

interface ClaudeCodeLogoProps extends BaseLogoProps {
  brand: "claude-code";
}

interface CrewAILogoProps extends BaseLogoProps {
  brand: "crew-ai";
}

interface LlamaIndexLogoProps extends BaseLogoProps {
  brand: "llama-index";
}

type LogoProps = AdaptiveLogoProps | CursorLogoProps | ClineLogoProps | KiloCodeLogoProps | RooCodeLogoProps | QwenLogoProps | ClaudeCodeLogoProps | CrewAILogoProps | LlamaIndexLogoProps;

const textSizeMap = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const brandConfig = {
  adaptive: {
    lightSrc: "/logos/adaptive-light.png",
    darkSrc: "/logos/adaptive-dark.png",
    alt: "Adaptive Logo",
    text: "Adaptive",
  },
  cursor: {
    lightSrc: "/logos/cursor-light.png",
    darkSrc: "/logos/cursor-dark.png",
    alt: "Cursor Logo",
    text: "Cursor",
  },
  cline: {
    lightSrc: "/logos/cline-light.png",
    darkSrc: "/logos/cline-dark.png",
    alt: "Cline Logo",
    text: "Cline",
  },
  "kilo-code": {
    lightSrc: "/logos/kilo-code.jpeg",
    darkSrc: "/logos/kilo-code.jpeg",
    alt: "Kilo Code Logo",
    text: "Kilo Code",
  },
  "roo-code": {
    lightSrc: "/logos/roo-code.jpeg",
    darkSrc: "/logos/roo-code.jpeg",
    alt: "Roo Code Logo",
    text: "Roo Code",
  },
  qwen: {
    lightSrc: "/logos/qwen.png",
    darkSrc: "/logos/qwen.png",
    alt: "Qwen Logo",
    text: "Qwen",
  },
  "claude-code": {
    lightSrc: "/logos/claude-code.png",
    darkSrc: "/logos/claude-code.png",
    alt: "Claude Code Logo",
    text: "Claude Code",
  },
  "crew-ai": {
    lightSrc: "/logos/crew-ai-light.png",
    darkSrc: "/logos/crew-ai-dark.png",
    alt: "CrewAI Logo",
    text: "CrewAI",
  },
  "llama-index": {
    lightSrc: "/logos/llama-index.png",
    darkSrc: "/logos/llama-index.png",
    alt: "LlamaIndex Logo",
    text: "LlamaIndex",
  },
};

export function Logo({
  brand,
  imageWidth = 120,
  imageHeight = 100,
  textSize = "xl",
  showText = true,
  className = "",
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const config = brandConfig[brand];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={resolvedTheme === "dark" ? config.darkSrc : config.lightSrc}
        alt={config.alt}
        width={imageWidth}
        height={imageHeight}
        className="mr-2"
      />
      {showText && (
        <span
          className={`bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text font-bold font-display text-transparent ${textSizeMap[textSize]}`}
        >
          {config.text}
        </span>
      )}
    </div>
  );
}
