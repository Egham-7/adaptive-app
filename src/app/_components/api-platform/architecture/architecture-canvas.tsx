"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
	applyNodeChanges,
	type Node,
	type NodeChange,
	type OnNodesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import { CreateProviderDialog } from "@/app/_components/api-platform/create-provider-dialog";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/grid-background";
import type {
	ArchitectureCanvasProps,
	ProviderInfo,
	ProviderNodeData,
} from "@/types/architecture-canvas";
import {
	PROVIDER_METADATA,
	type ProviderConfigApiResponse,
	type ProviderName,
} from "@/types/providers";
import { CanvasControls } from "./canvas-controls";
import { ProviderConfigSheet } from "./provider-config-sheet";
import { ProviderNodeCard } from "./provider-node-card";

const CARD_WIDTH = 280;
const CARD_GAP = 40;

const nodeTypes = {
	provider: ({ data }: { data: ProviderNodeData }) => (
		<ProviderNodeCard
			providerName={data.providerName}
			isCustom={data.isCustom}
			isConfigured={data.isConfigured}
			config={data.config}
			onClick={data.onClick}
		/>
	),
};

const getNodePosition = (index: number) => ({
	x: index * (CARD_WIDTH + CARD_GAP),
	y: 0,
});

const combineProviders = (
	providers: ProviderConfigApiResponse[],
): ProviderInfo[] => {
	const defaultProviders = Object.keys(PROVIDER_METADATA) as ProviderName[];

	const customProviders = providers.filter(
		(p) => !PROVIDER_METADATA[p.provider_name as ProviderName],
	);

	return [
		...defaultProviders.map((name) => {
			const config = providers.find((p) => p.provider_name === name);
			return {
				name,
				isCustom: false,
				isConfigured: !!config,
				config,
			};
		}),
		...customProviders.map((config) => ({
			name: config.provider_name,
			isCustom: true,
			isConfigured: true,
			config,
		})),
	];
};

export function ArchitectureCanvas({
	projectId,
	providers,
}: ArchitectureCanvasProps) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [visibleSheet, setVisibleSheet] = useState<string | null>(null);

	const allProviders = useMemo(() => combineProviders(providers), [providers]);

	const handleProviderClick = useCallback((name: string) => {
		setVisibleSheet(name);
	}, []);

	const initialNodes = useMemo<Node[]>(
		() =>
			allProviders.map((provider, index) => ({
				id: provider.name,
				type: "provider",
				position: getNodePosition(index),
				data: {
					providerName: provider.name,
					isCustom: provider.isCustom,
					isConfigured: provider.isConfigured,
					config: provider.config,
					onClick: () => handleProviderClick(provider.name),
				},
				draggable: true,
			})),
		[allProviders, handleProviderClick],
	);

	const [nodes, setNodes] = useState<Node[]>(initialNodes);

	useMemo(() => {
		setNodes(initialNodes);
	}, [initialNodes]);

	const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
		setNodes((nds) => applyNodeChanges(changes, nds));
	}, []);

	const currentProvider = visibleSheet
		? allProviders.find((p) => p.name === visibleSheet)
		: null;

	return (
		<GridBackground
			className="h-screen overflow-hidden rounded-lg border"
			gridSize={40}
		>
			<div className="relative h-full w-full">
				<div className="absolute top-4 right-4 z-10">
					<Button
						onClick={() => setShowCreateDialog(true)}
						variant="default"
						size="sm"
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Custom Provider
					</Button>
				</div>

				<ReactFlow
					nodes={nodes}
					onNodesChange={onNodesChange}
					nodeTypes={nodeTypes}
					fitView
					minZoom={0.2}
					maxZoom={2}
					defaultViewport={{ x: 0, y: 0, zoom: 1 }}
					panOnScroll
					panOnDrag
					zoomOnScroll
					zoomOnPinch
					preventScrolling={false}
					style={{ background: "transparent" }}
				>
					<CanvasControls />
				</ReactFlow>
			</div>

			<CreateProviderDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				level="project"
				projectId={projectId}
			/>

			{currentProvider && (
				<ProviderConfigSheet
					key={currentProvider.name}
					open={true}
					onOpenChange={(open) => {
						if (!open) setVisibleSheet(null);
					}}
					providerName={currentProvider.name}
					isCustom={currentProvider.isCustom}
					projectId={projectId}
					existingConfig={currentProvider.config}
				/>
			)}
		</GridBackground>
	);
}
