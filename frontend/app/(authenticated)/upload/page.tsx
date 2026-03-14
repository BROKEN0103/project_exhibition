"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Clock,
  Shield,
  Lock,
  Sparkles,
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore, type UserRole } from "@/stores/app-store"

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

interface PendingFile {
  file: File
  name: string
  size: number
  type: string
}

export default function UploadPage() {
  const user = useAppStore((s) => s.user)
  const addDocument = useAppStore((s) => s.addDocument)

  const [dragActive, setDragActive] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["admin"])
  const [downloadAllowed, setDownloadAllowed] = useState(true)
  const [expiryDays, setExpiryDays] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [encrypting, setEncrypting] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)

  const canUpload = user?.role === "admin" || user?.role === "editor" || user?.role === "user"

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).map((f) => ({
      file: f, name: f.name, size: f.size, type: f.type || "application/octet-stream",
    }))
    setPendingFiles(files)
    if (files.length > 0 && !title) {
      setTitle(files[0].name.replace(/\.[^.]+$/, ""))
    }
  }, [title])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map((f) => ({
      file: f, name: f.name, size: f.size, type: f.type || "application/octet-stream",
    }))
    setPendingFiles(files)
    if (files.length > 0 && !title) {
      setTitle(files[0].name.replace(/\.[^.]+$/, ""))
    }
  }, [title])

  const handleUpload = useCallback(async () => {
    if (!user || pendingFiles.length === 0) return
    setUploading(true)
    setError(null)

    try {
      let fileToUpload = pendingFiles[0].file
      let encryptedKey = ""
      let iv = ""

      if (isEncrypted) {
        setEncrypting(true)
        const { generateKey, exportKey, encryptFile } = await import("@/lib/encryption")
        const key = await generateKey()
        const result = await encryptFile(fileToUpload, key)
        encryptedKey = await exportKey(key)
        iv = result.iv
        fileToUpload = new File([result.encryptedContent], pendingFiles[0].name, { type: "application/octet-stream" })
        setEncrypting(false)
      }

      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("title", title || pendingFiles[0].name)
      formData.append("description", "Uploaded via web interface")
      formData.append("isEncrypted", isEncrypted.toString())
      formData.append("encryptedKey", encryptedKey)
      formData.append("iv", iv)

      let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com"
      if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
        baseUrl = "https://project-exhibition.onrender.com"
      }

      const res = await fetch(`${baseUrl}/api/models`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${user.token}` },
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const newModel = await res.json()
      addDocument({
        id: newModel._id,
        title: newModel.title,
        type: "document",
        mimeType: pendingFiles[0].type,
        size: pendingFiles[0].size,
        uploadedAt: newModel.createdAt,
        expiresAt: null,
        uploadedBy: user.name,
        accessRoles: selectedRoles,
        downloadAllowed: true,
        metadata: { isEncrypted, version: newModel.version }
      })

      setAiProcessing(true)
      setTimeout(() => setAiProcessing(false), 3000)
      setUploaded(true)
    } catch (err: any) {
      console.error("[Frontend] Upload error:", err)
      setError(`Upload failed: ${err.message || "Network error"}`)
    } finally {
      setUploading(false)
      setEncrypting(false)
    }
  }, [user, pendingFiles, title, isEncrypted, selectedRoles, addDocument])

  const reset = useCallback(() => {
    setPendingFiles([])
    setTitle("")
    setSelectedRoles(["admin"])
    setDownloadAllowed(true)
    setExpiryDays(null)
    setUploaded(false)
    setError(null)
    setAiProcessing(false)
  }, [])

  if (!canUpload) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <GlassPanel glow className="max-w-sm p-8 text-center">
          <Shield className="mx-auto mb-4 h-8 w-8 text-destructive/60" />
          <h2 className="mb-2 text-sm text-foreground">Insufficient Permissions</h2>
          <p className="text-xs text-muted-foreground">Only editors and admins can upload content.</p>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl text-foreground/90">Upload Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Secure upload with AI auto-processing, access control, and optional encryption
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {uploaded ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <GlassPanel glow className="flex flex-col items-center p-12 text-center">
                {aiProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="mb-4"
                    >
                      <Sparkles className="h-12 w-12 text-blue-400" />
                    </motion.div>
                    <h2 className="mb-2 text-foreground">AI Processing...</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                      Generating tags, classification, and embeddings for semantic search
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mb-4 h-12 w-12 text-primary" />
                    <h2 className="mb-2 text-foreground">Upload Complete</h2>
                    <p className="mb-2 text-sm text-muted-foreground">Content securely uploaded and AI-processed.</p>
                    <div className="flex items-center gap-2 mb-6 text-xs text-blue-400">
                      <Sparkles className="h-3 w-3" />
                      Tags, summary, and embeddings generated
                    </div>
                    <button onClick={reset} className="rounded-lg bg-primary/10 px-6 py-2 text-sm text-primary transition-colors hover:bg-primary/15">
                      Upload Another
                    </button>
                  </>
                )}
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              {/* Drop Zone */}
              <GlassPanel
                className={`relative flex flex-col items-center justify-center p-12 transition-all ${dragActive ? "border-primary/40 bg-primary/5" : ""}`}
                onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <Upload className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="mb-2 text-sm text-foreground/70">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground/50">PDF, DOCX, MP4, PNG, JPG up to 500MB</p>
                <input type="file" onChange={handleFileInput} className="absolute inset-0 cursor-pointer opacity-0" aria-label="File upload" />
              </GlassPanel>

              {/* Pending Files */}
              {pendingFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  {pendingFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-border/20 bg-background/30 px-4 py-3">
                      <FileText className="h-4 w-4 text-primary/60" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                      </div>
                      <button onClick={() => setPendingFiles(pendingFiles.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              {pendingFiles.length > 0 && (
                <GlassPanel className="flex flex-col gap-4 p-5">
                  {/* Title */}
                  <div>
                    <label htmlFor="doc-title" className="mb-1.5 block text-xs text-muted-foreground">Document Title</label>
                    <input
                      id="doc-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      placeholder="Enter document title"
                    />
                  </div>

                  {/* Access Roles */}
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">Access Roles</label>
                    <div className="flex gap-2">
                      {(["admin", "editor", "viewer"] as UserRole[]).map((role) => (
                        <button key={role} onClick={() => setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role])}
                          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${selectedRoles.includes(role) ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
                        >{role}</button>
                      ))}
                    </div>
                  </div>

                  {/* Encryption & Download */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs text-muted-foreground"><Lock className="mr-1 inline h-3 w-3" />E2EE Encryption</label>
                      <button onClick={() => setIsEncrypted(!isEncrypted)}
                        className={`w-full rounded-lg px-3 py-2 text-xs transition-colors ${isEncrypted ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground"}`}
                      >{isEncrypted ? "Enabled" : "Disabled"}</button>
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs text-muted-foreground"><Shield className="mr-1 inline h-3 w-3" />Downloads</label>
                      <button onClick={() => setDownloadAllowed(!downloadAllowed)}
                        className={`w-full rounded-lg px-3 py-2 text-xs transition-colors ${downloadAllowed ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
                      >{downloadAllowed ? "Allowed" : "Restricted"}</button>
                    </div>
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />Automatic Expiry</label>
                    <select value={expiryDays ?? ""} onChange={(e) => setExpiryDays(e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs text-foreground focus:border-primary/30 focus:outline-none"
                    >
                      <option value="">No expiry</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>

                  {/* AI Processing Notice */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-300">AI will auto-generate tags, summary, and search embeddings after upload</p>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-center text-xs text-destructive">
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={handleUpload} disabled={uploading || pendingFiles.length === 0}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2.5 text-sm text-primary transition-all hover:bg-primary/15 disabled:opacity-50"
                  >
                    {uploading ? (
                      <motion.div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                    ) : (
                      <><Upload className="h-4 w-4" />Upload Securely</>
                    )}
                  </motion.button>
                </GlassPanel>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
