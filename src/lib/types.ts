export interface StatsItem {
  id: string;
  namespace: string;
  name: string;
  displayName: string;
  count: number;
}

export interface StatsData {
  items: StatsItem[];
  size: number;
}

export interface HistoryEntry {
  timestamp: number;
  date: string;
  items: { id: string; count: number }[];
}
