import { create } from "zustand"

export type UserRole = "viewer" | "editor" | "admin" | "user"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  token: string
}

export interface Document {
  id: string
  title: string
  type: "video" | "document" | "image"
  mimeType: string
  size: number
  uploadedAt: string
  expiresAt: string | null
  uploadedBy: string
  accessRoles: UserRole[]
  downloadAllowed: boolean
  metadata?: Record<string, any>
}

export interface Notification {
  id: string
  message: string
  type: "info" | "warning" | "error"
  read: boolean
  createdAt: string
}

export interface AccessLogEntry {
  id: string
  userId: string
  userName: string
  documentId: string
  documentTitle: string
  action: string
  timestamp: string
  ipAddress: string
}

interface AppState {
  user: User | null
  documents: Document[]
  notifications: Notification[]
  accessLogs: AccessLogEntry[]

  setUser: (user: User | null) => void
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  removeDocument: (id: string) => void
  setNotifications: (notifications: Notification[]) => void
  addAccessLog: (entry: AccessLogEntry) => void
  setAccessLogs: (entries: AccessLogEntry[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  documents: [],
  notifications: [],
  accessLogs: [],

  setUser: (user) => set({ user }),
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [document, ...state.documents] })),
  removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
  setNotifications: (notifications) => set({ notifications }),
  addAccessLog: (entry) => set((state) => ({ accessLogs: [entry, ...state.accessLogs] })),
  setAccessLogs: (entries) => set({ accessLogs: entries }),
}))
