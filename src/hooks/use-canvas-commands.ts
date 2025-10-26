import { useEffect, useCallback } from "react";

export interface CanvasCommand {
	id: string;
	label: string;
	shortcut: string;
	shortcutDisplay: string;
	handler: () => void;
	enabled?: boolean;
}

interface UseCanvasCommandsOptions {
	commands: CanvasCommand[];
}

/**
 * Hook to manage canvas commands and keyboard shortcuts
 * Provides a scalable way to register commands with keyboard shortcuts
 *
 * @example
 * const commands = [
 *   {
 *     id: 'add-provider',
 *     label: 'Add Provider',
 *     shortcut: 'mod+p',
 *     shortcutDisplay: '⌘P',
 *     handler: () => setShowAddDialog(true),
 *   }
 * ];
 *
 * useCanvasCommands({ commands });
 */
export function useCanvasCommands({ commands }: UseCanvasCommandsOptions) {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Don't handle shortcuts when typing in input fields
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			for (const command of commands) {
				if (command.enabled === false) continue;

				const shortcutParts = command.shortcut.toLowerCase().split("+");
				const key = shortcutParts[shortcutParts.length - 1];
				const needsMod = shortcutParts.includes("mod");
				const needsCtrl = shortcutParts.includes("ctrl");
				const needsShift = shortcutParts.includes("shift");
				const needsAlt = shortcutParts.includes("alt");

				// Check key match
				const keyMatches = event.key.toLowerCase() === key;
				if (!keyMatches) continue;

				// Check modifiers match exactly
				const modPressed = event.metaKey || event.ctrlKey;
				const modMatches = needsMod ? modPressed : true;
				const ctrlMatches = needsCtrl ? event.ctrlKey : !event.ctrlKey || needsMod;
				const shiftMatches = needsShift ? event.shiftKey : !event.shiftKey;
				const altMatches = needsAlt ? event.altKey : !event.altKey;

				if (modMatches && ctrlMatches && shiftMatches && altMatches) {
					event.preventDefault();
					command.handler();
					break;
				}
			}
		},
		[commands],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	return {
		commands: commands.filter((cmd) => cmd.enabled !== false),
	};
}
