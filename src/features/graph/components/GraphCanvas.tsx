import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import type { NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NodePerson } from "./NodePerson";
import { NodeOrg } from "./NodeOrg";
import { NodeEvent } from "./NodeEvent";
import type { GraphNode, GraphEdge } from "../types/graph.types";

const nodeTypes = {
  person: NodePerson,
  organization: NodeOrg,
  event: NodeEvent,
};

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect?: (node: GraphNode | null) => void;
  selectedNodeId?: string;
  isLoading?: boolean;
}

export function GraphCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeSelect,
  selectedNodeId,
  isLoading,
}: GraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<GraphNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<GraphEdge>(initialEdges);

  useEffect(() => {
    setNodes(
      initialNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    );
  }, [initialNodes, initialEdges, setNodes]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    );
  }, [selectedNodeId, setNodes]);

  useEffect(() => {
    setEdges(
      initialEdges.map((edge) => ({
        ...edge,
        type: "smoothstep",
        style: {
          strokeWidth: 2, 
          stroke: edge.animated ? "var(--node-person)" : "var(--border)",
        },
        labelStyle: {
          fill: "oklch(0.75 0 0)",
          fontSize: 11,
          fontFamily: "inherit",
        },
        labelBgStyle: {
          fill: "oklch(0.34 0 0)",
          stroke: "oklch(0.25 0 0)",
          strokeWidth: 1,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      })),
    );
  }, [initialEdges, setEdges]);

  const onNodeClick: NodeMouseHandler<GraphNode> = useCallback(
    (_, node) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Анализирую связи...</p>
          </div>
        </div>
      )}

      <ReactFlow<GraphNode, GraphEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: "var(--border)" },
          type: "smoothstep",
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls className="bg-card! border-border! rounded-lg! [&>button]:bg-card! [&>button]:border-border! [&>button]:text-foreground! [&>button:hover]:bg-secondary!" />
        <MiniMap
          className="bg-card! border-border! rounded-lg!"
          nodeColor={(node) => {
            switch (node.type) {
              case "person":
                return "oklch(0.75 0.15 195)";
              case "organization":
                return "oklch(0.65 0.18 280)";
              case "event":
                return "oklch(0.7 0.15 145)";
              default:
                return "oklch(0.5 0 0)";
            }
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
