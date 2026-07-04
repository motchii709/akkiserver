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
    <div className="group flex flex-col p-4 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <ItemIcon namespace={item.namespace} name={item.name} size="md" />
        <Badge
          variant="outline"
          className="text-[10px] font-bold px-2 py-0.5"
          style={{
            borderColor: `${modColor}40`,
            backgroundColor: `${modColor}10`,
            color: modColor,
          }}
        >
          {item.namespace}
        </Badge>
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-sm leading-tight group-hover:text-emerald-400 transition-colors">
          {item.displayName}
        </h3>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-muted-foreground font-medium">Quantity</span>
          <span className="font-mono font-bold text-lg tabular-nums">
            {item.count.toLocaleString()}
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>
    </div>
  )
}
