"use client"

import { useEffect, useState, useCallback } from "react"
import type { StatsData, StatsItem } from "@/lib/types"
import { fetchStats, fetchStaticStats } from "@/lib/api"
import { StatsHeader } from "@/components/stats-header"
import { SearchBar } from "@/components/search-bar"
import { TopItemsChart } from "@/components/top-items-chart"
import { ModDistribution } from "@/components/mod-distribution"
import { TimeSeriesChart } from "@/components/time-series-chart"
import { ItemCard } from "@/components/item-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)

    const fallback = await fetchStaticStats()
    if (fallback) {
      setData(fallback)
      setLastUpdated("(cached)")
      setLoading(false)
    }

    try {
      const result = await fetchStats()
      setData(result)
      setLastUpdated(new Date().toLocaleString("ja-JP"))
      setError(null)
    } catch (e) {
      if (!fallback) {
        setError(e instanceof Error ? e.message : "Failed to load stats")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = data
    ? data.items.filter(
        (item) =>
          item.displayName.toLowerCase().includes(search.toLowerCase()) ||
          item.namespace.toLowerCase().includes(search.toLowerCase()) ||
          item.id.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const maxCount = data ? data.items[0]?.count || 1 : 1

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-3xl text-destructive">
          !
        </div>
        <p className="text-lg font-medium">Failed to load stats</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  const itemsForHistory = data
    ? data.items.map((i) => ({ id: i.id, count: i.count }))
    : []

  const modSummary = data
    ? (() => {
        const map = new Map<string, number>()
        for (const item of data.items) {
          map.set(item.namespace, (map.get(item.namespace) || 0) + item.count)
        }
        return Array.from(map.entries())
          .map(([name, total]) => ({ name, total, items: data.items.filter((i) => i.namespace === name).length }))
          .sort((a, b) => b.total - a.total)
      })()
    : []

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      <StatsHeader
        totalItems={data?.size || 0}
        lastUpdated={lastUpdated}
        onRefresh={load}
        loading={loading}
      />

      <SearchBar value={search} onChange={setSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopItemsChart items={data?.items || []} />
        <ModDistribution items={data?.items || []} />
      </div>

      <TimeSeriesChart currentItems={itemsForHistory} />

      <Tabs defaultValue="grid">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="mods">By Mod</TabsTrigger>
          </TabsList>
          <p className="text-xs text-muted-foreground">
            {filtered.length} / {data?.size || 0} items
          </p>
        </div>

        <TabsContent value="grid" className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} maxCount={maxCount} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No items match your search
            </p>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-3">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-6 text-right font-mono">
                    {i + 1}
                  </span>
                  <ItemCard item={item} maxCount={maxCount} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mods" className="mt-3">
          <div className="space-y-3">
            {modSummary.map((mod) => (
              <div
                key={mod.name}
                className="p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{mod.name}</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {mod.total.toLocaleString()} items / {mod.items} types
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {data?.items
                    .filter((i) => i.namespace === mod.name)
                    .slice(0, 8)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/30"
                      >
                        <span className="text-xs font-mono text-muted-foreground shrink-0">
                          {item.count}
                        </span>
                        <span className="text-xs truncate">{item.displayName}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
