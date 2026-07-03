"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { HistoryEntry } from "@/lib/types"

const STORAGE_KEY = "akkiserver-stats-history"
const MAX_ENTRIES = 50

interface TimeSeriesChartProps {
  currentItems: { id: string; count: number }[]
}

export function TimeSeriesChart({ currentItems }: TimeSeriesChartProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored: HistoryEntry[] = raw ? JSON.parse(raw) : []

    const now = Date.now()
    const last = stored.length > 0 ? stored[stored.length - 1] : null

    if (!last || now - last.timestamp > 60000) {
      const entry: HistoryEntry = {
        timestamp: now,
        date: new Date(now).toLocaleString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: currentItems.map((i) => ({ id: i.id, count: i.count })),
      }
      const updated = [...stored, entry].slice(-MAX_ENTRIES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setHistory(updated)
    } else {
      setHistory(stored)
    }
  }, [currentItems])

  if (history.length < 2) return null

  const topIds = currentItems.slice(0, 5).map((i) => i.id)
  const chartData = history.map((entry) => {
    const point: Record<string, number | string> = { date: entry.date }
    for (const id of topIds) {
      const found = entry.items.find((i) => i.id === id)
      point[id] = found ? found.count : 0
    }
    return point
  })

  const colors = ["#67c23a", "#e6a23c", "#f56c6c", "#409eff", "#b37feb"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Trending (Top 5)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              {topIds.map((id, i) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={colors[i]}
                  strokeWidth={2}
                  dot={false}
                  name={id.split(":")[1]?.replace(/_/g, " ")}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
