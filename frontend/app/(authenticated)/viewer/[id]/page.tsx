"use client"

import { useState, use, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Download, FileText, Video, ImageIcon, Lock, Clock, Shield,
  Info, Sparkles, Share2, Twitter, Linkedin, Link as LinkIcon, MessageSquare,
  HelpCircle, BarChart2, MessageCircle, Play, Pause, ChevronDown, Check,
  Send, AlertCircle
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { toast } from "sonner"
import { useAppStore } from "@/stores/app-store"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  
  const doc = documents.find((d) => d.id === id)
  const hasAccess = user && doc?.accessRoles.includes(user.role)

  const [activeTab, setActiveTab] = useState<"info" | "comments" | "quizzes" | "polls">("info")
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoInterval = useRef<NodeJS.Timeout | null>(null)

  // Interactive Data
  const [comments, setComments] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [polls, setPolls] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  const baseUrl = getApiUrl()

  useEffect(() => {
    if (!user || !hasAccess) return
    const fetchData = async () => {
      try {
        const [cRes, qRes, pRes] = await Promise.all([
          fetch(`${baseUrl}/api/interactions/comments/${id}`, { headers: { "Authorization": `Bearer ${user.token}` } }),
          fetch(`${baseUrl}/api/interactions/quizzes/${id}`, { headers: { "Authorization": `Bearer ${user.token}` } }),
          fetch(`${baseUrl}/api/interactions/polls/${id}`, { headers: { "Authorization": `Bearer ${user.token}` } })
        ])
        if (cRes.ok) setComments(await cRes.json())
        if (qRes.ok) setQuizzes(await qRes.json())
        if (pRes.ok) setPolls(await pRes.json())
      } catch (err) {
        console.error("Failed to load interactive data", err)
      }
    }
    fetchData()

    // Log view interaction
    fetch(`${baseUrl}/api/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
      body: JSON.stringify({ contentId: id, type: "view", timestamp: Date.now() })
    }).catch(console.error)
  }, [id, user, hasAccess])

  // Simulated Video Player
  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      videoInterval.current = setInterval(() => setCurrentTime(t => t + 1), 1000)
    } else {
      setIsPlaying(false)
      if (videoInterval.current) clearInterval(videoInterval.current)
    }
  }

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return
    try {
      const res = await fetch(`${baseUrl}/api/interactions/comments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
        body: JSON.stringify({ text: newComment, timestamp: currentTime })
      })
      if (res.ok) {
        const comment = await res.json()
        setComments(prev => [...prev, { ...comment, user: { name: user.name } }])
        setNewComment("")
        toast.success("Comment added")
      }
    } catch {}
  }

  // Handle Quiz Answer
  const handleQuizAnswer = async (quizId: string, optionIndex: number) => {
    if (!user) return
    try {
      const res = await fetch(`${baseUrl}/api/interactions/quizzes/${quizId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
        body: JSON.stringify({ selectedOption: optionIndex })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.isCorrect ? "Correct answer!" : "Incorrect answer")
        // Refresh quizzes
        const qRes = await fetch(`${baseUrl}/api/interactions/quizzes/${id}`, { headers: { "Authorization": `Bearer ${user.token}` } })
        if (qRes.ok) setQuizzes(await qRes.json())
      } else {
        toast.error(data.message)
      }
    } catch {}
  }

  // Handle Poll Vote
  const handlePollVote = async (pollId: string, optionIndex: number) => {
    if (!user) return
    try {
      const res = await fetch(`${baseUrl}/api/interactions/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
        body: JSON.stringify({ optionIndex })
      })
      if (res.ok) {
        toast.success("Vote recorded")
        const pRes = await fetch(`${baseUrl}/api/interactions/polls/${id}`, { headers: { "Authorization": `Bearer ${user.token}` } })
        if (pRes.ok) setPolls(await pRes.json())
      } else {
        const err = await res.json()
        toast.error(err.message)
      }
    } catch {}
  }

  useEffect(() => {
    return () => { if (videoInterval.current) clearInterval(videoInterval.current) }
  }, [])

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-slate-400">Document not found</p>
          <button onClick={() => router.push("/library")} className="mt-4 text-xs text-blue-400 hover:underline">Back to Library</button>
        </GlassPanel>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <GlassPanel glow className="max-w-sm p-8 text-center bg-rose-500/5 border-rose-500/20">
          <Lock className="mx-auto mb-4 h-8 w-8 text-rose-500/60" />
          <h2 className="mb-2 text-sm text-white font-bold">Access Denied</h2>
          <p className="mb-4 text-xs text-slate-400">Your role ({user?.role}) does not have permission to view.</p>
          <button onClick={() => router.push("/library")} className="rounded-xl bg-rose-500/10 px-6 py-2.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20">
            Back to Library
          </button>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-8 md:px-8 pb-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <button onClick={() => router.push("/library")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10 shrink-0">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight text-white mb-1">{doc.title}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="uppercase tracking-widest font-bold">{doc.type}</span>
              <span>•</span>
              <span>{formatBytes(doc.size)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-400">
                <Shield className="h-3 w-3" /> Secure E2EE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10">
              <Share2 className="h-4 w-4" /> Share
            </button>
            {doc.downloadAllowed && (
              <button className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20">
                <Download className="h-4 w-4" /> Download
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <GlassPanel className="p-0 overflow-hidden relative group">
              {/* Content Area */}
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center relative">
                {doc.type === "video" ? (
                  <>
                    <Video className={`h-20 w-20 transition-all duration-500 ${isPlaying ? 'text-blue-500/10 scale-90' : 'text-blue-500/30'}`} />
                    <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-xl hover:scale-110 transition-transform">
                        {isPlaying ? <Pause className="h-6 w-6 text-blue-400" /> : <Play className="h-6 w-6 text-blue-400 ml-1" />}
                      </div>
                    </button>
                    {/* Timestamp Overlays for Interactive Content */}
                    <AnimatePresence>
                      {quizzes.some(q => q.timestamp === currentTime) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-16 left-4 right-4 bg-black/80 backdrop-blur-xl border border-purple-500/30 p-4 rounded-2xl z-20">
                          <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Interactive Quiz</span>
                          </div>
                          <p className="text-sm font-semibold text-white mb-3">{quizzes.find(q => q.timestamp === currentTime)?.question}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {quizzes.find(q => q.timestamp === currentTime)?.options.map((opt: any, i: number) => (
                              <button key={i} onClick={() => handleQuizAnswer(quizzes.find(q => q.timestamp === currentTime)._id, i)} className="text-xs py-2 px-3 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 text-slate-300 transition-all text-left">
                                {opt.text}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : doc.type === "image" ? (
                  <ImageIcon className="h-20 w-20 text-teal-500/30" />
                ) : (
                  <FileText className="h-20 w-20 text-slate-500/30" />
                )}

                {/* AI Overlay Badge */}
                {doc.metadata?.aiCategory && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-xl">
                      {doc.metadata.aiCategory}
                    </span>
                  </div>
                )}
              </div>

              {/* Player Controls (if video) */}
              {doc.type === "video" && (
                <div className="bg-slate-950/80 p-4 border-t border-white/5 flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <span className="text-xs font-mono text-slate-400">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer">
                    <motion.div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${(currentTime / 300) * 100}%` }} />
                    {/* Markers */}
                    {[...comments, ...quizzes, ...polls].map((item: any, i: number) => item.timestamp ? (
                      <div key={i} className="absolute top-0 h-full w-1 bg-white/50" style={{ left: `${(item.timestamp / 300) * 100}%` }} title="Interactive Event" />
                    ) : null)}
                  </div>
                  <span className="text-xs font-mono text-slate-400">05:00</span>
                </div>
              )}
            </GlassPanel>

            {/* AI Summary Section */}
            {doc.metadata?.aiSummary && (
              <GlassPanel className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Summary</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {doc.metadata.aiSummary}
                </p>
                {doc.metadata.tags && doc.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {doc.metadata.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                )}
              </GlassPanel>
            )}
          </motion.div>

          {/* Sidebar / Interactive Overlays */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5 shrink-0">
              {[
                { id: "info", icon: Info, label: "Info" },
                { id: "comments", icon: MessageSquare, label: "Comments" },
                { id: "quizzes", icon: HelpCircle, label: "Quizzes", badge: quizzes.length },
                { id: "polls", icon: BarChart2, label: "Polls", badge: polls.length },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all relative ${activeTab === tab.id ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>
                  <tab.icon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                  {tab.badge ? <span className="absolute top-1 right-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 rounded-full">{tab.badge}</span> : null}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <GlassPanel className="flex-1 p-0 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                <AnimatePresence mode="wait">
                  {/* INFO TAB */}
                  {activeTab === "info" && (
                    <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Document Providence</h4>
                        <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Uploaded</span>
                            <span className="text-slate-300">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">By</span>
                            <span className="text-slate-300">{doc.uploadedBy}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Size</span>
                            <span className="text-slate-300">{formatBytes(doc.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Access Control</h4>
                        <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Roles</span>
                            <div className="flex gap-1">
                              {doc.accessRoles.map((r) => <span key={r} className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10">{r}</span>)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Download</span>
                            <span className={doc.downloadAllowed ? "text-emerald-400" : "text-rose-400"}>{doc.downloadAllowed ? "Enabled" : "Restricted"}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* COMMENTS TAB */}
                  {activeTab === "comments" && (
                    <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      {comments.length === 0 ? (
                        <div className="text-center py-10">
                          <MessageCircle className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No comments yet</p>
                        </div>
                      ) : (
                        comments.map((comment: any, i: number) => (
                          <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{comment.user?.name || "User"}</span>
                              {comment.timestamp ? (
                                <button onClick={() => setCurrentTime(comment.timestamp)} className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-blue-500/20 transition-colors">
                                  <Clock className="h-3 w-3" /> {formatTime(comment.timestamp)}
                                </button>
                              ) : <span className="text-[10px] text-slate-500">General</span>}
                            </div>
                            <p className="text-sm text-slate-300">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {/* QUIZZES TAB */}
                  {activeTab === "quizzes" && (
                    <motion.div key="quizzes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      {quizzes.length === 0 ? (
                        <div className="text-center py-10">
                          <HelpCircle className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No quizzes attached</p>
                        </div>
                      ) : (
                        quizzes.map((quiz: any, i: number) => {
                          const hasAnswered = quiz.responses?.some((r: any) => r.user === user?.id)
                          return (
                            <div key={i} className={`p-4 rounded-2xl border ${hasAnswered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-purple-500/5 border-purple-500/20"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${hasAnswered ? "text-emerald-400" : "text-purple-400"}`}>Quiz {i+1}</span>
                                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{formatTime(quiz.timestamp)}</span>
                              </div>
                              <p className="text-sm text-white font-medium mb-3">{quiz.question}</p>
                              <div className="space-y-2">
                                {quiz.options.map((opt: any, optIdx: number) => {
                                  const ans = quiz.responses?.find((r: any) => r.user === user?.id)
                                  const isSelected = ans?.selectedOption === optIdx
                                  return (
                                    <button key={optIdx} disabled={hasAnswered} onClick={() => handleQuizAnswer(quiz._id, optIdx)} className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all ${
                                      hasAnswered ? (isSelected ? (ans.isCorrect ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-200" : "bg-rose-500/20 border-rose-500/30 text-rose-200") : "bg-white/5 border-white/5 text-slate-500") 
                                      : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                                    }`}>
                                      {opt.text}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </motion.div>
                  )}

                  {/* POLLS TAB */}
                  {activeTab === "polls" && (
                    <motion.div key="polls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      {polls.length === 0 ? (
                        <div className="text-center py-10">
                          <BarChart2 className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No active polls</p>
                        </div>
                      ) : (
                        polls.map((poll: any, i: number) => {
                          const totalVotes = poll.options.reduce((sum: number, o: any) => sum + o.votes, 0)
                          const hasVoted = poll.voters?.includes(user?.id)
                          return (
                            <div key={i} className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-2xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Live Poll</span>
                                {poll.timestamp > 0 && <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{formatTime(poll.timestamp)}</span>}
                              </div>
                              <p className="text-sm text-white font-medium mb-3">{poll.question}</p>
                              <div className="space-y-2">
                                {poll.options.map((opt: any, optIdx: number) => {
                                  const pct = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0
                                  return (
                                    <button key={optIdx} disabled={hasVoted} onClick={() => handlePollVote(poll._id, optIdx)} className="w-full relative overflow-hidden rounded-xl border border-white/10 bg-white/5 h-10 transition-all hover:border-cyan-500/30">
                                      {hasVoted && <div className="absolute top-0 left-0 h-full bg-cyan-500/20 transition-all duration-1000" style={{ width: `${pct}%` }} />}
                                      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs z-10">
                                        <span className="text-white">{opt.text}</span>
                                        {hasVoted && <span className="text-cyan-300 font-mono">{pct.toFixed(0)}%</span>}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Footer for Comments */}
              <AnimatePresence>
                {activeTab === "comments" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4 border-t border-white/5 bg-black/40">
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={`Add comment at ${formatTime(currentTime)}...`} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 rounded font-mono">{formatTime(currentTime)}</span>
                      </div>
                      <button type="submit" disabled={!newComment.trim()} className="bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl px-4 flex items-center justify-center hover:bg-blue-500/30 transition-colors disabled:opacity-50">
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
