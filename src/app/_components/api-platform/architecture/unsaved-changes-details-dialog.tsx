"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type {
	UnsavedChange,
	UnsavedFormData,
} from "@/types/architecture-canvas";

interface UnsavedChangesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	unsavedForms: Map<string, UnsavedFormData>;
	onFormSaved: (formId: string) => void;
	onFormReset: (formId: string) => void;
	onChangeDiscard: (formId: string, changeIndex: number) => void;
}

export function UnsavedChangesDetailsDialog({
	open,
	onOpenChange,
	unsavedForms,
	onFormSaved,
	onFormReset,
	onChangeDiscard,
}: UnsavedChangesDetailsDialogProps) {
	const [loadingStates, setLoadingStates] = useState<
		Map<string, "save" | "reset" | number>
	>(new Map());

	const handleSaveForm = async (formId: string, form: UnsavedFormData) => {
		setLoadingStates((prev) => new Map(prev).set(formId, "save"));
		try {
			await form.onSave();
			onFormSaved(formId);
		} finally {
			setLoadingStates((prev) => {
				const next = new Map(prev);
				next.delete(formId);
				return next;
			});
		}
	};

	const handleResetForm = (formId: string, form: UnsavedFormData) => {
		setLoadingStates((prev) => new Map(prev).set(formId, "reset"));
		try {
			form.onReset();
			onFormReset(formId);
		} finally {
			setLoadingStates((prev) => {
				const next = new Map(prev);
				next.delete(formId);
				return next;
			});
		}
	};

	const handleDiscardChange = (
		formId: string,
		changeIndex: number,
		_change: UnsavedChange,
		_form: UnsavedFormData,
	) => {
		setLoadingStates((prev) => new Map(prev).set(formId, changeIndex));
		try {
			onChangeDiscard(formId, changeIndex);
		} finally {
			setLoadingStates((prev) => {
				const next = new Map(prev);
				next.delete(formId);
				return next;
			});
		}
	};

	const isFormLoading = (formId: string) => loadingStates.has(formId);
	const isChangeLoading = (formId: string, changeIndex: number) =>
		loadingStates.get(formId) === changeIndex;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Unsaved Changes</DialogTitle>
					<DialogDescription>
						Review and manage your unsaved changes. You can save or discard
						changes for each provider, or discard individual field changes.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{Array.from(unsavedForms.entries()).map(([formId, form]) => (
						<div key={formId} className="rounded-lg border bg-card">
							<div className="flex items-center justify-between border-b p-4">
								<div>
									<h3 className="font-semibold text-sm">{form.name}</h3>
									<p className="text-muted-foreground text-xs">
										{form.changes.length} field
										{form.changes.length !== 1 ? "s" : ""} changed
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleResetForm(formId, form)}
										disabled={isFormLoading(formId)}
									>
										{loadingStates.get(formId) === "reset"
											? "Discarding..."
											: "Discard All"}
									</Button>
									<Button
										variant="default"
										size="sm"
										onClick={() => handleSaveForm(formId, form)}
										disabled={isFormLoading(formId)}
									>
										{loadingStates.get(formId) === "save"
											? "Saving..."
											: "Save All"}
									</Button>
								</div>
							</div>

							<div className="space-y-0">
								{form.changes.map((change, changeIndex) => (
									<div key={changeIndex}>
										<div className="flex items-start justify-between gap-4 p-4">
											<div className="min-w-0 flex-1 space-y-2">
												<div className="flex items-center gap-2">
													<span className="font-medium text-foreground text-sm">
														{change.field}
													</span>
												</div>
												<div className="rounded bg-muted/50 p-3 font-mono text-xs">
													<div className="flex flex-wrap items-center gap-2">
														<span className="text-destructive line-through">
															{change.oldValue || "(empty)"}
														</span>
														<span className="text-muted-foreground">→</span>
														<span className="text-emerald-600 dark:text-emerald-400">
															{change.newValue || "(empty)"}
														</span>
													</div>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDiscardChange(formId, changeIndex, change, form)
												}
												disabled={isChangeLoading(formId, changeIndex)}
												className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
											>
												{isChangeLoading(formId, changeIndex)
													? "Discarding..."
													: "Discard"}
											</Button>
										</div>
										{changeIndex < form.changes.length - 1 && (
											<Separator className="mx-4" />
										)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
