"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Film, Sparkles, Play, Clock, Trash2, ExternalLink,
    Loader2, Scissors, TrendingUp, Wand2
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

interface Clip {
    _id: string
    title: string
    startTime: number
    endTime: number
    duration: number
    format: string
    status: string
    aiScore: number
    tags: string[]
    createdAt: string
    sourceContent?: { title: string; mimeType: string }
}

export default function ClipsPage() {
    const user = useAppStore((s) => s.user)
    const documents = useAppStore((s) => s.documents)
    const [clips, setClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState<string | null>(null)
    const [selectedContent, setSelectedContent] = useState("")

    const fetchClips = async () => {
        if (!user) return
        const baseUrl = getApiUrl()
        try {
            const res = await fetch(`${baseUrl}/api/clips`, {
                headers: { "Authorization": `Bearer ${user.token}` },
            })
            const data = await res.json()
            setClips(data.clips || [])
        } catch (err) {
            console.error("Clips fetch failed:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClips()
    }, [user])

    const handleGenerate = async () => {
        if (!user || !selectedContent) return
        setGenerating(selectedContent)
        const baseUrl = getApiUrl()
        try {
            const res = await fetch(`${baseUrl}/api/clips/generate/${selectedContent}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${user.token}` },
            })
            const data = await res.json()
            if (data.clips) {
                setClips(prev => [...data.clips, ...prev])
            }
        } catch (err) {
            console.error("Generation failed:", err)
        } finally {
            setGenerating(null)
        }
    }

    const handleDelete = async (clipId: string) => {
        if (!user || !confirm("Delete this clip?")) return
        const baseUrl = getApiUrl()
        try {
            await fetch(`${baseUrl}/api/clips/${clipId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user.token}` },
            })
            setClips(prev => prev.filter(c => c._id !== clipId))
        } catch { }
    }

    return (
        <div className="min-h-screen px-4 pt-10 md:px-10 pb-24 bg-black/40">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-purple-500/80">AI Clip Engine</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                        AI <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Clips</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Auto-generate short clips from your content using AI highlight detection</p>
                </motion.div>

                {/* Generator Panel */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <GlassPanel className="p-6 mb-8" glow>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Wand2 className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white">Generate Clips</h2>
                                <p className="text-xs text-slate-500">Select content and let AI find the best moments</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={selectedContent}
                                onChange={(e) => setSelectedContent(e.target.value)}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/30 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
                            >
                                <option value="" className="bg-slate-900">Select content...</option>
                                {documents.map((doc) => (
                                    <option key={doc.id} value={doc.id} className="bg-slate-900">{doc.title}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleGenerate}
                                disabled={!selectedContent || !!generating}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition-all disabled:opacity-50"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Scissors className="h-4 w-4" />
                                        Generate Clips
                                    </>
                                )}
                            </button>
                        </div>
                    </GlassPanel>
                </motion.div>

                {/* Clips Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500/50 mb-4" />
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Loading clips...</p>
                    </div>
                ) : clips.length === 0 ? (
                    <GlassPanel className="flex flex-col items-center justify-center py-24">
                        <Film className="h-12 w-12 text-purple-500/30 mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">No Clips Yet</h2>
                        <p className="text-sm text-slate-400">Select content above and generate AI-powered clips</p>
                    </GlassPanel>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {clips.map((clip, i) => (
                                <motion.div
                                    key={clip._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <GlassPanel className="group p-0 overflow-hidden hover:border-purple-500/20 transition-all">
                                        {/* Clip Preview */}
                                        <div className="relative h-44 bg-gradient-to-br from-purple-950/50 to-slate-950 flex items-center justify-center">
                                            <div className="text-center">
                                                <Play className="h-10 w-10 text-purple-500/40 mx-auto mb-2" />
                                                <p className="text-xs font-mono text-purple-400/60">
                                                    {formatDuration(clip.startTime)} → {formatDuration(clip.endTime)}
                                                </p>
                                            </div>

                                            {/* AI Score Badge */}
                                            <div className="absolute top-3 right-3">
                                                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl rounded-full px-2.5 py-1 border border-white/10">
                                                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                                                    <span className="text-[10px] font-bold text-emerald-400">{(clip.aiScore * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>

                                            {/* Format Badge */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-purple-500/20">
                                                    {clip.format}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${clip.status === "ready" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" :
                                                        clip.status === "processing" ? "bg-amber-500/20 text-amber-300 border-amber-500/20" :
                                                            "bg-slate-500/20 text-slate-300 border-slate-500/20"
                                                    }`}>
                                                    {clip.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Clip Info */}
                                        <div className="p-4">
                                            <h3 className="text-sm font-bold text-white mb-1 truncate">{clip.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDuration(clip.duration)}
                                                </span>
                                                {clip.sourceContent && (
                                                    <span className="truncate">from: {clip.sourceContent.title}</span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-3 border-t border-white/5">
                                                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition-all">
                                                    <ExternalLink className="h-3 w-3" />
                                                    Distribute
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(clip._id)}
                                                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassPanel>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
