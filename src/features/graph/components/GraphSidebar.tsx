import { useState } from "react";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { ScrollArea } from "@/shared/components/scroll-area";
import {
  X,
  User,
  Building2,
  Calendar,
  Clock,
  Newspaper,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { GraphNode, NewsItem } from "../types/graph.types";

interface GraphSidebarProps {
  node: GraphNode | null;
  news: NewsItem[];
  aiResponse?: string;
  onClose: () => void;
}

function getIcon(type?: string) {
  switch (type) {
    case "person":
      return <User className="w-5 h-5 text-(--node-person)" />;
    case "organization":
      return <Building2 className="w-5 h-5 text-(--node-org)" />;
    case "event":
      return <Calendar className="w-5 h-5 text-(--node-event)" />;
    default:
      return <Sparkles className="w-5 h-5 text-primary" />;
  }
}

function getTypeLabel(type?: string) {
  switch (type) {
    case "person": return "Персона";
    case "organization": return "Организация";
    case "event": return "Событие";
    default: return "Результат";
  }
}

function getTypeColor(type?: string) {
  switch (type) {
    case "person": return "border-[var(--node-person)] text-[var(--node-person)]";
    case "organization": return "border-[var(--node-org)] text-[var(--node-org)]";
    case "event": return "border-[var(--node-event)] text-[var(--node-event)]";
    default: return "border-primary text-primary";
  }
}

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="rounded-lg bg-secondary/50 hover:bg-secondary transition-colors overflow-hidden"
    >
      <button
        className="w-full text-left p-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
            {item.cluster}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.time}
          </span>
          <span className="ml-auto shrink-0 text-muted-foreground">
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />
            }
          </span>
        </div>

        <h4 className="text-sm font-medium text-foreground leading-snug text-left">
          {item.title}
        </h4>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {item.fullText ?? item.summary}
          </p>
          {item.source && (
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              {item.source}
            </p>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* <ExternalLink className="w-3 h-3" /> */}
              Открыть источник
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function GraphSidebar({ node, news, aiResponse, onClose }: GraphSidebarProps) {
  return (
    <div className="w-96 h-full min-h-0 flex flex-col border-l border-border bg-card">

      <div className="shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={`text-[10px] ${getTypeColor(node?.type)}`}>
            {getTypeLabel(node?.type)}
          </Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {node ? (
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                node.type === "person"
                  ? "bg-(--node-person)/20"
                  : node.type === "organization"
                    ? "bg-(--node-org)/20"
                    : "bg-(--node-event)/20"
              }`}
            >
              {getIcon(node.type)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground break-words">
                {String(node.data.label)}
              </h2>
              {node.data.role && (
                <p className="text-sm text-muted-foreground">{node.data.role}</p>
              )}
              {node.data.type && (
                <p className="text-sm text-muted-foreground">{node.data.type}</p>
              )}
              {node.data.date && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {node.data.date}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Результат анализа</h2>
              <p className="text-sm text-muted-foreground">Выберите узел на графе</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {!node && aiResponse && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Анализ связей</span>
            </div>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-secondary/50 rounded-lg p-4">
              {aiResponse}
            </div>
          </div>
        )}

        {node?.data.description && (
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {node.data.description}
            </p>
          </div>
        )}

        {news.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Связанные новости</span>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {news.length}
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {node && news.length === 0 && (
          <div className="p-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Newspaper className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Нет связанных новостей</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
