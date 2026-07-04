"use client"

interface StatsHeaderProps {
  totalItems: number
  lastUpdated: string | null
  onRefresh: () => void
  loading: boolean
}

export function StatsHeader({ totalItems, lastUpdated, onRefresh, loading }: StatsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl font-bold">
            ⚡
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter">Akkiserver</h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Item Statistics
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
        >
          <span className={`${loading ? "animate-spin" : ""}`}>⟳</span>
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Items</p>
          <p className="text-2xl font-mono font-bold">{totalItems.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Last Updated</p>
          <p className="text-sm font-medium pt-1">{lastUpdated || "Initializing..."}</p>
        </div>
      </div>
    </div>
  )
}
