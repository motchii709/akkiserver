import type { StatsData, StatsItem } from "./types";
import { formatItemName, parseItemId } from "./utils";

const API_URL = "http://126.89.224.17:2943/stats";

export async function fetchStats(): Promise<StatsData> {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();

  const items: StatsItem[] = Object.entries(json.items as Record<string, number>)
    .map(([id, count]) => {
      const { namespace, name } = parseItemId(id);
      return {
        id,
        namespace,
        name,
        displayName: formatItemName(id),
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  return { items, size: json.size };
}
