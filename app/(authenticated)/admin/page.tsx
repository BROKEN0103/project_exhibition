"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Users,
  FileText,
  Trash2,
  Shield,
  HardDrive,
  AlertTriangle,
  Terminal,
  Globe,
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"
import { demoUsers, getStorageStats } from "@/lib/seed-data"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AdminPage() {
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  const removeDocument = useAppStore((s) => s.removeDocument)
  const addAccessLog = useAppStore((s) => s.addAccessLog)
  const accessLogs = useAppStore((s) => s.accessLogs)
  const stats = getStorageStats()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = useCallback(
    (docId: string) => {
      const doc = documents.find((d) => d.id === docId)
      if (!doc || !user) return
      removeDocument(docId)
      addAccessLog({
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        documentId: doc.id,
        documentTitle: doc.title,
        action: "delete",
        timestamp: new Date().toISOString(),
        granted: true,
      })
      setConfirmDelete(null)
    },
    [documents, user, removeDocument, addAccessLog]
  )

  if (user?.role !== "admin") {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <GlassPanel glow className="max-w-sm p-8 text-center">
          <Shield className="mx-auto mb-4 h-8 w-8 text-destructive/60" />
          <h2 className="mb-2 text-sm text-foreground">Admin Only</h2>
          <p className="text-xs text-muted-foreground">
            This section requires admin privileges.
          </p>
        </GlassPanel>
      </div>
    )
  }

  const deniedCount = accessLogs.filter((l) => !l.granted).length

  return (
    <div className="px-4 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="flex items-center gap-2 text-xl text-foreground/90">
            <Settings className="h-5 w-5 text-primary/60" />
            Administration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            System overview and content management
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >


          {/* System Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Users", value: demoUsers.length, icon: Users },
              { label: "Content", value: documents.length, icon: FileText },
              { label: "Storage", value: formatBytes(stats.usedStorage), icon: HardDrive },
              { label: "Denied", value: deniedCount, icon: AlertTriangle },
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <GlassPanel className="flex items-center gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                    <stat.icon className="h-4 w-4 text-primary/70" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>

          {/* Users */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="grid grid-cols-1 gap-6">
              <GlassPanel className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
                  <Users className="h-3.5 w-3.5" />
                  User Accounts
                </h2>
                <div className="flex flex-col gap-2">
                  {demoUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground font-medium">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] text-primary uppercase font-black tracking-tighter">
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>


            </div>
          </motion.div>

          {/* Content Management */}
          <motion.div variants={itemVariants} className="mb-24">
            <GlassPanel className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
                <FileText className="h-3.5 w-3.5" />
                Content Management
              </h2>
              <div className="flex flex-col gap-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-primary/3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.size)} &middot; {doc.accessRoles.join(", ")}
                      </p>
                    </div>
                    {confirmDelete === doc.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="rounded bg-destructive/15 px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/25"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(doc.id)}
                        className="text-muted-foreground/50 transition-colors hover:text-destructive"
                        aria-label={`Delete ${doc.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
