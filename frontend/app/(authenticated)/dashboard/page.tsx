"use client"

import { motion, AnimatePresence, Variants } from "framer-motion"
import { FileText, Video, ImageIcon, Clock, Shield, HardDrive, Upload, Zap, AlertCircle, Activity } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { TiltCard } from "@/components/premium/TiltCard"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

export default function DashboardPage() {
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)

  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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

  const recentDocs = documents.slice(0, 5)

  const quickActions = [
    { label: "Upload Content", href: "/upload", icon: Upload, description: "Secure ingestion" },
    { label: "Vault Explorer", href: "/library", icon: HardDrive, description: "Content management" },
    { label: "Access Rights", href: "/access-control", icon: Shield, description: "Permission audit" },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen px-4 pt-10 md:px-10 pb-24 bg-black/40">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl"
      >
        {/* Immersive Header */}
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-blue-500 rounded-full" />
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-blue-500/80">Control Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Hello, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-md">
              All systems nominal. Encryption keys rotated.
              Spatial security monitoring is active.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Local Time</p>
              <p className="text-xl font-mono text-white tracking-widest">{currentTime?.toLocaleTimeString()}</p>
            </div>
            <div className="h-12 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900/50 border border-slate-800 px-5 py-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-sm font-bold text-slate-200">System Live</span>
            </div>
          </div>
        </motion.div>



        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Stored Docs", value: stats.docCount, icon: FileText, color: "text-blue-400" },
            { label: "Coded Videos", value: stats.videoCount, icon: Video, color: "text-purple-400" },
            { label: "Secure Images", value: stats.imageCount, icon: ImageIcon, color: "text-teal-400" },
            { label: "Used Capacity", value: formatBytes(stats.usedStorage), icon: HardDrive, color: "text-amber-400" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <TiltCard className="h-full">
                <GlassPanel glow className="p-6 h-full flex flex-col justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  </div>
                </GlassPanel>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Quick Actions Column */}
          <motion.div variants={itemVariants} className="xl:col-span-1 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Quick Access</h2>
            </div>
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <GlassPanel className="p-6 hover:translate-x-2 transition-transform cursor-pointer border-l-4 border-l-blue-600/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
            ))}

            <GlassPanel className="mt-4 p-6 bg-gradient-to-br from-blue-600/20 to-transparent overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Spatial Audit Log</h3>
                <p className="text-xs text-slate-400 mb-4">You have 0 pending security notifications.</p>
                <button className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">Review Report</button>
              </div>
              <Shield className="absolute -bottom-6 -right-6 h-32 w-32 text-blue-500/10" />
            </GlassPanel>
          </motion.div>

          {/* List Column */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <GlassPanel className="h-full p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Recent Content Integrity</h2>
                </div>
                <Link href="/library" className="text-xs text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase underline-offset-4 hover:underline">Full Vault</Link>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {recentDocs.length === 0 ? (
                    <p className="py-20 text-center text-sm text-slate-500 font-mono">_no_active_records_found</p>
                  ) : recentDocs.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-blue-600/5 hover:border-blue-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-black border border-slate-800 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                          {doc.type === "video" ? <Video className="h-5 w-5 text-purple-400" /> : <FileText className="h-5 w-5 text-blue-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{doc.title}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                            <span>{formatBytes(doc.size)}</span>
                            <span>•</span>
                            <span className="text-emerald-500">Secure</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                        <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full w-full bg-blue-500/50" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
