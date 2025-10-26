"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
	applyNodeChanges,
	Background,
	type Edge,
	MarkerType,
	type Node,
	type NodeChange,
	type OnNodesChange,
	ReactFlowProvider,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import { CreateProviderDialog } from "@/app/_components/api-platform/create-provider-dialog";
import { Button } from "@/components/ui/button";
import { useProjectAdaptiveConfig } from "@/hooks/adaptive-config";
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
import { AdaptiveConfigSheet } from "./adaptive-config-sheet";
import { AdaptiveNodeCard } from "./adaptive-node-card";
import { CanvasControls } from "./canvas-controls";
import { ProviderConfigSheet } from "./provider-config-sheet";
import { ProviderNodeCard } from "./provider-node-card";

const CARD_WIDTH = 280;
const ADAPTIVE_NODE_SIZE = 320;
const _CARD_GAP = 100;
const RADIUS = 650; // Radius for circular arrangement (increased to prevent overlap)

interface AdaptiveNodeData {
	isConfigured: boolean;
	configSource?: "project" | "organization" | "yaml";
	onClick: () => void;
	highlight: boolean;
}

const nodeTypes = {
	provider: ({ data }: { data: ProviderNodeData }) => (
		<ProviderNodeCard
			providerName={data.providerName}
			isCustom={data.isCustom}
			isConfigured={data.isConfigured}
			config={data.config}
			onClick={data.onClick}
			handlePosition={data.handlePosition}
		/>
	),
	adaptive: ({ data }: { data: AdaptiveNodeData }) => (
		<AdaptiveNodeCard
			isConfigured={data.isConfigured}
			configSource={data.configSource}
			onClick={data.onClick}
			highlight={data.highlight}
		/>
	),
};

/**
 * Calculate position for adaptive node (center)
 * Offset to account for adaptive node size so it's visually centered
 */
const getAdaptiveNodePosition = () => ({
	x: -ADAPTIVE_NODE_SIZE / 2,
	y: -ADAPTIVE_NODE_SIZE / 2,
});

/**
 * Calculate positions for provider nodes in a circle around the adaptive node
 * Places nodes evenly around the circle, accounting for card width
 */
const getProviderNodePosition = (index: number, total: number) => {
	const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
	const x = Math.cos(angle) * RADIUS - CARD_WIDTH / 2;
	const y = Math.sin(angle) * RADIUS - CARD_WIDTH / 2;
	return { x, y };
};

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

// Inner component that uses useReactFlow hook
function ArchitectureCanvasInner({
	projectId,
	providers,
}: ArchitectureCanvasProps) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [visibleSheet, setVisibleSheet] = useState<string | null>(null);
	const [showAdaptiveSheet, setShowAdaptiveSheet] = useState(false);
	const [adaptiveNodeHighlight, setAdaptiveNodeHighlight] = useState(false);
	const { setCenter } = useReactFlow();

	// Fetch adaptive config
	const { data: adaptiveConfig } = useProjectAdaptiveConfig(projectId);

	const allProviders = useMemo(() => combineProviders(providers), [providers]);

	const handleProviderClick = useCallback((name: string) => {
		setVisibleSheet(name);
	}, []);

	const handleAdaptiveClick = useCallback(() => {
		setShowAdaptiveSheet(true);
	}, []);

	const handleSheetClose = useCallback(() => {
		// Zoom back out to fit all content when closing any sheet
		setCenter(0, 0, { zoom: 0.6, duration: 300 });
	}, [setCenter]);

	const handleAdaptiveSaveSuccess = useCallback(() => {
		// Trigger highlight animation
		setAdaptiveNodeHighlight(true);
		setTimeout(() => setAdaptiveNodeHighlight(false), 2000);
	}, []);

	const initialNodes = useMemo<Node[]>(() => {
		const totalProviders = allProviders.length;

		// Wrapper for adaptive click that includes zoom functionality
		const handleAdaptiveClickWithZoom = () => {
			const adaptivePos = getAdaptiveNodePosition();
			const centerX = adaptivePos.x + ADAPTIVE_NODE_SIZE / 2;
			const centerY = adaptivePos.y + ADAPTIVE_NODE_SIZE / 2;
			setCenter(centerX, centerY, { zoom: 1.5, duration: 300 });
			handleAdaptiveClick();
		};

		// Create adaptive node (centered)
		const adaptiveNode: Node = {
			id: "adaptive",
			type: "adaptive",
			position: getAdaptiveNodePosition(),
			data: {
				isConfigured:
					adaptiveConfig?.source === "project" ||
					adaptiveConfig?.source === "organization",
				configSource: adaptiveConfig?.source,
				onClick: handleAdaptiveClickWithZoom,
				highlight: adaptiveNodeHighlight,
			},
			draggable: true,
		};

		// Create provider nodes arranged in a circle
		const providerNodes = allProviders.map((provider, index) => {
			const angle = (index / totalProviders) * 2 * Math.PI - Math.PI / 2;

			// Determine which side of the provider node should have the handle
			// The handle should be on the side facing the adaptive node (center)
			// This is the OPPOSITE of where the provider is positioned
			let providerHandlePosition: "top" | "right" | "bottom" | "left";
			let adaptiveHandlePosition: "top" | "right" | "bottom" | "left";

			// Normalize angle to 0-360 degrees
			const degrees = ((angle * 180) / Math.PI + 360) % 360;

			// Determine handle positions based on angle quadrant
			if (degrees >= 315 || degrees < 45) {
				// Provider is to the right
				providerHandlePosition = "left"; // Handle on left side of provider (facing center)
				adaptiveHandlePosition = "right"; // Handle on right side of adaptive (facing provider)
			} else if (degrees >= 45 && degrees < 135) {
				// Provider is below
				providerHandlePosition = "top"; // Handle on top side of provider (facing center)
				adaptiveHandlePosition = "bottom"; // Handle on bottom side of adaptive (facing provider)
			} else if (degrees >= 135 && degrees < 225) {
				// Provider is to the left
				providerHandlePosition = "right"; // Handle on right side of provider (facing center)
				adaptiveHandlePosition = "left"; // Handle on left side of adaptive (facing provider)
			} else {
				// Provider is above
				providerHandlePosition = "bottom"; // Handle on bottom side of provider (facing center)
				adaptiveHandlePosition = "top"; // Handle on top side of adaptive (facing provider)
			}

			const nodePosition = getProviderNodePosition(index, totalProviders);

			// Wrapper for provider click that includes zoom functionality
			const handleProviderClickWithZoom = () => {
				const centerX = nodePosition.x + CARD_WIDTH / 2;
				const centerY = nodePosition.y + CARD_WIDTH / 2;
				setCenter(centerX, centerY, { zoom: 1.5, duration: 300 });
				handleProviderClick(provider.name);
			};

			return {
				id: provider.name,
				type: "provider",
				position: nodePosition,
				data: {
					providerName: provider.name,
					isCustom: provider.isCustom,
					isConfigured: provider.isConfigured,
					config: provider.config,
					onClick: handleProviderClickWithZoom,
					handlePosition: providerHandlePosition,
					adaptiveHandlePosition,
				},
				draggable: true,
			};
		});

		return [adaptiveNode, ...providerNodes];
	}, [
		allProviders,
		adaptiveConfig,
		adaptiveNodeHighlight,
		handleProviderClick,
		handleAdaptiveClick,
		setCenter,
	]);

	const [nodes, setNodes] = useState<Node[]>(initialNodes);

	useMemo(() => {
		setNodes(initialNodes);
	}, [initialNodes]);

	// Create edges from adaptive node to providers
	const edges = useMemo<Edge[]>(() => {
		const generatedEdges = allProviders
			.filter((provider) => {
				if (!provider.isConfigured) return true;
				if (provider.config?.enabled) return true;
				return false;
			})
			.map((provider) => {
				const providerNode = nodes.find((n) => n.id === provider.name);
				const nodeData = providerNode?.data as ProviderNodeData;
				const providerHandlePosition = nodeData?.handlePosition || "top";
				const adaptiveHandlePosition =
					nodeData?.adaptiveHandlePosition || "bottom";

				return {
					id: `adaptive-${provider.name}`,
					source: "adaptive",
					target: provider.name,
					sourceHandle: adaptiveHandlePosition,
					targetHandle: providerHandlePosition,
					type: "default",
					animated: true,
					style: {
						stroke: "#253957",
						strokeWidth: 3,
					},
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: "#253957",
					},
				};
			});

		console.log("Generated edges:", generatedEdges);
		console.log(
			"All providers:",
			allProviders.map((p) => p.name),
		);
		console.log(
			"Nodes:",
			nodes.map((n) => n.id),
		);

		return generatedEdges;
	}, [allProviders, nodes]);

	const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
		setNodes((nds) => applyNodeChanges(changes, nds));
	}, []);

	const currentProvider = visibleSheet
		? allProviders.find((p) => p.name === visibleSheet)
		: null;

	return (
		<div className="relative h-screen w-full overflow-hidden rounded-lg border">
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
				edges={edges}
				onNodesChange={onNodesChange}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{
					padding: 0.2,
					includeHiddenNodes: false,
				}}
				minZoom={0.2}
				maxZoom={1.5}
				defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
				panOnScroll
				panOnDrag
				zoomOnScroll
				zoomOnPinch
				preventScrolling={false}
				proOptions={{ hideAttribution: true }}
			>
				<Background gap={40} />
				<CanvasControls />
			</ReactFlow>

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
						if (!open) {
							handleSheetClose();
							setVisibleSheet(null);
						}
					}}
					providerName={currentProvider.name}
					isCustom={currentProvider.isCustom}
					projectId={projectId}
					existingConfig={currentProvider.config}
				/>
			)}

			<AdaptiveConfigSheet
				open={showAdaptiveSheet}
				onOpenChange={(open) => {
					if (!open) {
						handleSheetClose();
					}
					setShowAdaptiveSheet(open);
				}}
				projectId={projectId}
				existingConfig={adaptiveConfig}
				onSaveSuccess={handleAdaptiveSaveSuccess}
			/>
		</div>
	);
}

// Wrapper component that provides ReactFlow context
export function ArchitectureCanvas(props: ArchitectureCanvasProps) {
	return (
		<ReactFlowProvider>
			<ArchitectureCanvasInner {...props} />
		</ReactFlowProvider>
	);
}
