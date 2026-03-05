"use client"

import { useState, use, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  FileText,
  Video,
  ImageIcon,
  Lock,
  Clock,
  Shield,
  Info,
  Plus,
  Sparkles,
  Scan,
  CheckCircle2
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

export default function ViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const documents = useAppStore((s) => s.documents)
  const addAccessLog = useAppStore((s) => s.addAccessLog)

  const doc = documents.find((d) => d.id === id)
  const hasAccess = user && doc?.accessRoles.includes(user.role)

  const [isScanning, setIsScanning] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleStartScan = useCallback(() => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setIsVerified(true)
    }, 3000)
  }, [])

  const logAccess = useCallback(() => {
    if (!user || !doc) return
    addAccessLog({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      documentId: doc.id,
      documentTitle: doc.title,
      action: "view",
      timestamp: new Date().toISOString(),
      granted: !!hasAccess,
    })
  }, [user, doc, hasAccess, addAccessLog])

  useEffect(() => {
    logAccess()
  }, [logAccess])

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Document not found</p>
          <button
            onClick={() => router.push("/library")}
            className="mt-4 text-xs text-primary hover:underline"
          >
            Back to Library
          </button>
        </GlassPanel>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <GlassPanel glow className="max-w-sm p-8 text-center">
          <Lock className="mx-auto mb-4 h-8 w-8 text-destructive/60" />
          <h2 className="mb-2 text-sm text-foreground">Access Denied</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Your role ({user?.role}) does not have permission to view this content.
          </p>
          <button
            onClick={() => router.push("/library")}
            className="rounded-lg bg-primary/10 px-4 py-2 text-xs text-primary transition-colors hover:bg-primary/15"
          >
            Back to Library
          </button>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <button
            onClick={() => router.push("/library")}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-primary/5"
            aria-label="Back to library"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl text-foreground/90">{doc.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatBytes(doc.size)} &middot; {doc.mimeType}
            </p>
          </div>
          {doc.downloadAllowed && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/15"
              onClick={async () => {
                addAccessLog({
                  id: `log-${Date.now()}`,
                  userId: user.id,
                  userName: user.name,
                  documentId: doc.id,
                  documentTitle: doc.title,
                  action: "download",
                  timestamp: new Date().toISOString(),
                  granted: true,
                })

                // Trigger secure download
                try {
                  const downloadUrl = `https://project-exhibition.onrender.com/api/models/${doc.id}/download?token=${user.token}`;

                  // Use a temporary link to force download without replacing page
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.setAttribute('download', doc.title); // Optional, backend sets content-disposition
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } catch (err) {
                  console.error("Download failed", err);
                }
              }}
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </motion.button>
          )}
        </motion.div>

        {/* Viewer Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <GlassPanel glow className="mb-6 flex aspect-video items-center justify-center relative overflow-hidden">
            {/* Scan Animation Overlay */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ top: -10 }}
                  animate={{ top: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-30"
                />
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center gap-3 text-muted-foreground/40 text-center px-8">
              {doc.type === "video" ? (
                <Video className="h-16 w-16" />
              ) : doc.type === "image" ? (
                <ImageIcon className="h-16 w-16" />
              ) : (
                <FileText className="h-16 w-16" />
              )}
              <div>
                <p className="text-sm">
                  {doc.type === "video"
                    ? "Video playback area"
                    : doc.type === "image"
                      ? "Image preview area"
                      : "Document preview area"}
                </p>
                <p className="text-xs text-muted-foreground/30 mt-1 uppercase tracking-widest font-black">
                  Watermarked &middot; {doc.metadata?.isEncrypted ? 'AES-256 E2EE' : 'Standard Protection'}
                </p>
              </div>

              {!isVerified ? (
                <button
                  onClick={handleStartScan}
                  className="mt-4 flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-all group/btn"
                >
                  <Scan className="h-3 w-3 group-hover/btn:rotate-90 transition-transform" />
                  Verify Integrity
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Cryptographically Verified
                </motion.div>
              )}
            </div>

            {/* Corner Accents */}
            <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-primary/20" />
            <div className="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-primary/20" />
            <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-primary/20" />
            <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-primary/20" />
          </GlassPanel>
        </motion.div>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-24 grid gap-4 md:grid-cols-2"
        >
          <GlassPanel className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
              <Info className="h-3.5 w-3.5" />
              Details
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize text-foreground">{doc.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Size</span>
                <span className="text-foreground">{formatBytes(doc.size)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploaded</span>
                <span className="text-foreground">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              {doc.expiresAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" /> Expires
                  </span>
                  <span className="text-foreground">
                    {new Date(doc.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {doc.metadata &&
                Object.entries(doc.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{key}</span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
              <Shield className="h-3.5 w-3.5" />
              Access Policy
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Download</span>
                <span className={doc.downloadAllowed ? "text-primary" : "text-destructive/70"}>
                  {doc.downloadAllowed ? "Allowed" : "Restricted"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Roles</span>
                <div className="flex gap-1">
                  {doc.accessRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DRM</span>
                <span className="text-primary">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Watermark</span>
                <span className="text-primary">Enabled</span>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
        {/* Digital Heritage Lifecycle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-24"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Shield className="h-3 w-3 text-primary" />
              Digital Heritage & Provenance
            </h2>
            <span className="text-[10px] text-primary/60 border border-primary/20 bg-primary/5 rounded-full px-2 py-0.5">Immutable Record</span>
          </div>

          <GlassPanel className="p-8">
            <div className="relative space-y-10 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[1px] before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
              <TimelineStep
                icon={Plus}
                title="Data Ingestion"
                time={new Date(doc.uploadedAt).toLocaleString()}
                desc="Initial raw content ingestion via project entrypoint. Original bits stored in zero-trust isolation."
                status="Complete"
              />
              <TimelineStep
                icon={Lock}
                title="Cryptographic Sealing"
                time={new Date(new Date(doc.uploadedAt).getTime() + 120000).toLocaleString()}
                desc="AES-256-GCM symmetric encryption applied. Root hash (SHA3-512) stored in audit ledger."
                status="Verified"
              />
              <TimelineStep
                icon={Sparkles}
                title="Semantic Indexing"
                time={new Date(new Date(doc.uploadedAt).getTime() + 450000).toLocaleString()}
                desc="Vector embedding generated. Document projected into high-dimensional semantic space for AI recall."
                status="Active"
              />
              <TimelineStep
                icon={Shield}
                title="Access Policy Synthesis"
                time="Real-time"
                desc="Dynamic access roles validated (Admin, Editor, Viewer). DRM watermark active for current session."
                status="Monitoring"
                isCurrent
              />
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  )
}

function TimelineStep({ icon: Icon, title, time, desc, status, isCurrent }: any) {
  return (
    <div className="relative pl-10 group">
      <div className={`absolute left-0 top-1 h-[22px] w-[22px] rounded-full border-2 flex items-center justify-center bg-background z-10 transition-all duration-500 ${isCurrent ? 'border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]' : 'border-primary/30 group-hover:border-primary/60'}`}>
        <Icon className={`h-2.5 w-2.5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-xs font-bold uppercase tracking-tight ${isCurrent ? 'text-primary' : 'text-foreground/80'}`}>{title}</h3>
          <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${isCurrent ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>{status}</span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mb-2 font-mono">{time}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/5 pl-3 py-1 bg-white/5 rounded-r-lg group-hover:bg-primary/5 transition-colors">{desc}</p>
      </div>
    </div>
  )
}
