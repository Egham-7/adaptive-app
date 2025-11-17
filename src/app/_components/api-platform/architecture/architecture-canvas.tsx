"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
	Background,
	type Edge,
	MarkerType,
	type Node,
	type NodeChange,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { History, Plus } from "lucide-react";
import { AddProviderDialog } from "@/app/_components/api-platform/add-provider-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectAdaptiveConfig } from "@/hooks/adaptive-config";
import { useProjectAuditHistory } from "@/hooks/audit/use-project-audit-history";
import { useDeleteProjectProvider } from "@/hooks/provider-configs";
import {
	type CanvasCommand,
	useCanvasCommands,
} from "@/hooks/use-canvas-commands";
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
import { AuditLogDrawer } from "../audit/audit-log-drawer";
import { AdaptiveConfigSheet } from "./adaptive-config-sheet";
import { AdaptiveNodeCard } from "./adaptive-node-card";
import { CanvasControls } from "./canvas-controls";
import { ConnectSheet } from "./connect-sheet";
import { ProviderConfigSheet } from "./provider-config-sheet";
import { ProviderNodeCard } from "./provider-node-card";

// Layout constants
const CARD_WIDTH = 280;
const CARD_HEIGHT = 160;
const ADAPTIVE_NODE_SIZE = 320;
const RADIUS = 500; // Fixed radius for circular layout

interface AdaptiveNodeData {
	isConfigured: boolean;
	configSource: "project";
	onClick: () => void;
	highlight: boolean;
}

// Helper to determine handle positions based on relative position to adaptive node
const getHandlePositions = (
	x: number,
	y: number,
): {
	providerHandle: "top" | "right" | "bottom" | "left";
	adaptiveHandle: "top" | "right" | "bottom" | "left";
} => {
	const angle = Math.atan2(y, x);
	const degrees = ((angle * 180) / Math.PI + 360) % 360;

	// Determine handle positions based on angle quadrant
	if (degrees >= 315 || degrees < 45) {
		return { providerHandle: "left", adaptiveHandle: "right" };
	}
	if (degrees >= 45 && degrees < 135) {
		return { providerHandle: "top", adaptiveHandle: "bottom" };
	}
	if (degrees >= 135 && degrees < 225) {
		return { providerHandle: "right", adaptiveHandle: "left" };
	}
	return { providerHandle: "bottom", adaptiveHandle: "top" };
};

// Get position for a provider at a specific index in the circle
const getProviderPosition = (index: number) => {
	const angle = (index * 2 * Math.PI) / 8 - Math.PI / 2; // 8 positions around circle
	const x = Math.cos(angle) * RADIUS - CARD_WIDTH / 2;
	const y = Math.sin(angle) * RADIUS - CARD_HEIGHT / 2;
	return { x, y };
};

const nodeTypes = {
	provider: ({ data }: { data: ProviderNodeData }) => (
		<ProviderNodeCard
			providerName={data.providerName}
			isCustom={data.isCustom}
			isConfigured={data.isConfigured}
			onClick={data.onClick}
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

const combineProviders = (
	providers: ProviderConfigApiResponse[],
): ProviderInfo[] => {
	// Only return providers that are in the response (configured)
	return providers.map((config) => ({
		name: config.provider_name,
		isCustom: !PROVIDER_METADATA[config.provider_name as ProviderName],
		isConfigured: true,
		config,
	}));
};

// Inner component that uses useReactFlow hook
type ContextMenuContext =
	| { type: "canvas" }
	| { type: "provider"; providerId: string }
	| { type: "adaptive" };

function ArchitectureCanvasInner({
	projectId,
	providers,
}: ArchitectureCanvasProps) {
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [visibleSheet, setVisibleSheet] = useState<string | null>(null);
	const [showAdaptiveSheet, setShowAdaptiveSheet] = useState(false);
	const [adaptiveNodeHighlight, setAdaptiveNodeHighlight] = useState(false);
	const [contextMenuContext, setContextMenuContext] =
		useState<ContextMenuContext>({ type: "canvas" });
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
	const [historySheetOpen, setHistorySheetOpen] = useState(false);
	const [hasInitialFit, setHasInitialFit] = useState(false);
	const { fitView } = useReactFlow();

	// Fetch adaptive config
	const { data: adaptiveConfig } = useProjectAdaptiveConfig(projectId);

	// Fetch combined audit history
	const {
		data: auditHistory,
		isLoading: historyLoading,
		error: historyError,
	} = useProjectAuditHistory(projectId);

	// Delete provider mutation
	const deleteProvider = useDeleteProjectProvider();

	const allProviders = useMemo(() => combineProviders(providers), [providers]);

	const handleProviderClick = useCallback((name: string) => {
		setVisibleSheet(name);
	}, []);

	const handleAdaptiveClick = useCallback(() => {
		setShowAdaptiveSheet(true);
	}, []);

	const handleSheetClose = useCallback(() => {
		// Use fitView to show all content when closing any sheet
		fitView({
			padding: 0.3,
			duration: 300,
		});
	}, [fitView]);

	const handleAdaptiveSaveSuccess = useCallback(() => {
		// Trigger highlight animation
		setAdaptiveNodeHighlight(true);
		setTimeout(() => setAdaptiveNodeHighlight(false), 2000);
	}, []);

	// Define canvas commands with keyboard shortcuts based on context
	const canvasCommands: CanvasCommand[] = useMemo(() => {
		if (contextMenuContext.type === "canvas") {
			// Canvas context: only "Add Provider"
			return [
				{
					id: "add-provider",
					label: "Add Provider",
					shortcut: "mod+p",
					shortcutDisplay: "⌘P",
					handler: () => setShowAddDialog(true),
				},
			];
		}

		if (contextMenuContext.type === "provider") {
			// Provider node context: "Configure Provider", "View History", and "Delete Provider"
			const provider = allProviders.find(
				(p) => p.name === contextMenuContext.providerId,
			);
			const commands = [
				{
					id: "configure-provider",
					label: "Configure Provider",
					shortcut: "mod+e",
					shortcutDisplay: "⌘E",
					handler: () => {
						setVisibleSheet(contextMenuContext.providerId);
					},
				},
				{
					id: "view-history",
					label: "View History",
					shortcut: "mod+h",
					shortcutDisplay: "⌘H",
					handler: () => {
						setHistorySheetOpen(true);
					},
				},
			];

			// Only show delete for configured providers
			if (provider?.isConfigured) {
				commands.push({
					id: "delete-provider",
					label: "Delete Provider",
					shortcut: "mod+backspace",
					shortcutDisplay: "⌘⌫",
					handler: () => {
						setProviderToDelete(contextMenuContext.providerId);
						setDeleteDialogOpen(true);
					},
				});
			}

			return commands;
		}

		if (contextMenuContext.type === "adaptive") {
			// Adaptive node context: "Configure Adaptive" and "View History"
			return [
				{
					id: "configure-adaptive",
					label: "Configure Adaptive",
					shortcut: "mod+e",
					shortcutDisplay: "⌘E",
					handler: () => {
						setShowAdaptiveSheet(true);
					},
				},
				{
					id: "view-history",
					label: "View History",
					shortcut: "mod+h",
					shortcutDisplay: "⌘H",
					handler: () => {
						setHistorySheetOpen(true);
					},
				},
			];
		}

		return [];
	}, [contextMenuContext, allProviders]);

	// Register commands and keyboard shortcuts
	const { commands } = useCanvasCommands({ commands: canvasCommands });

	// Use React Flow's built-in state management hooks
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges] = useEdgesState([]);

	// Track next available position index
	const nextPositionIndex = useRef(0);

	// Custom nodes change handler to update handle positions on drag
	const handleNodesChange = useCallback(
		(changes: NodeChange[]) => {
			onNodesChange(changes);

			// Check if any position changes occurred
			const positionChanges = changes.filter(
				(
					change,
				): change is NodeChange & {
					type: "position";
					id: string;
					position: { x: number; y: number };
					dragging: boolean;
				} =>
					change.type === "position" &&
					"dragging" in change &&
					change.dragging === true &&
					"position" in change &&
					!!change.position,
			);

			if (positionChanges.length > 0) {
				setNodes((nds) => {
					return nds.map((node) => {
						// Only update provider nodes
						if (node.type !== "provider") return node;

						// Find if this node has a position change
						const change = positionChanges.find((c) => c.id === node.id);
						const position = change?.position || node.position;

						// Calculate relative position to adaptive node (at origin)
						const relativeX = position.x + CARD_WIDTH / 2;
						const relativeY = position.y + CARD_HEIGHT / 2;

						// Get updated handle positions based on current position
						const handlePositions = getHandlePositions(relativeX, relativeY);

						// Update node data with new handle IDs for edge connections
						return {
							...node,
							data: {
								...node.data,
								providerHandleId: handlePositions.providerHandle,
								adaptiveHandleId: handlePositions.adaptiveHandle,
							},
						};
					});
				});
			}
		},
		[onNodesChange, setNodes],
	);

	// Update nodes when providers or config changes
	useEffect(() => {
		const isAdaptiveConfigured = !!adaptiveConfig;

		const newNodes: Node[] = [
			// Adaptive node at center
			{
				id: "adaptive",
				type: "adaptive",
				position: {
					x: -ADAPTIVE_NODE_SIZE / 2,
					y: -ADAPTIVE_NODE_SIZE / 2,
				},
				data: {
					isConfigured: isAdaptiveConfigured,
					configSource: isAdaptiveConfigured
						? adaptiveConfig.source
						: "project",
					onClick: handleAdaptiveClick,
					highlight: adaptiveNodeHighlight,
				},
				draggable: true,
			},
		];

		// Create provider nodes
		allProviders.forEach((provider, index) => {
			const position = getProviderPosition(index);
			const handlePositions = getHandlePositions(position.x, position.y);

			newNodes.push({
				id: provider.name,
				type: "provider",
				position,
				data: {
					providerName: provider.name,
					isCustom: provider.isCustom,
					isConfigured: provider.isConfigured,
					config: provider.config,
					onClick: () => handleProviderClick(provider.name),
					// Store handle IDs for edge connections
					providerHandleId: handlePositions.providerHandle,
					adaptiveHandleId: handlePositions.adaptiveHandle,
				},
				draggable: true,
			});
		});

		// Update next position index
		nextPositionIndex.current = allProviders.length;

		setNodes(newNodes);
	}, [
		allProviders,
		adaptiveConfig,
		adaptiveNodeHighlight,
		handleProviderClick,
		handleAdaptiveClick,
		setNodes,
	]);

	// Generate edges based on enabled providers
	useEffect(() => {
		const newEdges: Edge[] = allProviders
			.filter((provider) => provider.config?.enabled !== false)
			.map((provider) => {
				// Find the node to get handle IDs
				const providerNode = nodes.find((n) => n.id === provider.name);
				const nodeData = providerNode?.data as ProviderNodeData;
				const providerHandleId = nodeData?.providerHandleId || "left";
				const adaptiveHandleId = nodeData?.adaptiveHandleId || "right";

				return {
					id: `adaptive-${provider.name}`,
					source: "adaptive",
					target: provider.name,
					sourceHandle: adaptiveHandleId,
					targetHandle: providerHandleId,
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
		setEdges(newEdges);
	}, [allProviders, nodes, setEdges]);

	// Fit view on initial mount
	useEffect(() => {
		if (!hasInitialFit && nodes.length > 0) {
			setTimeout(() => {
				fitView({
					padding: 0.3,
					includeHiddenNodes: false,
					minZoom: 0.4,
					maxZoom: 1.2,
					duration: 300,
				});
				setHasInitialFit(true);
			}, 100);
		}
	}, [hasInitialFit, nodes.length, fitView]);

	// Handle context menu on canvas background (pane)
	const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		setContextMenuContext({ type: "canvas" });
		setMenuPosition({ x: event.clientX, y: event.clientY });
		setMenuOpen(true);
	}, []);

	// Handle context menu on nodes
	const handleNodeContextMenu = useCallback(
		(event: React.MouseEvent, node: Node) => {
			event.preventDefault();
			if (node.id === "adaptive") {
				setContextMenuContext({ type: "adaptive" });
			} else {
				setContextMenuContext({ type: "provider", providerId: node.id });
			}
			setMenuPosition({ x: event.clientX, y: event.clientY });
			setMenuOpen(true);
		},
		[],
	);

	const currentProvider = visibleSheet
		? allProviders.find((p) => p.name === visibleSheet)
		: null;

	return (
		<div
			id="architecture-canvas"
			className="relative h-screen w-full overflow-hidden rounded-lg border"
		>
			<div className="absolute top-4 right-4 z-10 flex gap-2">
				<ConnectSheet projectId={projectId} />
				<Button
					id="add-provider-button"
					onClick={() => setShowAddDialog(true)}
					variant="default"
					size="sm"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Provider
				</Button>
			</div>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={handleNodesChange}
				onPaneContextMenu={handlePaneContextMenu}
				onNodeContextMenu={handleNodeContextMenu}
				nodeTypes={nodeTypes}
				minZoom={0.2}
				maxZoom={1.5}
				defaultViewport={{ x: 0, y: 0, zoom: 0.8 }} // Higher default zoom for tighter layouts
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

			{/* Fixed Position History Button - Bottom Right */}
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={() => setHistorySheetOpen(true)}
							variant="outline"
							size="icon"
							className="fixed right-6 bottom-6 z-10 h-12 w-12 rounded-full border-2 bg-background shadow-lg transition-all hover:shadow-xl"
						>
							<History className="h-5 w-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="left">
						<p>View Project History</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			{/* Custom Context Menu */}
			<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
				<DropdownMenuContent
					className="min-w-[200px]"
					style={{
						position: "fixed",
						left: `${menuPosition.x}px`,
						top: `${menuPosition.y}px`,
					}}
					onCloseAutoFocus={(e) => e.preventDefault()}
					align="start"
					sideOffset={0}
				>
					{commands.map((command) => (
						<DropdownMenuItem
							key={command.id}
							variant={
								command.id === "delete-provider" ? "destructive" : "default"
							}
							onClick={() => {
								command.handler();
								setMenuOpen(false);
							}}
						>
							{command.label}
							<DropdownMenuShortcut>
								{command.shortcutDisplay}
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			<AddProviderDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				projectId={projectId}
				configuredProviders={providers.map((p) => p.provider_name)}
				onSuccess={() => {
					fitView({
						padding: 0.3,
						duration: 300,
					});
				}}
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
					onHistoryClick={() => setHistorySheetOpen(true)}
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
				onHistoryClick={() => setHistorySheetOpen(true)}
			/>

			{/* Delete Provider Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Provider</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the provider &quot;
							{providerToDelete}&quot;? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setProviderToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (providerToDelete) {
									deleteProvider.mutate({
										projectId,
										provider: providerToDelete,
									});
									setDeleteDialogOpen(false);
									setProviderToDelete(null);
								}
							}}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Audit History Drawer */}
			<AuditLogDrawer
				open={historySheetOpen}
				onOpenChange={setHistorySheetOpen}
				title="Project Configuration History"
				description="View all changes to provider and adaptive configurations"
				historyData={auditHistory}
				isLoading={historyLoading}
				error={historyError?.message}
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
