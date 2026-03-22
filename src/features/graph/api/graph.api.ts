import type { NewsItem, ApiResponse } from "../types/graph.types";
import { mapApiResponseToGraphData } from "./graph.mapper";
import { mockApiResponse } from "./mock.response";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export interface QueryResult {
  graphData: import("../types/graph.types").GraphData;
  aiResponse: string;
  newsMap: Map<string, NewsItem[]>;
}

export async function fetchGraphByQuery(query: string): Promise<QueryResult> {
  if (API_URL) {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return mapApiResponseToGraphData(data);
  }

  await new Promise((resolve) => setTimeout(resolve, 800));
  return mapApiResponseToGraphData(mockApiResponse);
}
