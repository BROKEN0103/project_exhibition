"use server"

import { cookies } from "next/headers"
import { getCookieName } from "@/lib/auth"
import type { Document, AccessLogEntry } from "@/stores/app-store"

export async function fetchDashboardData() {
    const cookieStore = await cookies()
    const token = cookieStore.get(getCookieName())?.value

    if (!token) return { documents: [], accessLogs: [], notifications: [] }

    const headers = { Authorization: `Bearer ${token}` }

    try {
        const [docsRes, logsRes, notifsRes] = await Promise.all([
            fetch("http://localhost:5000/api/models", { headers, cache: "no-store" }),
            fetch("http://localhost:5000/api/activities", { headers, cache: "no-store" }),
            fetch("http://localhost:5000/api/notifications", { headers, cache: "no-store" })
        ])

        if (!docsRes.ok || !logsRes.ok || !notifsRes.ok) {
            console.error("Failed to fetch dashboard data")
            return { documents: [], accessLogs: [], notifications: [] }
        }

        const docsData = await docsRes.json()
        const logsData = await logsRes.json()
        const notifsData = await notifsRes.json()

        const documents: Document[] = docsData.map((d: any) => ({
            id: d._id,
            title: d.title,
            type: "document",
            mimeType: d.mimeType || "application/octet-stream",
            size: d.size || 0,
            uploadedAt: d.createdAt,
            expiresAt: null,
            uploadedBy: d.uploadedBy?.name || "Unknown",
            accessRoles: ["viewer", "editor", "admin"],
            downloadAllowed: true,
            metadata: {
                isEncrypted: d.isEncrypted,
                version: d.version,
                fileUrl: `http://localhost:5000/uploads/${d.fileUrl}`
            }
        }))

        const accessLogs: AccessLogEntry[] = logsData.map((l: any) => ({
            id: l._id,
            userId: l.user || "unknown",
            userName: l.userName || "System",
            documentId: l.document || "",
            documentTitle: l.documentTitle || "System Event",
            action: l.action.toLowerCase(),
            timestamp: l.createdAt,
            granted: l.granted !== false,
        }))

        const notifications = notifsData.map((n: any) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            createdAt: n.createdAt,
            isRead: n.isRead
        }))

        return { documents, accessLogs, notifications }
    } catch (err) {
        console.error("Error in fetchDashboardData:", err)
        return { documents: [], accessLogs: [], notifications: [] }
    }
}
