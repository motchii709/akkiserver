"use client"

import type { StatsItem } from "@/lib/types"
import { ItemIcon } from "@/components/item-icon"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getNamespaceColor } from "@/lib/utils"

interface ItemCardProps {
  item: StatsItem
  maxCount: number
}

export function ItemCard({ item, maxCount }: ItemCardProps) {
  const pct = Math.round((item.count / maxCount) * 100)
  const modColor = getNamespaceColor(item.namespace)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
      <ItemIcon namespace={item.namespace} name={item.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.displayName}</span>
          <Badge
            variant="outline"
            className="shrink-0 text-[10px] px-1.5 py-0 h-5"
            style={{
              borderColor: `${modColor}40`,
              color: modColor,
            }}
          >
            {item.namespace}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-sm font-mono tabular-nums text-muted-foreground shrink-0">
            {item.count.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
