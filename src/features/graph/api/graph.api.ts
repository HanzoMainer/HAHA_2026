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

function randomizeDates(response: ApiResponse): ApiResponse {
  const randomDate = (): string => {
    const year = [2024, 2025, 2026][Math.floor(Math.random() * 3)];
    const maxMonth = year === 2026 ? 3 : 12;
    const month = Math.floor(Math.random() * maxMonth) + 1;
    const maxDay = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * maxDay) + 1;

    return (
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` +
      "T00:00:00+00:00"
    );
  };

  return {
    ...response,
    graph: {
      ...response.graph,
      links: response.graph.links.map((link) => ({
        ...link,
        date: randomDate(),
      })),
    },
  };
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
    raw = randomizeDates(mockApiResponse);
  }

  const result = mapApiResponseToGraphData(raw);
  const dateRange = extractDateRange(raw);

  return { raw, result, dateRange };
}
