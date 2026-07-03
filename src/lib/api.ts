import type { StatsData, StatsItem } from "./types";
import { formatItemName, parseItemId } from "./utils";

const API_URL = "http://126.89.224.17:2943/stats";
const TIMEOUT_MS = 30000;

function parseStats(raw: Record<string, number>, size: number): StatsData {
  const items: StatsItem[] = Object.entries(raw)
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

  return { items, size };
}

export async function fetchStats(): Promise<StatsData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return parseStats(json.items, json.size);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchStaticStats(): Promise<StatsData | null> {
  const paths = ["/akkiserver/stats.json", "/stats.json"];
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        const json = await res.json();
        return parseStats(json.items, json.size);
      }
    } catch {
      /* try next path */
    }
  }
  return null;
}
