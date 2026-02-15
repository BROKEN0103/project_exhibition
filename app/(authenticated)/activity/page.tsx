"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  Eye,
  Download,
  Upload,
  Trash2,
  Shield,
  Search,
  XCircle,
  CheckCircle2,
  TrendingUp,
  PieChart as PieIcon
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"

type ActionFilter = "all" | "view" | "download" | "upload" | "delete"

const actionIcons: Record<string, any> = {
  view: Eye,
  download: Download,
  upload: Upload,
  delete: Trash2,
  role_change: Shield,
  login: CheckCircle2,
  failed_login: XCircle
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export default function ActivityPage() {
  const user = useAppStore((s) => s.user)
  const accessLogs = useAppStore((s) => s.accessLogs) || []
  const setAccessLogs = useAppStore((s) => s.setAccessLogs)

  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("http://localhost:5000/api/activities", {
          headers: { "Authorization": `Bearer ${user.token}` }
        })
        if (!res.ok) throw new Error("Failed to fetch")

        const data = await res.json()
        if (Array.isArray(data)) {
          setAccessLogs(data.map((l: any) => ({
            id: l._id,
            userId: l.user, // careful with ID vs Object
            userName: l.userName || 'System',
            documentId: l.document,
            documentTitle: l.documentTitle || 'System Event',
            action: l.action,
            timestamp: l.createdAt, // ensure createdAt exists
            ip: l.ipAddress,
            granted: l.granted !== undefined ? l.granted : true
          })))
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [user, setAccessLogs])

  const isAdmin = user?.role === "admin"

  const filtered = useMemo(() => {
    let logs = Array.isArray(accessLogs) ? accessLogs : []
    console.log(`[ActivityPage] Processing ${logs.length} logs. isAdmin: ${isAdmin}, userId: ${user?.id}`);

    if (!isAdmin) {
      logs = logs.filter((l) => {
        const match = String(l.userId) === String(user?.id);
        if (!match) console.log(`[ActivityPage] Filtered out log for userId: ${l.userId}`);
        return match;
      })
    }

    const finalLogs = logs.filter((log) => {
      const matchesSearch =
        (log.documentTitle?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (log.userName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (log.ip || "").includes(search)
      const actionStr = String(log.action || "").toLowerCase();
      const matchesAction = actionFilter === "all" || actionStr === actionFilter.toLowerCase();
      return matchesSearch && matchesAction
    })

    console.log(`[ActivityPage] Final filtered logs: ${finalLogs.length}`);
    return finalLogs;
  }, [accessLogs, search, actionFilter, isAdmin, user])



  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return "Invalid Date"
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 pt-8 md:px-8 pb-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground/90">
            <Activity className="h-6 w-6 text-primary" />
            Activity Log & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Full system audit trail and usage analytics" : "Your activity history"}
          </p>
        </motion.div>



        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-border/50"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="w-full rounded-lg border border-border/50 bg-white/5 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              aria-label="Search activity logs"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/30 p-0.5 bg-background/50">
            {(["all", "view", "download", "upload", "delete"] as ActionFilter[]).map((action) => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                className={`rounded-md px-3 py-1.5 text-xs capitalize transition-all ${actionFilter === action
                  ? "bg-primary/20 text-primary font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                {action}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Log Entries */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-24"
        >
          <GlassPanel className="overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center py-16 animate-pulse">
                <div className="h-8 w-8 bg-primary/20 rounded-full mb-3" />
                <p className="text-sm text-muted-foreground">Loading activity logs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <Shield className="mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No activity found matching your criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {filtered.map((log) => {
                  const Icon = actionIcons[log.action] || Eye
                  return (
                    <motion.div
                      key={log.id}
                      variants={itemVariants}
                      className="group flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 ${log.granted ? "bg-primary/10" : "bg-destructive/10"
                          }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${log.granted ? "text-primary" : "text-destructive"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-foreground">{log.userName}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{log.action}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {log.action === 'upload' ? 'Uploaded' : log.action === 'view' ? 'Viewed' : log.action} <span className="text-foreground/80 font-medium">"{log.documentTitle}"</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDate(log.timestamp)}
                        </span>
                        {log.granted ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Granted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-destructive">
                            <XCircle className="h-3 w-3" />
                            <span>Denied</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  )
}
