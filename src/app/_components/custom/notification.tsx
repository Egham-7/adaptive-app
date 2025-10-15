"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type NotificationProps = {
	type: "success" | "error" | "info" | "warning";
	message: string;
	onClose: () => void;
	autoClose?: boolean;
	duration?: number;
};

export default function Notification({
	type,
	message,
	onClose,
	autoClose = true,
	duration = 5000,
}: NotificationProps) {
	useEffect(() => {
		if (autoClose) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [autoClose, duration, onClose]);

	const getStyles = () => {
		switch (type) {
			case "success":
				return "bg-success text-success-foreground";
			case "error":
				return "bg-destructive text-destructive-foreground";
			case "warning":
				return "bg-warning text-warning-foreground";
			case "info":
				return "bg-blue-500 text-white";
			default:
				return "bg-gray-500 text-white";
		}
	};

	return (
		<div
			className={`fixed top-4 right-4 z-50 rounded-lg px-6 py-4 shadow-lg ${getStyles()}`}
		>
			<div className="flex items-center justify-between">
				<span>{message}</span>
				<Button
					type="button"
					onClick={onClose}
					variant="ghost"
					size="icon"
					className="ml-4 h-auto w-auto p-0 text-white hover:bg-transparent hover:text-gray-200"
				>
					✕
				</Button>
			</div>
		</div>
	);
}
