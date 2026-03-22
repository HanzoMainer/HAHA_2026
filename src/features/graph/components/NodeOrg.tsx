import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Building2 } from "lucide-react";
import type { EntityData } from "../types/graph.types";

const hiddenHandle: React.CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
  width: 8,
  height: 8,
};

export function NodeOrg({ data, selected }: NodeProps<Node<EntityData>>) {
  return (
    <div
      className={`
        relative flex items-center gap-3 rounded-lg bg-card border-2 px-4 py-3
        transition-all duration-300 cursor-pointer
        ${
          selected
            ? "border-(--node-org) shadow-[0_0_20px_oklch(0.65_0.18_280/0.4)]"
            : "border-border hover:border-(--node-org)/50"
        }
      `}
    >
      <Handle type="target" position={Position.Left} style={hiddenHandle} />
      <div className="w-10 h-10 rounded-lg bg-(--node-org)/20 flex items-center justify-center">
        <Building2 className="w-5 h-5 text-(--node-org)" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {String(data.label)}
        </span>
        {data.type && (
          <span className="text-xs text-muted-foreground">{data.type}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={hiddenHandle} />
    </div>
  );
}
