"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Heart, Share2, MessageCircle, Eye, Play, FileText, Video, ImageIcon,
    Sparkles, RefreshCw, TrendingUp, Clock, Loader2, ChevronDown, Bookmark
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"
import Link from "next/link"

function formatBytes(bytes: number) {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
    return `${(bytes / 1_000).toFixed(0)} KB`
}

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

interface FeedItem {
    content: any
    score: number
    signals: {
        engagementScore: number
        recencyScore: number
        topicRelevance: number
        socialProof: number
        diversityBonus: number
    }
}

function FeedCard({ item, index }: { item: FeedItem; index: number }) {
    const [liked, setLiked] = useState(false)
    const [likes, setLikes] = useState(Math.floor(Math.random() * 50))
    const user = useAppStore((s) => s.user)

    const content = item.content
    if (!content) return null

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) return

        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }
        try {
            await fetch(`${baseUrl}/api/interactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                body: JSON.stringify({ contentId: content._id, type: "like" }),
            })
            setLiked(!liked)
            setLikes(prev => liked ? prev - 1 : prev + 1)
        } catch { }
    }

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(`${window.location.origin}/viewer/${content._id}`)
    }

    const tags = content.tags || []
    const category = content.metadata?.aiCategory || "content"
    const summary = content.metadata?.aiSummary || ""

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
        >
            <Link href={`/viewer/${content._id}`}>
                <GlassPanel className="group relative overflow-hidden p-0 hover:border-blue-500/20 transition-all duration-500 cursor-pointer">
                    {/* Score Indicator */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xl rounded-full px-3 py-1 border border-white/10">
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400">{(item.score * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* Content Preview Area */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent)]" />
                        {content.mimeType?.startsWith("video") ? (
                            <div className="relative">
                                <Video className="h-16 w-16 text-blue-500/30" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/30 transition-all">
                                        <Play className="h-5 w-5 text-blue-400 ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        ) : content.mimeType?.startsWith("image") ? (
                            <ImageIcon className="h-16 w-16 text-purple-500/30" />
                        ) : (
                            <FileText className="h-16 w-16 text-blue-500/30" />
                        )}

                        {/* Category Badge */}
                        <div className="absolute bottom-3 left-4">
                            <span className="bg-blue-500/20 backdrop-blur-xl text-blue-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20">
                                {category}
                            </span>
                        </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                            {content.title}
                        </h3>

                        {summary && (
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{summary}</p>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {tags.slice(0, 4).map((tag: string) => (
                                    <span key={tag} className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Meta Row */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-4 text-slate-500">
                                <span className="text-xs flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {content.createdAt ? timeAgo(content.createdAt) : "N/A"}
                                </span>
                                <span className="text-xs">{content.size ? formatBytes(content.size) : ""}</span>
                            </div>

                            {/* Interaction Buttons */}
                            <div className="flex items-center gap-1">
                                <button onClick={handleLike} className={`p-2 rounded-lg transition-all ${liked ? "text-rose-400 bg-rose-500/10" : "text-slate-500 hover:text-rose-400 hover:bg-white/5"}`}>
                                    <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                                </button>
                                <button onClick={handleShare} className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/5 transition-all">
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/5 transition-all">
                                    <Bookmark className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Signal Bars */}
                    <div className="px-6 pb-4">
                        <div className="flex gap-1">
                            {Object.entries(item.signals).map(([key, value]) => (
                                <div key={key} className="flex-1">
                                    <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(value as number) * 100}%` }}
                                            transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassPanel>
            </Link>
        </motion.div>
    )
}

export default function FeedPage() {
    const user = useAppStore((s) => s.user)
    const [feed, setFeed] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const observerRef = useRef<HTMLDivElement>(null)

    const fetchFeed = useCallback(async (pageNum: number, append = false) => {
        if (!user) return
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }
        try {
            if (pageNum === 1) setLoading(true)
            else setLoadingMore(true)

            const res = await fetch(`${baseUrl}/api/feed?page=${pageNum}&limit=12`, {
                headers: { "Authorization": `Bearer ${user.token}` },
            })
            const data = await res.json()

            if (append) {
                setFeed(prev => [...prev, ...(data.items || [])])
            } else {
                setFeed(data.items || [])
            }
            setHasMore(data.hasMore || false)
        } catch (err) {
            console.error("Feed fetch failed:", err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [user])

    useEffect(() => {
        fetchFeed(1)
    }, [fetchFeed])

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchFeed(nextPage, true)
                }
            },
            { threshold: 0.1 }
        )

        if (observerRef.current) observer.observe(observerRef.current)
        return () => observer.disconnect()
    }, [hasMore, loadingMore, page, fetchFeed])

    const handleRefresh = async () => {
        if (!user) return
        setRefreshing(true)
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }
        try {
            await fetch(`${baseUrl}/api/feed/refresh`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${user.token}` },
            })
            setPage(1)
            await fetchFeed(1)
        } catch { } finally {
            setRefreshing(false)
        }
    }

    return (
        <div className="min-h-screen px-4 pt-10 md:px-10 pb-24 bg-black/40">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-blue-500/80">AI-Powered</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                                Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Feed</span>
                            </h1>
                            <p className="text-slate-400 text-sm">Personalized content ranked by AI recommendation engine</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </motion.div>

                {/* Feed Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500/50 mb-4" />
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Generating personalized feed...</p>
                    </div>
                ) : feed.length === 0 ? (
                    <GlassPanel className="flex flex-col items-center justify-center py-24">
                        <Sparkles className="h-12 w-12 text-blue-500/30 mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">No Content Yet</h2>
                        <p className="text-sm text-slate-400 mb-6">Upload content to see your personalized AI feed</p>
                        <Link href="/upload" className="px-6 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all">
                            Upload Content
                        </Link>
                    </GlassPanel>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {feed.map((item, index) => (
                                <FeedCard key={item.content?._id || index} item={item} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                    <div ref={observerRef} className="flex justify-center py-8">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-xs font-mono uppercase tracking-widest">Loading more...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
