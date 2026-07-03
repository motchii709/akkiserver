"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { StatsItem } from "@/lib/types"
import { getNamespaceColor } from "@/lib/utils"

interface TopItemsChartProps {
  items: StatsItem[]
}

export function TopItemsChart({ items }: TopItemsChartProps) {
  const top = items.slice(0, 15)
  const data = top.map((item) => ({
    name: item.displayName,
    count: item.count,
    color: getNamespaceColor(item.namespace),
    id: item.id,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Count"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
