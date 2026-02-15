"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FileText, Video, ImageIcon, Clock, Shield, HardDrive, Upload, TrendingUp, Activity, Zap, Eye, Download, AlertCircle } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"
import { getStorageStats } from "@/lib/seed-data"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

function getTimeAgo(date: string | Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function DashboardPage() {
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  const accessLogs = useAppStore((s) => s.accessLogs)

  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Dynamic Stats
  const stats = useMemo(() => {
    const docCount = documents.filter(d => d.type === 'document').length
    const videoCount = documents.filter(d => d.type === 'video').length
    const imageCount = documents.filter(d => d.type === 'image').length
    const usedStorage = documents.reduce((sum, d) => sum + d.size, 0)
    const totalStorage = 2_000_000_000

    return {
      docCount,
      videoCount,
      imageCount,
      usedStorage,
      totalStorage,
      usagePercent: (usedStorage / totalStorage) * 100
    }
  }, [documents])



  const recentLogs = accessLogs.slice(0, 6)
  const recentDocs = documents.slice(0, 4)

  const quickActions = [
    { label: "Upload Content", href: "/upload", icon: Upload, color: "primary", description: "Add new files" },
    { label: "Library", href: "/library", icon: FileText, color: "blue", description: "Browse vault" },
    { label: "Activity", href: "/activity", icon: Activity, color: "emerald", description: "View logs" },
    { label: "Access Control", href: "/access-control", icon: Shield, color: "amber", description: "Manage permissions" },
  ]

  if (!mounted) return null

  return (
    <div className="h-full overflow-y-auto px-4 pt-8 md:px-8 pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl"
      >
        {/* Header with Live Time */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground/90">
                Welcome back, {user?.name}
              </h1>
              <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {user?.role === "admin" ? "Full system access" : `${user?.role} access level`}
                </span>
                <span className="text-border">•</span>
                <span className="font-mono">{currentTime?.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 px-4 py-2 hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Status</p>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
                <Zap className="h-3.5 w-3.5" />
                Operational
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Documents", value: stats.docCount, icon: FileText, color: "blue", trend: "+2%" },
            { label: "Videos", value: stats.videoCount, icon: Video, color: "purple", trend: "+0%" },
            { label: "Images", value: stats.imageCount, icon: ImageIcon, color: "emerald", trend: "+5%" },
            { label: "Storage", value: formatBytes(stats.usedStorage), icon: HardDrive, color: "amber", trend: `${stats.usagePercent.toFixed(1)}%` },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <GlassPanel className="group relative overflow-hidden p-4 hover:border-primary/20 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-white/5">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-foreground truncate">{stat.value}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>



        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <GlassPanel className="group relative overflow-hidden p-4 transition-all hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-white/5 group-hover:scale-110 transition-transform">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Two column layout */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Documents */}
          <motion.div variants={itemVariants}>
            <GlassPanel className="p-5">
              <h2 className="mb-4 flex items-center justify-between text-xs tracking-widest text-muted-foreground uppercase">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Recent Content
                </span>
                <Link href="/library" className="text-primary hover:underline text-[10px]">
                  View All
                </Link>
              </h2>
              <div className="flex flex-col gap-1">
                <AnimatePresence mode="popLayout">
                  {recentDocs.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground italic">No content uploaded yet</p>
                  ) : recentDocs.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-primary/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 group-hover:border-primary/20 transition-all">
                        {doc.type === "video" ? (
                          <Video className="h-4 w-4 text-primary" />
                        ) : doc.type === "image" ? (
                          <ImageIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatBytes(doc.size)}</span>
                          {doc.expiresAt && (
                            <>
                              <span className="text-border">•</span>
                              <span className="flex items-center gap-1 text-amber-500">
                                <AlertCircle className="h-3 w-3" />
                                Expires {new Date(doc.expiresAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Activity Stream */}
          <motion.div variants={itemVariants}>
            <GlassPanel className="p-5">
              <h2 className="mb-4 flex items-center justify-between text-xs tracking-widest text-muted-foreground uppercase">
                <span className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  Live Activity Feed
                </span>
                <Link href="/activity" className="text-primary hover:underline text-[10px]">
                  View All
                </Link>
              </h2>
              <div className="flex flex-col gap-1">
                <AnimatePresence mode="popLayout">
                  {recentLogs.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground italic">No system activity logged</p>
                  ) : recentLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="mt-1">
                        {log.action === "view" && <Eye className="h-3.5 w-3.5 text-blue-500" />}
                        {log.action === "download" && <Download className="h-3.5 w-3.5 text-emerald-500" />}
                        {log.action === "upload" && <Upload className="h-3.5 w-3.5 text-purple-500" />}
                        {!["view", "download", "upload"].includes(log.action) && (
                          <div
                            className={`h-2 w-2 rounded-full ${log.granted ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-foreground">
                          <span className="font-semibold">{log.userName}</span>{" "}
                          <span className="text-muted-foreground">{log.action}</span>{" "}
                          <span className="font-semibold truncate">"{log.documentTitle}"</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2 font-mono">
                          <span>{getTimeAgo(log.timestamp)}</span>
                          {!log.granted && (
                            <>
                              <span className="text-border">•</span>
                              <span className="text-rose-500 font-bold uppercase tracking-tighter">Access Denied</span>
                            </>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassPanel>
          </motion.div>
        </div>

        {/* Storage Bar */}
        <motion.div variants={itemVariants} className="mt-6 mb-8">
          <GlassPanel className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5" />
                Storage Utilization
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(stats.usedStorage)} / {formatBytes(stats.totalStorage)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5 border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${stats.usagePercent}%` }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground uppercase font-bold tracking-wider">{stats.usagePercent.toFixed(1)}% used</span>
              <span className={`font-bold uppercase tracking-wider ${stats.usagePercent > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                {stats.usagePercent > 80 ? "Cleanup Recommended" : "Optimal"}
              </span>
            </div>
          </GlassPanel>
        </motion.div>
      </motion.div>
    </div>
  )
}
