import { create } from "zustand"

export type UserRole = "viewer" | "editor" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  token?: string
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
  extractedText?: string
  metadata?: Record<string, unknown>
}

export interface AccessLogEntry {
  id: string
  userId: string
  userName: string
  documentId: string
  documentTitle: string
  action: "view" | "download" | "upload" | "delete"
  timestamp: string
  ip?: string
  granted: boolean
}

export interface Workspace {
  id: string
  name: string
  description?: string
  owner: string | { _id: string; name: string; email: string }
  members: Array<{
    user: string | { _id: string; name: string; email: string };
    role: UserRole
  }>
}

export interface Folder {
  id: string
  name: string
  workspace: string
  parent?: string
  path: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  createdAt: string
  isRead: boolean
}

interface AppState {
  user: User | null
  documents: Document[]
  workspaces: Workspace[]
  folders: Folder[]
  notifications: Notification[]
  accessLogs: AccessLogEntry[]
  analytics: any | null
  isIdle: boolean
  selectedWorkspaceId: string | null

  setUser: (user: User | null) => void
  setDocuments: (docs: Document[]) => void
  addDocument: (doc: Document) => void
  removeDocument: (id: string) => void

  setWorkspaces: (workspaces: Workspace[]) => void
  addWorkspace: (workspace: Workspace) => void
  setSelectedWorkspaceId: (id: string | null) => void

  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void

  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void

  setAccessLogs: (logs: AccessLogEntry[]) => void
  addAccessLog: (log: AccessLogEntry) => void

  setAnalytics: (data: any) => void
  setIdle: (idle: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  documents: [],
  workspaces: [],
  folders: [],
  notifications: [],
  accessLogs: [],
  analytics: null,
  isIdle: false,
  selectedWorkspaceId: null,

  setUser: (user) => set({ user }),
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  setWorkspaces: (workspaces) => set({ workspaces }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
  setSelectedWorkspaceId: (id) => set({ selectedWorkspaceId: id }),

  setFolders: (folders) => set({ folders }),
  addFolder: (folder) =>
    set((state) => ({ folders: [...state.folders, folder] })),

  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  setAccessLogs: (accessLogs) => set({ accessLogs }),
  addAccessLog: (log) =>
    set((state) => ({ accessLogs: [log, ...state.accessLogs] })),

  setAnalytics: (analytics) => set({ analytics }),
  setIdle: (isIdle) => set({ isIdle }),
}))
