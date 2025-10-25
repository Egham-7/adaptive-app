"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/shared/utils";

interface ToastSaveProps extends React.HTMLAttributes<HTMLDivElement> {
  state: "initial" | "loading" | "success";
  onReset?: () => void;
  onSave?: () => void;
  onDetails?: () => void;
  loadingText?: string;
  successText?: string;
  initialText?: string;
  resetText?: string;
  saveText?: string;
}

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    className="text-current"
  >
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <circle cx="9" cy="9" r="7.25"></circle>
      <line x1="9" y1="12.819" x2="9" y2="8.25"></line>
      <path
        d="M9,6.75c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z"
        fill="currentColor"
        data-stroke="none"
        stroke="none"
      ></path>
    </g>
  </svg>
);

const springConfig = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
};

export function ToastSave({
  state = "initial",
  onReset,
  onSave,
  onDetails,
  loadingText = "Saving",
  successText = "Changes Saved",
  initialText = "Unsaved changes",
  resetText = "Reset",
  saveText = "Save",
  className,
  ...props
}: ToastSaveProps) {
  // Separate motion-specific props from HTML div props to avoid conflicts
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...restProps
  } = props;

  return (
    <motion.div
      className={cn(
        "inline-flex h-10 items-center justify-center overflow-hidden rounded-full",
        "bg-background/95 backdrop-blur",
        "border border-border",
        "shadow-sm",
        className,
      )}
      initial={false}
      animate={{ width: "auto" }}
      transition={springConfig}
      {...restProps}
    >
      <div className="flex h-full items-center justify-between px-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="flex items-center gap-2 text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
          >
            {state === "loading" && (
              <>
                <Spinner size="sm" />
                <div className="text-[13px] font-normal leading-tight whitespace-nowrap">
                  {loadingText}
                </div>
              </>
            )}
            {state === "success" && (
              <>
                <div className="p-0.5 bg-success/10 rounded-[99px] shadow-sm border border-success/20 justify-center items-center gap-1.5 flex overflow-hidden">
                  <Check className="w-3.5 h-3.5 text-success-foreground" />
                </div>
                <div className="text-[13px] font-normal leading-tight whitespace-nowrap">
                  {successText}
                </div>
              </>
            )}
            {state === "initial" && (
              <>
                <div className="text-foreground/80">
                  <InfoIcon />
                </div>
                <div className="text-[13px] font-normal leading-tight whitespace-nowrap">
                  {initialText}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {state === "initial" && (
            <motion.div
              className="ml-2 flex items-center gap-2"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ ...springConfig, opacity: { duration: 0 } }}
            >
              {onDetails && (
                <Button
                  onClick={onDetails}
                  variant="ghost"
                  className="h-7 px-3 py-0 rounded-[99px] text-[13px] font-normal hover:bg-muted/80 transition-colors"
                >
                  Details
                </Button>
              )}
              <Button
                onClick={onReset}
                variant="ghost"
                className="h-7 px-3 py-0 rounded-[99px] text-[13px] font-normal hover:bg-muted/80 transition-colors"
              >
                {resetText}
              </Button>
              <Button
                onClick={onSave}
                className="h-7 px-3 py-0 rounded-[99px] text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {saveText}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
