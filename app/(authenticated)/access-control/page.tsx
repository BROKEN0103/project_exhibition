"use client"

import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  FileText,
  Video,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
  Lock,
  Check,
  Grid3x3,
  List,
  Filter,
  Users,
  Eye,
  EyeOff,
  Unlock,
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore, type Document, type UserRole } from "@/stores/app-store"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

function AccessRow({ doc }: { doc: Document }) {
  const [expanded, setExpanded] = useState(false)
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  const setDocuments = useAppStore((s) => s.setDocuments)

  const isAdminOrEditor = user?.role === "admin" || user?.role === "editor"

  const toggleRole = useCallback(
    (role: UserRole) => {
      if (!isAdminOrEditor) return
      const updated = documents.map((d) => {
        if (d.id !== doc.id) return d
        const roles = d.accessRoles.includes(role)
          ? d.accessRoles.filter((r) => r !== role)
          : [...d.accessRoles, role]
        return { ...d, accessRoles: roles }
      })
      setDocuments(updated)
    },
    [doc.id, documents, setDocuments, isAdminOrEditor]
  )

  const toggleDownload = useCallback(() => {
    if (!isAdminOrEditor) return
    const updated = documents.map((d) =>
      d.id === doc.id ? { ...d, downloadAllowed: !d.downloadAllowed } : d
    )
    setDocuments(updated)
  }, [doc.id, documents, setDocuments, isAdminOrEditor])

  return (
    <div className="border-b border-border/10 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-primary/3 group"
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
          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <span>{formatBytes(doc.size)}</span>
            <span className="text-border">•</span>
            <span className="capitalize">{doc.type}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {doc.accessRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20"
              >
                {role}
              </span>
            ))}
          </div>
          {doc.downloadAllowed ? (
            <Download className="h-3.5 w-3.5 text-emerald-500/60" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-amber-500/60" />
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/10 bg-gradient-to-b from-primary/[0.02] to-transparent px-5 py-5">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Role Access */}
                <div>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" /> Role Access Matrix
                  </p>
                  <div className="flex flex-col gap-2">
                    {(["admin", "editor", "viewer"] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        disabled={!isAdminOrEditor}
                        className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-all ${doc.accessRoles.includes(role)
                            ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
                            : "bg-white/5 text-muted-foreground border border-white/5 hover:border-white/10"
                          } ${!isAdminOrEditor ? "cursor-not-allowed opacity-50" : "hover:scale-[1.02] active:scale-[0.98]"}`}
                      >
                        <span className="flex items-center gap-2 font-medium capitalize">
                          {role === "admin" && <Shield className="h-3.5 w-3.5" />}
                          {role === "editor" && <Users className="h-3.5 w-3.5" />}
                          {role === "viewer" && <Eye className="h-3.5 w-3.5" />}
                          {role}
                        </span>
                        {doc.accessRoles.includes(role) && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Download className="h-3.5 w-3.5" /> Download Policy
                    </p>
                    <button
                      onClick={toggleDownload}
                      disabled={!isAdminOrEditor}
                      className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-all ${doc.downloadAllowed
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                        } ${!isAdminOrEditor ? "cursor-not-allowed opacity-50" : "hover:scale-[1.02] active:scale-[0.98]"}`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {doc.downloadAllowed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {doc.downloadAllowed ? "Downloads Enabled" : "Downloads Restricted"}
                      </span>
                    </button>
                  </div>
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Expiration
                    </p>
                    <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
                      <span className="text-sm text-foreground font-medium">
                        {doc.expiresAt
                          ? new Date(doc.expiresAt).toLocaleDateString()
                          : "No expiry set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AccessControlPage() {
  const documents = useAppStore((s) => s.documents)
  const user = useAppStore((s) => s.user)
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")

  const isAdminOrEditor = user?.role === "admin" || user?.role === "editor"

  const filteredDocs = useMemo(() => {
    if (roleFilter === "all") return documents
    return documents.filter(doc => doc.accessRoles.includes(roleFilter))
  }, [documents, roleFilter])

  const stats = useMemo(() => {
    return {
      total: documents.length,
      downloadEnabled: documents.filter(d => d.downloadAllowed).length,
      restricted: documents.filter(d => !d.downloadAllowed).length,
      expiring: documents.filter(d => d.expiresAt).length,
    }
  }, [documents])

  return (
    <div className="h-full overflow-y-auto px-4 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="flex items-center gap-2 text-xl text-foreground/90">
            <Shield className="h-5 w-5 text-primary/60" />
            Access Control Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdminOrEditor
              ? "Manage content permissions and access policies"
              : "View content access policies (read-only)"}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {[
            { label: "Total Files", value: stats.total, icon: FileText, color: "primary" },
            { label: "Download Enabled", value: stats.downloadEnabled, icon: Download, color: "emerald" },
            { label: "Restricted", value: stats.restricted, icon: Lock, color: "amber" },
            { label: "Expiring Soon", value: stats.expiring, icon: Clock, color: "rose" },
          ].map((stat) => (
            <GlassPanel key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassPanel>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1 rounded-lg border border-border/30 p-0.5">
              {(["all", "admin", "editor", "viewer"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${roleFilter === role
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {role === "all" ? "All Files" : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border/30 p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`rounded-md p-2 transition-colors ${viewMode === "matrix" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-24"
        >
          <GlassPanel className="overflow-hidden">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <EyeOff className="mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No files match the selected filter</p>
              </div>
            ) : (
              filteredDocs.map((doc) => <AccessRow key={doc.id} doc={doc} />)
            )}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  )
}
