"use client";

import { useState } from "react";
import { ToastSave } from "@/components/ui/toast-save";

interface UnsavedChangesToastProps {
	unsavedForms: Map<
		string,
		{ name: string; onSave: () => Promise<void>; onReset: () => void }
	>;
	onSaveAll: () => Promise<void>;
	onResetAll: () => void;
	onShowDetails: () => void;
}

export function UnsavedChangesToast({
	unsavedForms,
	onSaveAll,
	onResetAll,
	onShowDetails,
}: UnsavedChangesToastProps) {
	const [saveState, setSaveState] = useState<"initial" | "loading" | "success">(
		"initial",
	);

	const dirtyCount = unsavedForms.size;
	const hasDirtyForms = unsavedForms.size > 0;

	const handleSaveAll = async () => {
		setSaveState("loading");
		try {
			await onSaveAll();
			setSaveState("success");
			setTimeout(() => {
				setSaveState("initial");
			}, 2000);
		} catch (error) {
			console.error("Failed to save all forms:", error);
			setSaveState("initial");
		}
	};

	const handleResetAll = () => {
		onResetAll();
		setSaveState("initial");
	};

	if (!hasDirtyForms) {
		return null;
	}

	return (
		<div className="-translate-x-1/2 fixed bottom-4 left-1/2 z-[9999]">
			<ToastSave
				state={saveState}
				onReset={handleResetAll}
				onSave={handleSaveAll}
				onDetails={onShowDetails}
				loadingText="Saving all changes"
				successText="All changes saved"
				initialText={`${dirtyCount} unsaved change${dirtyCount > 1 ? "s" : ""}`}
				resetText={dirtyCount > 1 ? "Discard All" : "Discard"}
				saveText={dirtyCount > 1 ? "Save All" : "Save"}
			/>
		</div>
	);
}
