"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

interface UnsavedForm {
	id: string;
	formName: string;
	onSave: () => Promise<void>;
	onReset: () => void;
}

interface UnsavedFormsContextType {
	registerForm: (
		id: string,
		formName: string,
		onSave: () => Promise<void>,
		onReset: () => void,
	) => void;
	unregisterForm: (id: string) => void;
	saveAll: () => Promise<void>;
	resetAll: () => void;
	dirtyCount: number;
	hasDirtyForms: boolean;
}

const UnsavedFormsContext = createContext<UnsavedFormsContextType | undefined>(
	undefined,
);

export function UnsavedFormsProvider({ children }: { children: ReactNode }) {
	const [forms, setForms] = useState<Map<string, UnsavedForm>>(new Map());

	const registerForm = useCallback(
		(
			id: string,
			formName: string,
			onSave: () => Promise<void>,
			onReset: () => void,
		) => {
			console.log("Context: Registering form", id, formName);
			setForms((prev) => {
				const next = new Map(prev);
				next.set(id, { id, formName, onSave, onReset });
				console.log("Context: Forms after register", Array.from(next.keys()));
				return next;
			});
		},
		[],
	);

	const unregisterForm = useCallback((id: string) => {
		setForms((prev) => {
			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	}, []);

	const saveAll = useCallback(async () => {
		const formsArray = Array.from(forms.values());
		if (formsArray.length === 0) return;

		try {
			// Save all forms in parallel, but stop on first error
			await Promise.all(formsArray.map((form) => form.onSave()));

			// If all succeed, clear all forms
			setForms(new Map());
		} catch (error) {
			// If any fails, stop and re-throw
			// The forms stay registered so user can try again
			console.error("Failed to save all forms:", error);
			throw error;
		}
	}, [forms]);

	const resetAll = useCallback(() => {
		const formsArray = Array.from(forms.values());
		for (const form of formsArray) {
			form.onReset();
		}
		setForms(new Map());
	}, [forms]);

	const dirtyCount = useMemo(() => forms.size, [forms]);
	const hasDirtyForms = useMemo(() => forms.size > 0, [forms]);

	const value = useMemo(
		() => ({
			forms,
			registerForm,
			unregisterForm,
			saveAll,
			resetAll,
			dirtyCount,
			hasDirtyForms,
		}),
		[
			forms,
			registerForm,
			unregisterForm,
			saveAll,
			resetAll,
			dirtyCount,
			hasDirtyForms,
		],
	);

	return (
		<UnsavedFormsContext.Provider value={value}>
			{children}
		</UnsavedFormsContext.Provider>
	);
}

export function useUnsavedForms() {
	const context = useContext(UnsavedFormsContext);
	if (!context) {
		throw new Error("useUnsavedForms must be used within UnsavedFormsProvider");
	}
	return context;
}
