"use client"

interface StatsHeaderProps {
  totalItems: number
  lastUpdated: string | null
  onRefresh: () => void
  loading: boolean
}

export function StatsHeader({ totalItems, lastUpdated, onRefresh, loading }: StatsHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Akkiserver Stats</h1>
            <p className="text-sm text-muted-foreground">
              {totalItems.toLocaleString()} items tracked
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <span className={`${loading ? "animate-spin" : ""}`}>⟳</span>
          Refresh
        </button>
      </div>
      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  )
}
