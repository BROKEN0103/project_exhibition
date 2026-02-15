"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    Upload,
    Activity,
    Shield,
    Plus,
    Layout,
    FolderIcon,
    ChevronRight,
    Settings,
    LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"
import { logoutAction } from "@/app/auth/actions"

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const user = useAppStore((s) => s.user)
    const setUser = useAppStore((s) => s.setUser)
    const workspaces = useAppStore((s) => s.workspaces)
    const selectedWorkspaceId = useAppStore((s) => s.selectedWorkspaceId)
    const setSelectedWorkspaceId = useAppStore((s) => s.setSelectedWorkspaceId)

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/library", icon: BookOpen, label: "Library" },
        { href: "/upload", icon: Upload, label: "Upload" },
        { href: "/activity", icon: Activity, label: "Activity" },
        { href: "/access-control", icon: Shield, label: "Access Control" },
    ]

    const isAdmin = user?.role === "admin"

    async function handleLogout() {
        const result = await logoutAction()
        setUser(null)
        if (result.redirect) {
            router.push(result.redirect)
        }
    }

    return (
        <div className="hidden w-64 border-r border-border/20 bg-background/50 backdrop-blur-md md:flex flex-col h-full shrink-0">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight">
                        SIC MUNDUS
                    </h1>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="space-y-1 mb-8">
                    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Navigation</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.label}
                            </Link>
                        )
                    })}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 group",
                                pathname.startsWith("/admin")
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                            Admin Panel
                        </Link>
                    )}
                </div>

                {pathname.startsWith("/library") && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between px-3 mb-2">
                                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                                    Vault Workspaces
                                </h2>
                                <button className="text-muted-foreground hover:text-primary transition-colors">
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedWorkspaceId(null)}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors",
                                        !selectedWorkspaceId ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/5"
                                    )}
                                >
                                    <Layout className="h-3.5 w-3.5" />
                                    Global Vault
                                </button>
                                {workspaces.map((ws) => (
                                    <button
                                        key={ws.id}
                                        onClick={() => setSelectedWorkspaceId(ws.id)}
                                        className={cn(
                                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors truncate group",
                                            selectedWorkspaceId === ws.id ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/5"
                                        )}
                                    >
                                        <FolderIcon className={cn("h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110", selectedWorkspaceId === ws.id ? "text-primary" : "text-muted-foreground")} />
                                        <span className="truncate">{ws.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border/10">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate capitalize">{user?.role} Access</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-2 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors group"
                >
                    <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
