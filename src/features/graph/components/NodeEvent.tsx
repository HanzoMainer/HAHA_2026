import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Calendar } from "lucide-react";
import type { EntityData } from "../types/graph.types";

const hiddenHandle: React.CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
  width: 8,
  height: 8,
};

export function NodeEvent({ data, selected }: NodeProps<Node<EntityData>>) {
  return (
    <div
      className={`
        relative flex items-center gap-3 rounded-lg bg-card border-2 px-4 py-3
        transition-all duration-300 cursor-pointer
        ${
          selected
            ? "border-(--node-event) shadow-[0_0_20px_oklch(0.7_0.15_145/0.4)]"
            : "border-border hover:border-(--node-event)/50"
        }
      `}
    >
      <Handle type="target" position={Position.Left} style={hiddenHandle} />
      <div className="w-8 h-8 rounded flex items-center justify-center bg-(--node-event)/20">
        <Calendar className="w-4 h-4 text-(--node-event)" />
      </div>
      <div className="flex flex-col pr-2">
        <span className="text-sm font-medium text-foreground">
          {String(data.label)}
        </span>
        {data.date && (
          <span className="text-xs text-muted-foreground">{data.date}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={hiddenHandle} />
    </div>
  );
}
