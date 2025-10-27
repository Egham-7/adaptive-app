import type { ProviderConfigApiResponse } from "./providers";

export interface ArchitectureCanvasProps {
	projectId: number;
	providers: ProviderConfigApiResponse[];
}

export interface SelectedProvider {
	name: string;
	isCustom: boolean;
	config?: ProviderConfigApiResponse;
}

export interface ProviderNodeData {
	providerName: string;
	isCustom: boolean;
	isConfigured: boolean;
	config?: ProviderConfigApiResponse;
	onClick: () => void;
	providerHandleId: "top" | "right" | "bottom" | "left";
	adaptiveHandleId: "top" | "right" | "bottom" | "left";
}

export interface UnsavedChange {
	field: string;
	oldValue: string;
	newValue: string;
}

export interface UnsavedFormData {
	name: string;
	onSave: () => Promise<void>;
	onReset: () => void;
	changes: UnsavedChange[];
}

export interface ProviderInfo {
	name: string;
	isCustom: boolean;
	isConfigured: boolean;
	config?: ProviderConfigApiResponse;
}

export interface SheetState {
	name: string;
	isCustom: boolean;
	config?: ProviderConfigApiResponse;
}
