import { useState, useCallback } from "react";
import { GraphCanvas } from "@/features/graph/components/GraphCanvas";
import { GraphSidebar } from "@/features/graph/components/GraphSidebar";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { FilterBar } from "@/features/filters/components/FilterBar";
import type { AppliedFilters } from "@/features/filters/components/FilterBar";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { Network, X } from "lucide-react";
import { fetchGraphByQuery } from "@/features/graph/api/graph.api";
import type {
  GraphData,
  GraphNode,
  NewsItem,
} from "@/features/graph/types/graph.types";

const EMPTY_GRAPH: GraphData = { nodes: [], edges: [] };

export function DashboardPage() {
  const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [newsMap, setNewsMap] = useState<Map<string, NewsItem[]>>(new Map());

  const handleQuery = useCallback(async (query: string) => {
    setIsLoading(true);
    setSelectedNode(null);
    setRightPanelOpen(false);

    try {
      const result = await fetchGraphByQuery(query);
      setGraphData(result.graphData);
      setAiResponse(result.aiResponse);
      setNewsMap(result.newsMap);
    } catch (err) {
      console.error("Query failed:", err);
      setAiResponse("Не удалось получить данные. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
    if (node) {
      setRightPanelOpen(true);
    } else {
      setRightPanelOpen(false);
    }
  }, []);

  const handleFiltersApply = useCallback((filters: AppliedFilters) => {
    console.log("Applied filters:", filters);
  }, []);

  const nodeNews: NewsItem[] = selectedNode
    ? (newsMap.get(selectedNode.id) ?? [])
    : [];

  const isEmpty = graphData.nodes.length === 0 && !isLoading;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <header className="h-14 shrink-0 bg-card border-b border-border flex items-center px-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Network className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">HAHA_2026</h1>
            <p className="text-[10px] text-muted-foreground">
              Интеллектуальная платформа агрегации
            </p>
          </div>
        </div>

        <FilterBar onApply={handleFiltersApply} />

        <div className="flex-1" />
      </header>

      <div className="flex-1 flex min-h-0">
        <ChatPanel
          onQuery={handleQuery}
          isLoading={isLoading}
          aiResponse={aiResponse}
        />

        <div className="flex-1 relative" style={{ minHeight: "400px" }}>
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Network className="w-7 h-7 text-primary/50" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Введите запрос в панели слева, чтобы построить граф связей
              </p>
            </div>
          ) : (
            <GraphCanvas
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNode?.id}
              isLoading={isLoading}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Строю граф...</p>
              </div>
            </div>
          )}

          {selectedNode && !rightPanelOpen && (
            <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-4 max-w-sm shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px]">
                  {selectedNode.type === "person"
                    ? "Персона"
                    : selectedNode.type === "organization"
                      ? "Организация"
                      : "Событие"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <h3 className="font-semibold text-foreground">
                {String(selectedNode.data.label)}
              </h3>
              <Button
                className="mt-3 w-full h-8 text-xs"
                variant="secondary"
                onClick={() => setRightPanelOpen(true)}
              >
                Показать новости ({nodeNews.length})
              </Button>
            </div>
          )}
        </div>

        {rightPanelOpen && selectedNode && (
          <GraphSidebar
            node={selectedNode}
            news={nodeNews}
            aiResponse=""
            onClose={() => {
              setRightPanelOpen(false);
              setSelectedNode(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
