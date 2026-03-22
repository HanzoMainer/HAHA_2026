import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NodePerson } from "./NodePerson";
import { NodeOrg } from "./NodeOrg";
import { NodeEvent } from "./NodeEvent";
import type { GraphNode, GraphEdge } from "../types/graph.types";

function MultiLabelEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = (data as { label?: string } | undefined)?.label ?? "";
  const lines = label.split("\n").filter(Boolean);
  const lineHeight = 16;
  const paddingX = 8;
  const paddingY = 5;
  const boxWidth = Math.max(...lines.map((l) => l.length)) * 6.5 + paddingX * 2;
  const boxHeight = lines.length * lineHeight + paddingY * 2;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

      {lines.length > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <svg
              width={boxWidth}
              height={boxHeight}
              style={{ overflow: "visible", display: "block" }}
            >
              <rect
                x={0}
                y={0}
                width={boxWidth}
                height={boxHeight}
                rx={4}
                fill="oklch(0.34 0 0)"
                stroke="oklch(0.25 0 0)"
                strokeWidth={1}
              />
              {lines.map((line, i) => (
                <text
                  key={i}
                  x={boxWidth / 2}
                  y={paddingY + i * lineHeight + lineHeight * 0.75}
                  textAnchor="middle"
                  fill="oklch(0.75 0 0)"
                  fontSize={11}
                  fontFamily="inherit"
                >
                  {line}
                </text>
              ))}
            </svg>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = {
  person: NodePerson,
  organization: NodeOrg,
  event: NodeEvent,
};

const edgeTypes = {
  multiLabel: MultiLabelEdge,
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
  }, [initialNodes, setNodes]);

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
        type: "multiLabel",
        data: { label: typeof edge.label === "string" ? edge.label : "" },
        label: undefined,
        style: {
          strokeWidth: 2,
          stroke: edge.animated ? "var(--node-person)" : "var(--border)",
        },
      })),
    );
  }, [initialEdges, setEdges]);

  const onNodeClick: NodeMouseHandler<GraphNode> = useCallback(
    (_, node) => onNodeSelect?.(node),
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="relative">
      <ReactFlow<GraphNode, GraphEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: "var(--border)" },
          type: "multiLabel",
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-card! border-border! rounded-lg! [&>button]:bg-card! [&>button]:border-border! [&>button]:text-foreground! [&>button:hover]:bg-secondary!" />
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
