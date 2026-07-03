"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { StatsItem } from "@/lib/types"
import { getNamespaceColor } from "@/lib/utils"

interface ModDistributionProps {
  items: StatsItem[]
}

export function ModDistribution({ items }: ModDistributionProps) {
  const modMap = new Map<string, number>()
  for (const item of items) {
    modMap.set(item.namespace, (modMap.get(item.namespace) || 0) + item.count)
  }

  const data = Array.from(modMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      color: getNamespaceColor(name),
    }))
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Items by Mod</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => {
                  const v = Number(value)
                  return [
                    `${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`,
                    "Count",
                  ]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1">
          {data.slice(0, 6).map((entry) => (
            <div key={entry.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono">
                {((entry.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          {data.length > 6 && (
            <p className="text-xs text-center text-muted-foreground pt-1">
              +{data.length - 6} more mods
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
