"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  FileText,
  Video,
  ImageIcon,
  Search,
  Filter,
  Download,
  Lock,
  Clock,
  Grid3X3,
  List,
  Share2,
  Sparkles,
  Brain,
  X,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Folder as FolderIcon,
  Plus,
  Layout,
  ExternalLink,
  ShieldCheck,
  SearchIcon,
  Zap,
  Trash2
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore, type Document, type UserRole } from "@/stores/app-store"

type ViewMode = "grid" | "list" | "mesh"
type TypeFilter = "all" | "video" | "document" | "image"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}
function KnowledgeMesh({ items }: { items: Document[] }) {
  if (items.length === 0) return (
    <div className="flex h-[500px] items-center justify-center rounded-3xl border border-dashed border-white/10">
      <p className="text-sm text-muted-foreground italic">No semantic nodes to map</p>
    </div>
  );

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-[2.5rem] bg-black/40 border border-white/5 shadow-2xl backdrop-blur-3xl group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.08),transparent)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {items.map((item, i) => {
          const next = items[(i + 1) % items.length];
          const x1 = 100 + (Math.cos(i * 2 * Math.PI / items.length) * 220) + 300;
          const y1 = 100 + (Math.sin(i * 2 * Math.PI / items.length) * 220) + 220;
          const x2 = 100 + (Math.cos(((i + 1) % items.length) * 2 * Math.PI / items.length) * 220) + 300;
          const y2 = 100 + (Math.sin(((i + 1) % items.length) * 2 * Math.PI / items.length) * 220) + 220;

          return (
            <motion.line
              key={`line-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--primary)"
              strokeWidth="1"
              strokeOpacity="0.15"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.1, ease: "easeInOut" }}
            />
          )
        })}
      </svg>

      <div className="relative flex h-full w-full items-center justify-center">
        {items.map((item, i) => {
          const x = (Math.cos(i * 2 * Math.PI / items.length) * 240);
          const y = (Math.sin(i * 2 * Math.PI / items.length) * 240);

          return (
            <motion.div
              key={item.id}
              className="absolute z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ x, y, scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.15, zIndex: 50 }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              <div className="relative group cursor-pointer">
                {/* Connection Glow */}
                <div className="absolute -inset-8 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Node UI */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                  {item.type === 'video' ? <Video className="h-7 w-7 text-primary/80" /> :
                    item.type === 'image' ? <ImageIcon className="h-7 w-7 text-primary/80" /> :
                      <FileText className="h-7 w-7 text-primary/80" />}

                  {/* Verification Badge */}
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0a0a0a] flex items-center justify-center shadow-lg">
                    <ShieldCheck className="h-2 w-2 text-white" />
                  </div>
                </div>

                {/* Tooltip Card */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
                  <div className="rounded-xl bg-black/90 p-3 border border-white/10 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{item.title}</span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-muted-foreground">
                      <span>{formatBytes(item.size)}</span>
                      <span className="uppercase text-primary font-bold">Verified Node</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5 flex gap-1">
                      <div className="h-1 flex-1 bg-primary/30 rounded-full" />
                      <div className="h-1 flex-1 bg-primary/10 rounded-full" />
                      <div className="h-1 flex-1 bg-primary/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Central Core */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative z-20 flex h-36 w-36 items-center justify-center rounded-full border border-primary/20 bg-primary/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]"
        >
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent,var(--primary),transparent)] opacity-20 animate-[spin_10s_linear_infinite]" />
          <div className="text-center relative z-10">
            <Brain className="mx-auto mb-2 h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence</p>
            <p className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1">Unified Vault</p>
          </div>
        </motion.div>

        {/* Floating Particle Decorations */}
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute h-1 w-1 rounded-full bg-primary/40"
            animate={{
              x: [Math.random() * 600 - 300, Math.random() * 600 - 300],
              y: [Math.random() * 400 - 200, Math.random() * 400 - 200],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}

function DocumentCard({ doc }: { doc: Document }) {
  const user = useAppStore((s) => s.user)
  const hasAccess = user && doc.accessRoles.includes(user.role)

  return (
    <Link href={hasAccess ? `/viewer/${doc.id}` : "#"}>
      <GlassPanel
        className={`group relative p-4 transition-all ${hasAccess ? "cursor-pointer hover:border-primary/20" : "cursor-not-allowed opacity-60"}`}
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            {doc.type === "video" ? (
              <Video className="h-4 w-4 text-primary" />
            ) : doc.type === "image" ? (
              <ImageIcon className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {hasAccess && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  alert("Secure share link generated! (Simulation)");
                }}
                className="rounded-md p-1 hover:bg-white/5 text-muted-foreground/30 hover:text-primary transition-colors"
                title="Create Share Link"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            )}
            {doc.downloadAllowed && hasAccess && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const fileUrl = doc.metadata?.fileUrl as string;
                  if (!fileUrl) return;
                  try {
                    const res = await fetch(fileUrl);
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = doc.title;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } catch (err) {
                    console.error("Download failed", err);
                  }
                }}
                className="rounded-md p-1 hover:bg-white/5 text-muted-foreground/30 hover:text-primary transition-colors"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
            {!hasAccess && <Lock className="h-3.5 w-3.5 text-destructive/60" />}
          </div>
        </div>
        <h3 className="mb-1 truncate text-sm text-foreground">{doc.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatBytes(doc.size)}</span>
          <span className="text-border">{"/"}</span>
          <span className="capitalize">{doc.type}</span>
        </div>
        {doc.expiresAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
            <Clock className="h-3 w-3" />
            <span>Exp {new Date(doc.expiresAt).toLocaleDateString()}</span>
          </div>
        )}
        <div className="mt-2 flex gap-1">
          {doc.accessRoles.map((role) => (
            <span
              key={role}
              className="rounded bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary/60"
            >
              {role}
            </span>
          ))}
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
      <div
        className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${hasAccess ? "cursor-pointer hover:bg-primary/5" : "cursor-not-allowed opacity-60"}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
          {doc.type === "video" ? (
            <Video className="h-3.5 w-3.5 text-primary" />
          ) : doc.type === "image" ? (
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{doc.title}</p>
        </div>
        <span className="text-xs text-muted-foreground">{formatBytes(doc.size)}</span>
        <span className="hidden text-xs capitalize text-muted-foreground sm:inline">
          {doc.type}
        </span>
        <div className="flex items-center gap-1">
          {!hasAccess && <Lock className="h-3.5 w-3.5 text-destructive/60" />}
        </div>
      </div>
    </Link>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}



export default function LibraryPage() {
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  const setDocuments = useAppStore((s) => s.setDocuments)
  const workspaces = useAppStore((s) => s.workspaces)
  const setWorkspaces = useAppStore((s) => s.setWorkspaces)
  const folders = useAppStore((s) => s.folders)
  const setFolders = useAppStore((s) => s.setFolders)

  const selectedWorkspace = useAppStore((s) => s.selectedWorkspaceId)
  const setSelectedWorkspace = useAppStore((s) => s.setSelectedWorkspaceId)

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Semantic Search State
  const [isSearching, setIsSearching] = useState(false)
  const [showSemanticResults, setShowSemanticResults] = useState(false)
  const [semanticResults, setSemanticResults] = useState<any[]>([])
  const [semanticSummary, setSemanticSummary] = useState("")

  const [semanticError, setSemanticError] = useState<string | null>(null)

  // Creation States
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer")

  const handleInviteMember = async () => {
    if (!inviteEmail || !selectedWorkspace || !user) return
    try {
      const res = await fetch("http://localhost:5000/api/workspaces/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace,
          email: inviteEmail,
          role: inviteRole
        })
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || "Invitation failed")
        return
      }

      // Refresh workspaces to get new members list
      const wsRes = await fetch("http://localhost:5000/api/workspaces", {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
      const wsData = await wsRes.json()
      setWorkspaces(wsData.map((w: any) => ({
        id: w._id,
        name: w.name,
        description: w.description,
        owner: w.owner,
        members: w.members
      })))

      setIsInviting(false)
      setInviteEmail("")
      console.log("Member invited successfully");
    } catch (err) {
      console.error("Invite failed", err)
    }
  }

  const handleCreateWorkspace = async (name: string) => {
    if (!name || !user) return
    try {
      const res = await fetch("http://localhost:5000/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ name, description: "New project workspace" })
      })
      if (!res.ok) throw new Error("Failed to create workspace")
      const newWs = await res.json()

      // Refresh workspaces
      const wsRes = await fetch("http://localhost:5000/api/workspaces", {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
      const wsData = await wsRes.json()
      setWorkspaces(wsData.map((w: any) => ({
        id: w._id,
        name: w.name,
        description: w.description,
        owner: w.owner,
        members: w.members
      })))

      setIsCreatingWorkspace(false)
      setSelectedWorkspace(newWs._id)
    } catch (err) {
      console.error("Workspace creation failed", err)
    }
  }

  const [isDecryptingWorkspace, setIsDecryptingWorkspace] = useState(false)

  const handleSelectWorkspace = useCallback((id: string | null) => {
    if (id === selectedWorkspace) return
    setIsDecryptingWorkspace(true)
    setSelectedWorkspace(id)
    setSelectedFolder(null)
    setTimeout(() => setIsDecryptingWorkspace(false), 1200)
  }, [selectedWorkspace])

  const handleDeleteWorkspace = async (id: string) => {
    if (!user || !confirm("Erase all data in this secure enclave?")) return
    try {
      const res = await fetch(`http://localhost:5000/api/workspaces/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user.token}` }
      })
      if (!res.ok) throw new Error("Deletion failed")

      setWorkspaces(workspaces.filter(ws => ws.id !== id))
      if (selectedWorkspace === id) setSelectedWorkspace(null)
    } catch (err) {
      console.error("Workspace deletion error", err)
    }
  }

  const handleCreateFolder = async (name: string) => {
    if (!name || !selectedWorkspace || !user) return
    try {
      const res = await fetch("http://localhost:5000/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ name, workspaceId: selectedWorkspace })
      })
      if (!res.ok) throw new Error("Failed to create folder")

      // Refresh folders
      const folderRes = await fetch(`http://localhost:5000/api/folders?workspaceId=${selectedWorkspace}`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
      const fData = await folderRes.json()
      setFolders(fData.map((f: any) => ({
        id: f._id,
        name: f.name,
        workspace: f.workspace,
        parent: f.parent,
        path: f.path
      })))
      setIsCreatingFolder(false)
    } catch (err) {
      console.error("Folder creation failed", err)
    }
  }

  const handleSemanticSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    console.log("Starting semantic search for:", search)
    if (!search) {
      console.warn("No search query provided")
      return
    }
    if (!user) {
      console.error("No user authenticated")
      return
    }

    setIsSearching(true)
    setShowSemanticResults(true)
    setSemanticError(null)

    try {
      const res = await fetch("http://localhost:5000/api/search/semantic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          query: search,
          workspaceId: selectedWorkspace
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Search failed")
      }

      const data = await res.json()
      console.log("Semantic search results:", data)
      setSemanticResults(data.matches || [])
      setSemanticSummary(data.summary || "")
    } catch (err: any) {
      console.error("Semantic search failed:", err)
      setSemanticError(err.message || "Failed to connect to AI engine")
    } finally {
      setIsSearching(false)
    }
  }

  // Fetch data
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const query = new URLSearchParams()
        if (selectedWorkspace) query.append("workspaceId", selectedWorkspace)
        if (selectedFolder) query.append("folderId", selectedFolder)

        const [wsRes, folderRes, docRes] = await Promise.all([
          fetch("http://localhost:5000/api/workspaces", { headers: { "Authorization": `Bearer ${user.token}` } }),
          selectedWorkspace
            ? fetch(`http://localhost:5000/api/folders?workspaceId=${selectedWorkspace}`, { headers: { "Authorization": `Bearer ${user.token}` } })
            : Promise.resolve({ json: () => [] }),
          fetch(`http://localhost:5000/api/models?${query.toString()}`, {
            headers: { "Authorization": `Bearer ${user.token}` }
          })
        ])

        const wsData = await wsRes.json()
        const fData = await (folderRes as Response).json()
        const docData = await docRes.json()

        setWorkspaces(wsData.map((w: any) => ({
          id: w._id,
          name: w.name,
          description: w.description,
          owner: w.owner,
          members: w.members
        })))

        setFolders(fData.map((f: any) => ({
          id: f._id,
          name: f.name,
          workspace: f.workspace,
          parent: f.parent,
          path: f.path
        })))

        setDocuments(docData.map((d: any) => ({
          id: d._id,
          title: d.title,
          type: "document",
          mimeType: d.mimeType,
          size: d.size,
          uploadedAt: d.createdAt,
          expiresAt: null,
          uploadedBy: d.uploadedBy?.name || 'Unknown',
          accessRoles: ["admin", "editor", "viewer"], // Simplified
          downloadAllowed: true,
          metadata: {
            isEncrypted: d.isEncrypted,
            version: d.version,
            fileUrl: `http://localhost:5000/uploads/${d.fileUrl}?token=${user.token}`
          }
        })))
      } catch (err) {
        console.error("Fetch failed", err)
      }
    }
    fetchData()
  }, [user, selectedWorkspace, selectedFolder, setWorkspaces, setFolders, setDocuments])

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [documents, search, typeFilter])

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-8 md:px-8 relative">
      <AnimatePresence>
        {isDecryptingWorkspace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
              >
                <Lock className="h-8 w-8 text-primary" />
              </motion.div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary animate-pulse font-mono">Decrypting Secure Enclave...</p>
              <div className="mt-4 h-1 w-48 mx-auto bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl text-foreground/90 font-bold tracking-tight">
            {selectedFolder
              ? folders.find(f => f.id === selectedFolder)?.name
              : selectedWorkspace
                ? workspaces.find(w => w.id === selectedWorkspace)?.name
                : "Content Library"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} items &middot; {selectedFolder ? "Folder View" : selectedWorkspace ? "Workspace View" : "System-wide View"}
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <form onSubmit={handleSemanticSearch} className="relative z-10 flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selectedWorkspace ? "Search in this workspace..." : "Search across all vaults..."}
              className="w-full rounded-xl border border-border/30 bg-white/5 py-2.5 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground/30 transition-all focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 backdrop-blur-xl"
              aria-label="Search documents"
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-lg p-1.5 transition-all flex items-center justify-center border ${search.trim()
                ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]"
                : "bg-white/5 border-white/10 text-muted-foreground opacity-50"
                }`}
              title="AI Semantic Search"
              disabled={isSearching || !search.trim()}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </form>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border/30 p-0.5 bg-white/5">
              {(["all", "document", "video", "image"] as TypeFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${typeFilter === t
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                >
                  {t === "all" ? "All" : <span className="capitalize">{t}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border/30 p-0.5 bg-white/5">
              {[
                { id: "grid", icon: Grid3X3 },
                { id: "list", icon: List },
                { id: "mesh", icon: Share2 },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id as ViewMode)}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === view.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
                  aria-label={`${view.id} view`}
                >
                  <view.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Semantic Search UI */}
        <AnimatePresence>
          {showSemanticResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <GlassPanel glow className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-sm font-semibold tracking-wide text-foreground">AI Intelligence Report</h2>
                  </div>
                  <button
                    onClick={() => setShowSemanticResults(false)}
                    className="rounded-full p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary/40" />
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest text-[10px]">Consulting semantic index...</p>
                  </div>
                ) : semanticError ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="mb-3 h-6 w-6 text-amber-500/50" />
                    <p className="text-sm text-amber-200/60 font-medium">{semanticError}</p>
                    <button
                      onClick={() => handleSemanticSearch()}
                      className="mt-4 text-xs text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {semanticSummary && (
                      <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{semanticSummary}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source References</h3>
                      {semanticResults.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No relevant fragments found.</p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {semanticResults.map((res: any, idx: number) => (
                            <div key={idx} className="rounded-xl border border-border/20 bg-black/20 p-3 hover:border-primary/30 transition-colors">
                              <p className="mb-2 line-clamp-3 text-[11px] text-muted-foreground leading-relaxed italic">"{res.text}"</p>
                              <div className="flex items-center justify-between border-t border-border/10 pt-2">
                                <span className="truncate text-[10px] font-medium text-primary/70">{res.documentTitle}</span>
                                <span className="text-[9px] text-muted-foreground/40 font-mono">{(res.score * 100).toFixed(0)}% Match</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content View */}
        <div className="mb-24">
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((doc) => (
                  <motion.div key={doc.id} variants={itemVariants}>
                    <DocumentCard doc={doc} />
                  </motion.div>
                ))}
              </motion.div>
            ) : viewMode === "list" ? (
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <GlassPanel className="divide-y divide-border/10 overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="py-20 text-center">
                      <Search className="mx-auto h-8 w-8 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground">No matches found in this view</p>
                    </div>
                  ) : (
                    filtered.map((doc) => (
                      <motion.div key={doc.id} variants={itemVariants}>
                        <DocumentRow doc={doc} />
                      </motion.div>
                    ))
                  )}
                </GlassPanel>
              </motion.div>
            ) : (
              <motion.div
                key="mesh"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <KnowledgeMesh items={filtered} />
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length === 0 && viewMode !== "list" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No results found for your selection</p>
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); }}
                className="mt-3 text-xs text-primary hover:underline font-bold uppercase tracking-widest"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
