import type {
  ApiResponse,
  ApiNodeType,
  ApiLink,
  EntityType,
  GraphData,
  NewsItem,
} from "../types/graph.types";

export interface DateFilter {
  from: string | null;
  to: string | null;
}

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

function filterLinksByDate(links: ApiLink[], filter: DateFilter): ApiLink[] {
  const from = filter.from ? new Date(filter.from).getTime() : null;
  const to = filter.to ? new Date(filter.to + "T23:59:59Z").getTime() : null;

  return links.filter((link) => {
    const linkTime = new Date(link.date).getTime();
    if (from !== null && linkTime < from) return false;
    if (to !== null && linkTime > to) return false;
    return true;
  });
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

const COL_GAP = 320;
const ROW_GAP = 120;

function computePositions(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): Map<string, { x: number; y: number }> {
  const inCount = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  edges.forEach((e) => inCount.set(e.target, (inCount.get(e.target) ?? 0) + 1));

  const level = new Map<string, number>();
  const queue: string[] = [];

  nodeIds
    .filter((id) => inCount.get(id) === 0)
    .forEach((id) => {
      level.set(id, 0);
      queue.push(id);
    });

  if (!queue.length && nodeIds.length) {
    level.set(nodeIds[0], 0);
    queue.push(nodeIds[0]);
  }

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const nextLevel = (level.get(id) ?? 0) + 1;
    edges
      .filter((e) => e.source === id && !level.has(e.target))
      .forEach((e) => {
        level.set(e.target, nextLevel);
        queue.push(e.target);
      });
  }

  const maxLevel = Math.max(0, ...level.values());
  nodeIds.forEach((id) => {
    if (!level.has(id)) level.set(id, maxLevel + 1);
  });

  const columns = new Map<number, string[]>();
  level.forEach((col, id) => {
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(id);
  });

  const pos = new Map<string, { x: number; y: number }>();
  columns.forEach((ids, col) => {
    const total = (ids.length - 1) * ROW_GAP;
    ids.forEach((id, row) => {
      pos.set(id, { x: col * COL_GAP, y: row * ROW_GAP - total / 2 });
    });
  });

  return pos;
}

export function mapApiResponseToGraphData(
  response: ApiResponse,
  dateFilter?: DateFilter,
): {
  graphData: GraphData;
  aiResponse: string;
  newsMap: Map<string, NewsItem[]>;
} {
  const { answer, graph } = response;

  const activeLinks = dateFilter
    ? filterLinksByDate(graph.links, dateFilter)
    : graph.links;

  const mentionedIds = new Set<string>();
  activeLinks.forEach((l) => {
    mentionedIds.add(l.source);
    mentionedIds.add(l.target);
  });

  const activeNodes = dateFilter
    ? graph.nodes.filter((n) => mentionedIds.has(n.id))
    : graph.nodes;

  const newsMap = buildNewsMap(activeLinks);

  const edgeGroups = new Map<
    string,
    { source: string; target: string; labels: string[] }
  >();

  activeLinks.forEach((link) => {
    const key = `${link.source}→${link.target}`;
    const label = link.label.replace(/_/g, " ").toLowerCase();
    if (!edgeGroups.has(key)) {
      edgeGroups.set(key, {
        source: link.source,
        target: link.target,
        labels: [],
      });
    }
    const group = edgeGroups.get(key)!;
    if (!group.labels.includes(label)) group.labels.push(label);
  });

  const rawEdges = Array.from(edgeGroups.values()).map((g, i) => ({
    id: `e-${i}-${g.source}-${g.target}`,
    source: g.source,
    target: g.target,
    label: g.labels.join("\n"),
    animated: false,
  }));

  const positions = computePositions(
    activeNodes.map((n) => n.id),
    rawEdges,
  );

  const nodes = activeNodes.map((apiNode) => ({
    id: apiNode.id,
    type: toEntityType(apiNode.type),
    position: positions.get(apiNode.id) ?? { x: 0, y: 0 },
    data: {
      label: apiNode.label,
      description: newsMap.get(apiNode.id)?.[0]?.summary,
    },
  }));

  return {
    graphData: { nodes, edges: rawEdges },
    aiResponse: answer,
    newsMap,
  };
}
