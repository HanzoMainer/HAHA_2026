import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { User } from "lucide-react";
import type { EntityData } from "../types/graph.types";

const hiddenHandle: React.CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
  width: 8,
  height: 8,
};

export function NodePerson({ data, selected }: NodeProps<Node<EntityData>>) {
  return (
    <div
      className={`
        relative flex items-center gap-3 rounded-full bg-card border-2 px-4 py-2
        transition-all duration-300 cursor-pointer
        ${
          selected
            ? "border-(--node-person) shadow-[0_0_20px_var(--glow)]"
            : "border-border hover:border-(--node-person)/50"
        }
      `}
    >
      <Handle type="target" position={Position.Left} style={hiddenHandle} />
      <div className="w-8 h-8 rounded-full bg-(--node-person)/20 flex items-center justify-center">
        <User className="w-4 h-4 text-(--node-person)" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {String(data.label)}
        </span>
        {data.role && (
          <span className="text-xs text-muted-foreground">{data.role}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={hiddenHandle} />
    </div>
  );
}
