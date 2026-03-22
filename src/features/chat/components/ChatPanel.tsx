import { useState } from "react";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { ScrollArea } from "@/shared/components/scroll-area";
import { Badge } from "@/shared/components/badge";
import { Send, Sparkles, MessageSquare, Lightbulb } from "lucide-react";

const exampleQueries = [
  "Какие компании связаны с Илоном Маском в 2024-м году?",
  "Покажи связи между SpaceX и NASA",
  "Найди все события, связанные с Tesla за последний месяц",
  "Кто инвестировал в xAI?",
];

interface ChatPanelProps {
  onQuery: (query: string) => void;
  isLoading: boolean;
  aiResponse: string;
}

export function ChatPanel({ onQuery, isLoading, aiResponse }: ChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onQuery(input.trim());
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    onQuery(query);
  };

  return (
    <div className="w-80 flex flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Запрос к графу
            </h3>
            <p className="text-[10px] text-muted-foreground">
              RAG-powered search
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задайте вопрос о связях между людьми, организациями или событиями..."
            className="min-h-25 bg-secondary border-0 resize-none focus-visible:ring-1 focus-visible:ring-primary text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Анализирую...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Найти связи
              </>
            )}
          </Button>
        </div>
      </div>

      {!aiResponse && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Примеры запросов
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(query)}
                className="text-left text-xs p-2.5 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {aiResponse && (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">
                AI-анализ
              </span>
              <Badge variant="secondary" className="text-[10px]">
                RAG
              </Badge>
            </div>
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
