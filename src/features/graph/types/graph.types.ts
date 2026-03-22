import type { Node, Edge } from "@xyflow/react";

export type EntityType = "person" | "organization" | "event";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  cluster: string;
  summary: string;
  fullText?: string;
  url?: string;
}

export type EntityData = Record<string, unknown> & {
  label: string;
  role?: string;
  type?: string;
  date?: string;
  description?: string;
  news?: NewsItem[];
};

export type GraphNode = Node<EntityData, EntityType>;
export type GraphEdge = Edge;

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type ApiNodeType =
  | "PERSON"
  | "COMPANY"
  | "LOCATION"
  | "INSTITUTION"
  | string;

export interface ApiNode {
  id: string;
  label: string;
  type: ApiNodeType;
}

export interface ApiLink {
  source: string;
  target: string;
  label: string;
  desc: string;
  title: string;
  full_text: string;
  date: string;
}

export interface ApiResponse {
  answer: string;
  graph: {
    nodes: ApiNode[];
    links: ApiLink[];
  };
}
