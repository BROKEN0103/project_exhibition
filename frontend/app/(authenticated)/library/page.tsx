"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  FileText, Video, ImageIcon, Search, Download, Lock, Clock, Grid3X3, List,
  Share2, Sparkles, Brain, X, Loader2, AlertTriangle, Trash2, Filter, Eye,
  Heart, Tag
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore, type Document, type UserRole } from "@/stores/app-store"

type ViewMode = "grid" | "list"
type TypeFilter = "all" | "video" | "document" | "image"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

function DocumentCard({ doc }: { doc: Document }) {
  const user = useAppStore((s) => s.user)
  const hasAccess = user && doc.accessRoles.includes(user.role)
  const tags = doc.metadata?.tags || []
  const category = doc.metadata?.aiCategory

  return (
    <Link href={hasAccess ? `/viewer/${doc.id}` : "#"}>
      <GlassPanel className={`group relative p-0 overflow-hidden transition-all ${hasAccess ? "cursor-pointer hover:border-blue-500/20" : "cursor-not-allowed opacity-60"}`}>
        {/* Preview */}
        <div className="h-32 bg-gradient-to-br from-slate-900/80 to-slate-950 flex items-center justify-center relative">
          {doc.type === "video" ? <Video className="h-10 w-10 text-purple-500/30" /> :
            doc.type === "image" ? <ImageIcon className="h-10 w-10 text-teal-500/30" /> :
              <FileText className="h-10 w-10 text-blue-500/30" />}

          {category && (
            <div className="absolute bottom-2 left-3">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/10">
                {category}
              </span>
            </div>
          )}

          {!hasAccess && (
            <div className="absolute top-2 right-2">
              <Lock className="h-4 w-4 text-rose-500/60" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">{doc.title}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>{formatBytes(doc.size)}</span>
            <span className="text-white/10">•</span>
            <span className="capitalize">{doc.type}</span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex gap-1">
              {doc.accessRoles.slice(0, 2).map((role) => (
                <span key={role} className="rounded bg-primary/5 px-1.5 py-0.5 text-[9px] text-primary/60">{role}</span>
              ))}
            </div>
            {doc.uploadedAt && (
              <span className="text-[10px] text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </GlassPanel>
    </Link>
  )
}

function DocumentRow({ doc }: { doc: Document }) {
  const user = useAppStore((s) => s.user)
  const hasAccess = user && doc.accessRoles.includes(user.role)

  return (
    <Link href={hasAccess ? `/viewer/${doc.id}` : "#"}>
      <div className={`group flex items-center gap-4 rounded-xl px-5 py-4 transition-colors border border-transparent ${hasAccess ? "cursor-pointer hover:bg-blue-500/5 hover:border-blue-500/10" : "cursor-not-allowed opacity-60"}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/5">
          {doc.type === "video" ? <Video className="h-4 w-4 text-purple-400" /> :
            doc.type === "image" ? <ImageIcon className="h-4 w-4 text-teal-400" /> :
              <FileText className="h-4 w-4 text-blue-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{doc.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {formatBytes(doc.size)} • {doc.type} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
          </p>
        </div>
        {!hasAccess && <Lock className="h-4 w-4 text-rose-500/60" />}
      </div>
    </Link>
  )
}

export default function LibraryPage() {
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  const setDocuments = useAppStore((s) => s.setDocuments)

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isSearching, setIsSearching] = useState(false)
  const [showSemanticResults, setShowSemanticResults] = useState(false)
  const [semanticResults, setSemanticResults] = useState<any[]>([])
  const [semanticSummary, setSemanticSummary] = useState("")
  const [semanticError, setSemanticError] = useState<string | null>(null)

  const handleSemanticSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!search || !user) return

    setIsSearching(true)
    setShowSemanticResults(true)
    setSemanticError(null)

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    try {
      const res = await fetch(`${baseUrl}/api/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
        body: JSON.stringify({ query: search }),
      })
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setSemanticResults(data.matches || [])
      setSemanticSummary(data.summary || "")
    } catch (err: any) {
      setSemanticError(err.message || "Failed to connect to AI engine")
    } finally {
      setIsSearching(false)
    }
  }

  // Fetch content
  useEffect(() => {
    if (!user) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const fetchData = async () => {
      try {
        const docRes = await fetch(`${baseUrl}/api/models`, {
          headers: { "Authorization": `Bearer ${user.token}` },
        })
        const docData = await docRes.json()

        if (Array.isArray(docData)) {
          setDocuments(docData.map((d: any) => ({
            id: d._id,
            title: d.title,
            type: d.mimeType?.startsWith("video") ? "video" : d.mimeType?.startsWith("image") ? "image" : "document",
            mimeType: d.mimeType,
            size: d.size,
            uploadedAt: d.createdAt,
            expiresAt: null,
            uploadedBy: d.uploadedBy?.name || "Unknown",
            accessRoles: ["admin", "editor", "viewer", "user"],
            downloadAllowed: true,
            metadata: {
              isEncrypted: d.isEncrypted,
              version: d.version,
              fileUrl: `${baseUrl}/uploads/${d.fileUrl}?token=${user.token}`,
              tags: d.tags || [],
              aiCategory: d.metadata?.aiCategory,
              aiSummary: d.metadata?.aiSummary,
            },
          })))
        }
      } catch (err) {
        console.error("Fetch failed", err)
      }
    }
    fetchData()
  }, [user, setDocuments])

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [documents, search, typeFilter])

  return (
    <div className="flex-1 px-4 pt-8 md:px-8 relative">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-white">Content Library</h1>
          <p className="mt-1 text-sm text-slate-400">{filtered.length} items &middot; AI-indexed</p>
        </motion.div>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSemanticSearch} className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search with AI semantic engine..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-12 text-sm text-white placeholder:text-slate-600 transition-all focus:border-blue-500/30 focus:outline-none focus:ring-1 focus:ring-blue-500/20 backdrop-blur-xl"
            />
            <button
              type="submit" disabled={isSearching || !search.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-all border ${search.trim() ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-white/5 border-white/10 text-slate-600 opacity-50"}`}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </form>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 p-0.5 bg-white/5">
              {(["all", "document", "video", "image"] as TypeFilter[]).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${typeFilter === t ? "bg-blue-500/20 text-blue-400 font-medium" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                >{t === "all" ? "All" : t}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-white/10 p-0.5 bg-white/5">
              {[{ id: "grid", icon: Grid3X3 }, { id: "list", icon: List }].map((view) => (
                <button key={view.id} onClick={() => setViewMode(view.id as ViewMode)}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === view.id ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:bg-white/5"}`}
                ><view.icon className="h-4 w-4" /></button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Search Results */}
        <AnimatePresence>
          {showSemanticResults && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <GlassPanel glow className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-blue-400" />
                    </div>
                    <h2 className="text-sm font-bold text-white">AI Intelligence Report</h2>
                  </div>
                  <button onClick={() => setShowSemanticResults(false)} className="rounded-full p-1 text-slate-500 hover:bg-white/5 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500/40" />
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Consulting semantic index...</p>
                  </div>
                ) : semanticError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="mb-3 h-6 w-6 text-amber-500/50" />
                    <p className="text-sm text-amber-200/60">{semanticError}</p>
                    <button onClick={() => handleSemanticSearch()} className="mt-4 text-xs text-blue-400 hover:underline">Try again</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {semanticResults.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No relevant fragments found.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {semanticResults.map((result: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white truncate">{result.title || "Document"}</span>
                              <span className="text-[10px] text-blue-400 font-mono">{(result.score * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{result.textChunk || ""}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid/List */}
        {filtered.length === 0 ? (
          <GlassPanel className="flex flex-col items-center justify-center py-24">
            <FileText className="h-12 w-12 text-blue-500/20 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">No Content Found</h2>
            <p className="text-sm text-slate-400 mb-6">Upload content to get started</p>
            <Link href="/upload" className="px-6 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all">
              Upload Content
            </Link>
          </GlassPanel>
        ) : viewMode === "grid" ? (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((doc) => (
              <motion.div key={doc.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <DocumentCard doc={doc} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassPanel className="divide-y divide-white/5">
            {filtered.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
          </GlassPanel>
        )}
      </div>
    </div>
  )
}
