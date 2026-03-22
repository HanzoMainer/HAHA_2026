import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  ReactFlowProvider,
} from "@xyflow/react";
import type { NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NodePerson } from "./NodePerson";
import { NodeOrg } from "./NodeOrg";
import { NodeEvent } from "./NodeEvent";
import type { GraphNode, GraphEdge } from "../types/graph.types";
import { GitFork, Network } from "lucide-react";

function MultiLabelEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, style, markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
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
            <svg width={boxWidth} height={boxHeight} style={{ overflow: "visible", display: "block" }}>
              <rect x={0} y={0} width={boxWidth} height={boxHeight} rx={4}
                fill="oklch(0.34 0 0)" stroke="oklch(0.25 0 0)" strokeWidth={1} />
              {lines.map((line, i) => (
                <text key={i} x={boxWidth / 2}
                  y={paddingY + i * lineHeight + lineHeight * 0.75}
                  textAnchor="middle" fill="oklch(0.75 0 0)"
                  fontSize={11} fontFamily="inherit">
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

const COL_GAP = 320;
const ROW_GAP = 120;

function bfsLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  if (!nodes.length) return nodes;

  const inCount = new Map(nodes.map((n) => [n.id, 0]));
  edges.forEach((e) => inCount.set(e.target, (inCount.get(e.target) ?? 0) + 1));

  const level = new Map<string, number>();
  const queue: string[] = [];

  nodes.filter((n) => inCount.get(n.id) === 0).forEach((n) => {
    level.set(n.id, 0); queue.push(n.id);
  });
  if (!queue.length && nodes.length) { level.set(nodes[0].id, 0); queue.push(nodes[0].id); }

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const next = (level.get(id) ?? 0) + 1;
    edges.filter((e) => e.source === id && !level.has(e.target))
      .forEach((e) => { level.set(e.target, next); queue.push(e.target); });
  }

  const maxLevel = Math.max(0, ...level.values());
  nodes.forEach((n) => { if (!level.has(n.id)) level.set(n.id, maxLevel + 1); });

  const cols = new Map<number, string[]>();
  level.forEach((col, id) => { if (!cols.has(col)) cols.set(col, []); cols.get(col)!.push(id); });

  const pos = new Map<string, { x: number; y: number }>();
  cols.forEach((ids, col) => {
    const total = (ids.length - 1) * ROW_GAP;
    ids.forEach((id, row) => pos.set(id, { x: col * COL_GAP, y: row * ROW_GAP - total / 2 }));
  });

  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }));
}

function radialLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  if (!nodes.length) return nodes;

  const degree = new Map(nodes.map((n) => [n.id, 0]));
  edges.forEach((e) => {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  });

  const sorted = [...nodes].sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0));
  const center = sorted[0];
  const rest = sorted.slice(1);

  const centerEdges = new Set(
    edges.filter((e) => e.source === center.id || e.target === center.id)
      .flatMap((e) => [e.source, e.target])
      .filter((id) => id !== center.id)
  );

  const inner = rest.filter((n) => centerEdges.has(n.id));
  const outer = rest.filter((n) => !centerEdges.has(n.id));

  const pos = new Map<string, { x: number; y: number }>();
  pos.set(center.id, { x: 0, y: 0 });

  const place = (group: GraphNode[], radius: number) => {
    group.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
      pos.set(n.id, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    });
  };

  place(inner, inner.length <= 4 ? 280 : 360);
  place(outer, outer.length <= 6 ? 600 : 750);

  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }));
}

const nodeTypes = { person: NodePerson, organization: NodeOrg, event: NodeEvent };
const edgeTypes = { multiLabel: MultiLabelEdge };

type LayoutMode = "bfs" | "radial";

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect?: (node: GraphNode | null) => void;
  selectedNodeId?: string;
  isLoading?: boolean;
}

function GraphCanvasInner({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeSelect,
  selectedNodeId,
}: GraphCanvasProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("radial");
  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const laid = layoutMode === "radial"
      ? radialLayout(initialNodes, initialEdges)
      : bfsLayout(initialNodes, initialEdges);

    setNodes(laid.map((n) => ({ ...n, selected: n.id === selectedNodeId })));
    setTimeout(() => fitView({ padding: 0.1, duration: 400 }), 50);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setNodes((prev) => prev.map((n) => ({ ...n, selected: n.id === selectedNodeId })));
  }, [selectedNodeId, setNodes]);

  useEffect(() => {
    setEdges(initialEdges.map((edge) => ({
      ...edge,
      type: "multiLabel",
      data: { label: typeof edge.label === "string" ? edge.label : "" },
      label: undefined,
      style: { strokeWidth: 2, stroke: edge.animated ? "var(--node-person)" : "var(--border)" },
    })));
  }, [initialEdges, setEdges]);

  const toggleLayout = useCallback(() => {
    const next: LayoutMode = layoutMode === "bfs" ? "radial" : "bfs";
    setLayoutMode(next);

    const laid = next === "radial"
      ? radialLayout(initialNodes, initialEdges)
      : bfsLayout(initialNodes, initialEdges);

    setNodes(laid.map((n) => ({ ...n, selected: n.id === selectedNodeId })));
    setTimeout(() => fitView({ padding: 0.12, duration: 500 }), 50);
  }, [layoutMode, initialNodes, initialEdges, selectedNodeId, setNodes, fitView]);

  const onNodeClick: NodeMouseHandler<GraphNode> = useCallback(
    (_, node) => onNodeSelect?.(node),
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => onNodeSelect?.(null), [onNodeSelect]);

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
        defaultEdgeOptions={{ style: { strokeWidth: 2, stroke: "var(--border)" }, type: "multiLabel" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls
          showInteractive={false}
          className="bg-card! border-border! rounded-lg! [&>button]:bg-card! [&>button]:border-border! [&>button]:text-foreground! [&>button:hover]:bg-secondary!"
        />
        <MiniMap
          className="bg-card! border-border! rounded-lg!"
          nodeColor={(node) => {
            switch (node.type) {
              case "person": return "oklch(0.75 0.15 195)";
              case "organization": return "oklch(0.65 0.18 280)";
              case "event": return "oklch(0.7 0.15 145)";
              default: return "oklch(0.5 0 0)";
            }
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>

      <button
        onClick={toggleLayout}
        title={layoutMode === "bfs" ? "Переключить на Intellect Map" : "Переключить на линейную раскладку"}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-sm"
      >
        {layoutMode === "bfs" ? (
          <><GitFork className="w-3.5 h-3.5 rotate-180" /> Intellect Map</>
        ) : (
          <><Network className="w-3.5 h-3.5" /> Линейная</>
        )}
      </button>
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
