"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Share2, Calendar, BarChart3, Plus, Loader2, X, Check,
    Clock, TrendingUp, Eye, Heart, MessageCircle, ExternalLink, AlertCircle
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"

const PLATFORMS = [
    { id: "twitter", name: "Twitter / X", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { id: "linkedin", name: "LinkedIn", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: "youtube", name: "YouTube", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { id: "tiktok", name: "TikTok", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { id: "instagram", name: "Instagram", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
]

interface DistJob {
    _id: string
    platform: string
    status: string
    caption: string
    hashtags: string[]
    scheduledAt: string
    publishedAt?: string
    externalUrl?: string
    metrics: { views: number; likes: number; shares: number; comments: number; clicks: number }
    content?: { title: string }
}

interface Analytics {
    total: number
    published: number
    scheduled: number
    failed: number
    totalViews: number
    totalLikes: number
    totalShares: number
}

export default function DistributionPage() {
    const user = useAppStore((s) => s.user)
    const documents = useAppStore((s) => s.documents)
    const [jobs, setJobs] = useState<DistJob[]>([])
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)

    // Create form state
    const [form, setForm] = useState({
        contentId: "",
        platform: "twitter",
        caption: "",
        hashtags: "",
        scheduledAt: "",
    })
    const [creating, setCreating] = useState(false)

    const fetchData = async () => {
        if (!user) return
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }
        try {
            const [jobsRes, analyticsRes] = await Promise.all([
                fetch(`${baseUrl}/api/distribution`, { headers: { "Authorization": `Bearer ${user.token}` } }),
                fetch(`${baseUrl}/api/distribution/analytics`, { headers: { "Authorization": `Bearer ${user.token}` } }),
            ])
            const jobsData = await jobsRes.json()
            const analyticsData = await analyticsRes.json()
            setJobs(Array.isArray(jobsData) ? jobsData : [])
            setAnalytics(analyticsData)
        } catch (err) {
            console.error("Distribution fetch failed:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [user])

    const handleCreate = async () => {
        if (!user || !form.contentId || !form.platform) return
        setCreating(true)
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }
        try {
            const res = await fetch(`${baseUrl}/api/distribution`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                body: JSON.stringify({
                    contentId: form.contentId,
                    platform: form.platform,
                    caption: form.caption,
                    hashtags: form.hashtags.split(",").map(h => h.trim()).filter(Boolean),
                    scheduledAt: form.scheduledAt || new Date().toISOString(),
                }),
            })
            if (res.ok) {
                const job = await res.json()
                setJobs(prev => [job, ...prev])
                setShowCreate(false)
                setForm({ contentId: "", platform: "twitter", caption: "", hashtags: "", scheduledAt: "" })
            }
        } catch { } finally {
            setCreating(false)
        }
    }

    const handleCancel = async (jobId: string) => {
        if (!user) return
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }
        try {
            await fetch(`${baseUrl}/api/distribution/${jobId}/cancel`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${user.token}` },
            })
            setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: "cancelled" } : j))
        } catch { }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "published": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
            case "scheduled": return "bg-amber-500/20 text-amber-300 border-amber-500/20"
            case "processing": return "bg-blue-500/20 text-blue-300 border-blue-500/20"
            case "failed": return "bg-rose-500/20 text-rose-300 border-rose-500/20"
            default: return "bg-slate-500/20 text-slate-300 border-slate-500/20"
        }
    }

    return (
        <div className="min-h-screen px-4 pt-10 md:px-10 pb-24 bg-black/40">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-cyan-500/80">Distribution Engine</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Distribution</span>
                            </h1>
                            <p className="text-slate-400 text-sm">Schedule and track content distribution across platforms</p>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            New Job
                        </button>
                    </div>
                </motion.div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Published", value: analytics.published, icon: Check, color: "text-emerald-400" },
                            { label: "Scheduled", value: analytics.scheduled, icon: Clock, color: "text-amber-400" },
                            { label: "Total Views", value: analytics.totalViews, icon: Eye, color: "text-blue-400" },
                            { label: "Total Likes", value: analytics.totalLikes, icon: Heart, color: "text-rose-400" },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <GlassPanel className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                </GlassPanel>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Create Job Modal */}
                <AnimatePresence>
                    {showCreate && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8"
                        >
                            <GlassPanel className="p-6" glow>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">New Distribution Job</h2>
                                    <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">Content</label>
                                        <select
                                            value={form.contentId}
                                            onChange={(e) => setForm(f => ({ ...f, contentId: e.target.value }))}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-500/30 focus:outline-none"
                                        >
                                            <option value="" className="bg-slate-900">Select content...</option>
                                            {documents.map((doc) => (
                                                <option key={doc.id} value={doc.id} className="bg-slate-900">{doc.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">Platform</label>
                                        <div className="flex gap-2">
                                            {PLATFORMS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setForm(f => ({ ...f, platform: p.id }))}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${form.platform === p.id ? `${p.bg} ${p.color} ${p.border}` : "text-slate-500 border-white/5 hover:bg-white/5"
                                                        }`}
                                                >
                                                    {p.id.slice(0, 2).toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs text-slate-500 mb-1.5">Caption</label>
                                    <textarea
                                        value={form.caption}
                                        onChange={(e) => setForm(f => ({ ...f, caption: e.target.value }))}
                                        rows={3}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-500/30 focus:outline-none resize-none"
                                        placeholder="Write your caption..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">Hashtags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={form.hashtags}
                                            onChange={(e) => setForm(f => ({ ...f, hashtags: e.target.value }))}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-500/30 focus:outline-none"
                                            placeholder="#content, #ai, #platform"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">Schedule (optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={form.scheduledAt}
                                            onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-500/30 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={!form.contentId || creating}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                                    Schedule Distribution
                                </button>
                            </GlassPanel>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Jobs List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500/50 mb-4" />
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <GlassPanel className="flex flex-col items-center justify-center py-24">
                        <Share2 className="h-12 w-12 text-cyan-500/30 mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">No Distribution Jobs</h2>
                        <p className="text-sm text-slate-400">Create your first content distribution job above</p>
                    </GlassPanel>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job, i) => {
                            const platform = PLATFORMS.find(p => p.id === job.platform) || PLATFORMS[0]
                            return (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <GlassPanel className="p-5 group hover:border-cyan-500/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            {/* Platform Badge */}
                                            <div className={`h-10 w-10 rounded-xl ${platform.bg} border ${platform.border} flex items-center justify-center shrink-0`}>
                                                <span className={`text-xs font-bold ${platform.color}`}>{platform.id.slice(0, 2).toUpperCase()}</span>
                                            </div>

                                            {/* Job Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-white truncate">{job.content?.title || "Unknown Content"}</h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusStyle(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{job.caption || "No caption"}</p>
                                            </div>

                                            {/* Metrics */}
                                            <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.metrics.views}</span>
                                                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{job.metrics.likes}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {job.externalUrl && (
                                                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-all">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                                {job.status === "scheduled" && (
                                                    <button
                                                        onClick={() => handleCancel(job._id)}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </GlassPanel>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
