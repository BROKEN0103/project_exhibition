"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    Upload,
    Shield,
    Plus,
    Layout,
    FolderIcon,
    Settings,
    LogOut,
    Activity,
    Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"
import { logoutAction } from "@/app/auth/actions"
import { motion } from "framer-motion"

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const user = useAppStore((s) => s.user)
    const setUser = useAppStore((s) => s.setUser)
    const workspaces = useAppStore((s) => s.workspaces)
    const setSelectedWorkspaceId = useAppStore((s) => s.setSelectedWorkspaceId)

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/library", icon: BookOpen, label: "Vault Library" },
        { href: "/upload", icon: Upload, label: "Secure Ingest" },
        { href: "/access-control", icon: Shield, label: "Access Control" },
    ]

    const isAdmin = user?.role === "admin"

    async function handleLogout() {
        setUser(null)
        await logoutAction()
    }

    return (
        <div className="hidden w-72 border-r border-white/5 bg-black/40 backdrop-blur-2xl md:flex flex-col h-full shrink-0 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

            <div className="p-8 relative z-10">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform group-hover:scale-110">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-widest uppercase">
                            Vault
                        </h1>
                        <p className="text-[10px] text-blue-500 font-black tracking-[0.2em] -mt-1 uppercase">Sic Mundus</p>
                    </div>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 relative z-10">
                <div className="space-y-6 mb-10">
                    <div>
                        <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Infrastructure</p>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition-all duration-300 group relative",
                                            isActive
                                                ? "text-blue-400 bg-blue-500/5 border border-blue-500/10"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-blue-400" : "text-slate-500")} />
                                        <span className="font-semibold tracking-tight">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute left-0 w-1 h-4 bg-blue-500 rounded-full"
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {isAdmin && (
                        <div>
                            <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Security Admin</p>
                            <Link
                                href="/admin"
                                className={cn(
                                    "flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition-all duration-300 group",
                                    pathname.startsWith("/admin")
                                        ? "text-blue-400 bg-blue-500/5 border border-blue-500/10"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
                                <span className="font-semibold tracking-tight">System Core</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="px-4 py-6 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Load</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "34%" }}
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">0.42 TB/s ACTIVE_THRUPUT</p>
                </div>
            </div>

            <div className="p-6 relative z-10">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 mb-4 group hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-black text-white shadow-lg">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-blue-500/80 font-black tracking-widest uppercase">{user?.role} NODE</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors group rounded-xl hover:bg-rose-500/5"
                >
                    <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    TERMINATE SESSION
                </button>
            </div>
        </div>
    )
}
