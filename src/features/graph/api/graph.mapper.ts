import type {
  ApiResponse,
  ApiNodeType,
  ApiLink,
  EntityType,
  GraphData,
  NewsItem,
} from "../types/graph.types";

function toEntityType(apiType: ApiNodeType): EntityType {
  switch (apiType.toUpperCase()) {
    case "PERSON":
      return "person";
    case "COMPANY":
    case "INSTITUTION":
    case "LOCATION":
      return "organization";
    default:
      return "organization";
  }
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function buildNewsMap(links: ApiLink[]): Map<string, NewsItem[]> {
  const map = new Map<string, NewsItem[]>();

  const add = (nodeId: string, link: ApiLink) => {
    const items = map.get(nodeId) ?? [];

    if (items.some((n) => n.title === link.title)) return;

    items.push({
      id: `${nodeId}-${link.title}-${link.date}`,
      title: link.title,
      source: "",
      time: formatDate(link.date),
      cluster: link.label,
      summary: link.desc,
      url: undefined,
    });

    map.set(nodeId, items);
  };

  links.forEach((link) => {
    add(link.source, link);
    add(link.target, link);
  });

  return map;
}

export function mapApiResponseToGraphData(response: ApiResponse): {
  graphData: GraphData;
  aiResponse: string;
  newsMap: Map<string, NewsItem[]>;
} {
  const { answer, graph } = response;
  const newsMap = buildNewsMap(graph.links);

  const nodes = graph.nodes.map((apiNode) => ({
    id: apiNode.id,
    type: toEntityType(apiNode.type),
    position: { x: 0, y: 0 },
    data: {
      label: apiNode.label,
      description: newsMap.get(apiNode.id)?.[0]?.summary,
    },
  }));

  const seen = new Set<string>();
  const edges = graph.links
    .filter((link) => {
      const key = `${link.source}|${link.target}|${link.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((link, i) => ({
      id: `e-${i}-${link.source}-${link.target}`,
      source: link.source,
      target: link.target,
      label: link.label.replace(/_/g, " ").toLowerCase(),
      animated: false,
    }));

  return {
    graphData: { nodes, edges },
    aiResponse: answer,
    newsMap,
  };
}
