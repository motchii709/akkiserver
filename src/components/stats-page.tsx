"use client"

import * as React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { fetchStats, fetchStaticStats } from "@/lib/api"
import type { StatsData, StatsItem } from "@/lib/types"
import { getNamespaceColor, formatItemName } from "@/lib/utils"

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts"

// Icons (Sleek custom inline SVG icons to keep it fast and dependency-free)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
)

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
)

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>
)

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
)

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
)

const LayoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
)

// Minimal clean item initials icon component
function ItemIcon({ namespace, name }: { namespace: string; name: string }) {
  const color = getNamespaceColor(namespace)
  const initials = name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")

  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none tracking-tighter"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}20`,
        color,
      }}
    >
      {initials}
    </div>
  )
}

export function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedMod, setSelectedMod] = useState<string>("all")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"live" | "cached" | "fetching">("fetching")
  const [viewTab, setViewTab] = useState<"grid" | "table" | "mods">("grid")

  const load = useCallback(async () => {
    setApiStatus("fetching")
    setError(null)

    // Always refresh from static cache, then try live API
    const fallback = await fetchStaticStats()
    if (fallback) {
      setData(fallback)
      setLastUpdated("Cached Snapshot")
      setApiStatus("cached")
      setLoading(false)
    }

    try {
      const result = await fetchStats()
      setData(result)
      setLastUpdated(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setApiStatus("live")
      setError(null)
    } catch (e) {
      if (!fallback) {
        setError(e instanceof Error ? e.message : "Failed to load statistics")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [])

  // Process data for charts & explorer
  const allItems = data?.items || []
  const maxCount = allItems[0]?.count || 1

  const modsList = useMemo(() => {
    const list = new Set<string>()
    allItems.forEach((i) => list.add(i.namespace))
    return Array.from(list).sort()
  }, [allItems])

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.displayName.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
      const matchesMod = selectedMod === "all" || item.namespace === selectedMod
      return matchesSearch && matchesMod
    })
  }, [allItems, search, selectedMod])

  const totalQuantity = useMemo(() => {
    return allItems.reduce((sum, item) => sum + item.count, 0)
  }, [allItems])

  // Mod Breakdown Chart Data
  const modChartData = useMemo(() => {
    const map = new Map<string, number>()
    allItems.forEach((item) => {
      map.set(item.namespace, (map.get(item.namespace) || 0) + item.count)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: getNamespaceColor(name),
      }))
      .sort((a, b) => b.value - a.value)
  }, [allItems])

  // Top Items Chart Data
  const topItemsChartData = useMemo(() => {
    return allItems.slice(0, 10).map((item) => ({
      name: item.displayName,
      count: item.count,
      color: getNamespaceColor(item.namespace),
    }))
  }, [allItems])

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 select-none">
      {/* Top sticky-like modern Navbar header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center border border-border">
              <span className="font-mono font-bold text-sm">📦</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
            <Badge
              variant="outline"
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-border/60 ${
                apiStatus === "live"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : apiStatus === "fetching"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                  : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                apiStatus === "live" ? "bg-emerald-500" : apiStatus === "fetching" ? "bg-amber-500" : "bg-zinc-500"
              }`} />
              {apiStatus === "live" ? "Live Connected" : apiStatus === "fetching" ? "Syncing..." : "Offline (Cached)"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Minecraft Server Stock & Storage Overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sync Clock</p>
            <p className="text-sm font-mono font-medium text-foreground">{lastUpdated || "N/A"}</p>
          </div>
          <button
            onClick={load}
            disabled={apiStatus === "fetching"}
            className="h-9 inline-flex items-center gap-2 px-4 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshIcon className={apiStatus === "fetching" ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      </div>

      {/* Metrics Cards Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-none border-border/40 bg-zinc-900/10 hover:bg-zinc-900/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Storage Stock
            </CardTitle>
            <BoxIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight font-mono">
              {totalQuantity.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Sum of all chest items count
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/40 bg-zinc-900/10 hover:bg-zinc-900/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Unique Item Types
            </CardTitle>
            <DatabaseIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight font-mono">
              {allItems.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Different item models registered
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/40 bg-zinc-900/10 hover:bg-zinc-900/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Server Mods
            </CardTitle>
            <span className="text-xs">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight font-mono">
              {modsList.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Registered mods namespaces
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/40 bg-zinc-900/10 hover:bg-zinc-900/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dominant Mod Share
            </CardTitle>
            <span className="text-xs">👑</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold tracking-tight truncate uppercase">
              {modChartData[0]?.name || "N/A"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              {modChartData[0]
                ? `${((modChartData[0].value / totalQuantity) * 100).toFixed(1)}% of total stocks`
                : "No data available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Items Chart */}
        <Card className="lg:col-span-2 border-border/40 shadow-none bg-zinc-900/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
              Top 10 Storage Items
            </CardTitle>
            <CardDescription className="text-xs">
              Item distribution ranked by quantity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topItemsChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      background: "rgba(10, 10, 10, 0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                    formatter={(value) => [Number(value).toLocaleString(), "Quantity"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
                    {topItemsChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.65} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mod Distribution Pie */}
        <Card className="border-border/40 shadow-none bg-zinc-900/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
              Share by Mod
            </CardTitle>
            <CardDescription className="text-xs">
              Item volume share grouped by mod namespaces
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[270px]">
            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {modChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.7} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 10, 10, 0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} (${((Number(value) / totalQuantity) * 100).toFixed(1)}%)`,
                      "Volume",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total</span>
                <span className="text-base font-mono font-bold text-foreground">
                  {allItems.length}
                </span>
              </div>
            </div>

            <div className="max-h-20 overflow-y-auto border-t border-border/20 pt-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pb-2">
                {modChartData.slice(0, 6).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground truncate font-medium">{entry.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-foreground/80 pl-1">
                      {((entry.value / totalQuantity) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explorer section - Search, filter, tabs and items */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground/90">
            Explorer
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Minimal search box */}
            <div className="relative h-9 w-full md:w-60">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <Input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 h-9 text-xs bg-zinc-950/20 border-border/60 rounded-lg placeholder:text-muted-foreground/60 w-full"
              />
            </div>

            {/* Simple Select buttons for namespaces */}
            <div className="flex items-center gap-1.5 h-9 bg-zinc-900/10 border border-border/40 rounded-lg p-1">
              <button
                onClick={() => setSelectedMod("all")}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
                  selectedMod === "all"
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {modsList.slice(0, 4).map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedMod(mod)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
                    selectedMod === mod
                      ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>
        </div>

{/* Simple state tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex gap-6">
              {(["grid", "table", "mods"] as const).map((tab) => {
                const active = viewTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setViewTab(tab)}
                    className={`px-0 py-1.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      active
                        ? "text-zinc-100 border-zinc-100"
                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                    }`}
                  >
                    {tab === "grid" && <><GridIcon /> Grid</>}
                    {tab === "table" && <><ListIcon /> Table</>}
                    {tab === "mods" && <><LayoutIcon /> Mod</>}
                  </button>
                )
              })}
            </div>
            <span className="text-[11px] font-mono font-semibold text-zinc-500">
              {filteredItems.length} / {allItems.length} types
            </span>
          </div>

          {viewTab === "grid" && (
            filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map((item) => {
                  const pct = Math.round((item.count / maxCount) * 100)
                  const color = getNamespaceColor(item.namespace)
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <ItemIcon namespace={item.namespace} name={item.name} />
                        <span className="font-mono text-sm font-bold text-zinc-100">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <span className="block text-sm font-semibold text-zinc-200 truncate">
                          {item.displayName}
                        </span>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span style={{ color }}>{item.namespace}</span>
                          <span className="text-zinc-500 font-mono">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1 bg-zinc-800" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-500">No items match your search</p>
              </div>
            )
          )}

          {viewTab === "table" && (
            filteredItems.length > 0 ? (
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/30 text-zinc-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 w-10 text-center">#</th>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4 w-28">Mod</th>
                      <th className="py-3 px-4 w-24 text-right">Count</th>
                      <th className="py-3 px-4 w-36">Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredItems.map((item, i) => {
                      const pct = Math.round((item.count / maxCount) * 100)
                      return (
                        <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3 px-4 text-center text-zinc-500 font-mono text-[10px]">{i + 1}</td>
                          <td className="py-3 px-4 font-medium">{item.displayName}</td>
                          <td className="py-3 px-4 text-zinc-400 uppercase tracking-wider text-[10px]">{item.namespace}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold">{item.count.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="flex-1 h-1" />
                              <span className="font-mono text-[10px] text-zinc-500 w-8 text-right">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-500">No items match your search</p>
              </div>
            )
          )}

          {viewTab === "mods" && (
            <div className="space-y-4">
              {modChartData.map((mod) => {
                const modItems = allItems.filter((i) => i.namespace === mod.name)
                return (
                  <div key={mod.name} className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/10">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mod.color }} />
                        <span className="font-bold text-sm uppercase tracking-wider">{mod.name}</span>
                        <span className="text-xs text-zinc-500">({modItems.length})</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{mod.value.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {modItems.slice(0, 12).map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/30 text-xs">
                          <span className="truncate mr-2">{item.displayName}</span>
                          <span className="font-mono font-bold shrink-0">{item.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
