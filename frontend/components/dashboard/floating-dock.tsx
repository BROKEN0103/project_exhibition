"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Upload,
  Shield,
  Settings,
  LayoutDashboard,
  LogOut,
  Bell,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"
import { logoutAction } from "@/app/auth/actions"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/library", icon: BookOpen, label: "Library" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/access-control", icon: Shield, label: "Access Control" },
]

const adminItem = { href: "/admin", icon: Settings, label: "Admin" }

export function FloatingDock() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const notifications = useAppStore((s) => s.notifications)
  const setNotifications = useAppStore((s) => s.setNotifications)
  const markAsRead = useAppStore((s) => s.markNotificationRead)

  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { "Authorization": `Bearer ${user.token}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setNotifications(data.map((n: any) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            createdAt: n.createdAt,
            isRead: n.isRead
          })))
        } else {
          console.warn("Expected array for notifications, got:", data)
          setNotifications([])
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [user, setNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function handleLogout() {
    setUser(null)
    await logoutAction()
  }

  async function handleMarkRead(id: string) {
    if (!user) return
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${user.token}` }
      })
      markAsRead(id)
    } catch (err) {
      console.error("Failed to mark read", err)
    }
  }

  const items = user?.role === "admin" ? [...navItems, adminItem] : navItems

  return (
    <motion.nav
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      aria-label="Main navigation"
    >
      <div className="glass-panel-strong glass-glow flex items-center gap-1 rounded-2xl px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="dock-active"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10 hidden md:inline">{item.label}</span>
            </Link>
          )
        })}

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all",
              showNotifications ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full right-0 mb-4 w-72 overflow-hidden rounded-2xl border border-border/50 bg-background/95 p-1 shadow-2xl backdrop-blur-xl md:right-auto md:left-1/2 md:-translate-x-1/2"
              >
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{unreadCount} New</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={cn(
                          "cursor-pointer p-3 transition-colors hover:bg-white/5",
                          !n.isRead && "bg-primary/5"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5">
                            {n.type === 'success' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                            {n.type === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                            {n.type === 'warning' && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                            {n.type === 'error' && <XCircle className="h-3 w-3 text-rose-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">{n.title}</p>
                            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{n.message}</p>
                            <p className="mt-2 text-[8px] text-muted-foreground/40">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-1 h-6 w-px bg-border/30" role="separator" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Exit</span>
        </button>
      </div>
    </motion.nav>
  )
}
