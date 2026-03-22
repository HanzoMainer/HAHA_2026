import type { NewsItem, ApiResponse, GraphData } from "../types/graph.types";
import { mapApiResponseToGraphData, extractDateRange } from "./graph.mapper";
import type { DateRangeBounds } from "./graph.mapper";
import { mockApiResponse } from "./mock.response";

export type { DateRangeBounds };

const API_URL = import.meta.env.VITE_API_URL ?? "";

export interface QueryResult {
  graphData: GraphData;
  aiResponse: string;
  newsMap: Map<string, NewsItem[]>;
}

export async function fetchGraphByQuery(query: string): Promise<{
  raw: ApiResponse;
  result: QueryResult;
  dateRange: DateRangeBounds | null;
}> {
  let raw: ApiResponse;

  if (API_URL) {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    raw = await response.json();
  } else {
    await new Promise((resolve) => setTimeout(resolve, 800));
    raw = mockApiResponse;
  }

  const result = mapApiResponseToGraphData(raw);
  const dateRange = extractDateRange(raw);

  return { raw, result, dateRange };
}
