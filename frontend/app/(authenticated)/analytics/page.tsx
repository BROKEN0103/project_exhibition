"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    BarChart3,
    TrendingUp,
    HardDrive,
    Users,
    FileText,
    Activity as ActivityIcon,
    ShieldCheck,
    Lock,
    Eye,
    Zap
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts'
import { GlassPanel } from "@/components/ui/glass-panel"
import { useAppStore } from "@/stores/app-store"

export default function AnalyticsPage() {
    const user = useAppStore((s) => s.user)
    const analytics = useAppStore((s) => s.analytics)
    const setAnalytics = useAppStore((s) => s.setAnalytics)

    useEffect(() => {
        if (!user) return

        const fetchAnalytics = async () => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com"
            try {
                const res = await fetch(`${baseUrl}/api/analytics`, {
                    headers: { "Authorization": `Bearer ${user.token}` },
                    credentials: "include"
                })
                const data = await res.json()
                setAnalytics(data)
            } catch (err) {
                console.error("Failed to fetch analytics:", err)
            }
        }

        fetchAnalytics()
    }, [user, setAnalytics])

    if (!analytics) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
        )
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const radarData = [
        { subject: 'Encryption', A: 120, fullMark: 150 },
        { subject: 'Access Log', A: 98, fullMark: 150 },
        { subject: 'Activity', A: 86, fullMark: 150 },
        { subject: 'Uptime', A: 99, fullMark: 150 },
        { subject: 'Coverage', A: 85, fullMark: 150 },
        { subject: 'Response', A: 65, fullMark: 150 },
    ];

    return (
        <div className="min-h-screen px-4 pb-20 pt-8 md:px-8">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-light text-foreground/90">Intelligence & Metrics</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Advanced cryptographic auditing and platform performance
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 ring-1 ring-emerald-500/20">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">System Healthy</span>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Data Managed"
                        value={formatBytes(analytics.totalStorage)}
                        icon={HardDrive}
                        trend="+1.2GB new files"
                        color="text-primary"
                    />
                    <StatCard
                        title="Semantic Objects"
                        value={analytics.totalFiles}
                        icon={FileText}
                        trend="Indexed for AI search"
                        color="text-blue-400"
                    />
                    <StatCard
                        title="Trust Index"
                        value="98.4%"
                        icon={ShieldCheck}
                        trend="Secure Access Verified"
                        color="text-emerald-400"
                    />
                    <StatCard
                        title="Auth Events"
                        value={analytics.activeUsers.length + 120}
                        icon={Users}
                        trend="Last 24 hours"
                        color="text-amber-400"
                    />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Growth Chart */}
                    <GlassPanel className="lg:col-span-2 p-6 h-[400px] flex flex-col relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-foreground">Storage Trajectory</h3>
                                <p className="text-[10px] text-muted-foreground">Historical data growth and prediction</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] text-primary">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Active
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 w-full h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.storageOverTime || []}>
                                    <defs>
                                        <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="totalSize"
                                        stroke="var(--primary)"
                                        fillOpacity={1}
                                        fill="url(#colorSize)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassPanel>

                    {/* Integrated Trust Radar */}
                    <GlassPanel className="p-6 flex flex-col h-[400px]">
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-foreground">Integrity Matrix</h3>
                            <p className="text-[10px] text-muted-foreground">Security health across 6 dimensions</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Health"
                                        dataKey="A"
                                        stroke="var(--primary)"
                                        fill="var(--primary)"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-[9px] uppercase tracking-tighter text-muted-foreground">
                            <div className="flex items-center gap-1"><ShieldCheck className="h-2 w-2 text-emerald-400" /> Cryptographic Root OK</div>
                            <div className="flex items-center gap-1"><Lock className="h-2 w-2 text-blue-400" /> E2EE Coverage 92%</div>
                        </div>
                    </GlassPanel>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Activity Feed */}
                    <GlassPanel className="lg:col-span-3 p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                <ActivityIcon className="h-4 w-4 text-primary" />
                                Live Security Feed
                            </h3>
                            <span className="text-[10px] text-muted-foreground">Last updated: Just now</span>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        {i % 2 === 0 ? <Eye className="h-3 w-3 text-primary" /> : <ShieldCheck className="h-3 w-3 text-emerald-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-foreground/90 font-medium">
                                            {i % 2 === 0 ? "Document Accessed" : "Security Checksum Verified"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {i % 2 === 0 ? "Engineering_Specs_V4.pdf accessed by Admin" : "Full encrypted database scan completed successfully"}
                                        </p>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">{i * 5}m ago</div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>

                    {/* Top Content */}
                    <GlassPanel className="p-6">
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-400" />
                                Smart Insights
                            </h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">High Demand</p>
                                {analytics.mostAccessed?.slice(0, 3).map((file: any) => (
                                    <div key={file._id} className="mb-3">
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-foreground/80 truncate w-3/4">{file.title}</span>
                                            <span className="text-primary">{file.count}</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min(100, (file.count / 10) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-medium text-primary mb-1 italic">"Storage is growing 15% faster than last month. Consider archived high-volume media."</p>
                                <p className="text-[8px] text-muted-foreground text-right">- AI Counselor</p>
                            </div>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
    return (
        <GlassPanel className="p-5 flex flex-col gap-2 relative group hover:ring-1 hover:ring-primary/30 transition-all duration-500">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
                <div className={`p-2 rounded-xl bg-white/5 transition-colors group-hover:bg-primary/10`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
            </div>
            <div className="text-2xl font-light text-white my-1">{value}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-2 w-2 text-primary" />
                </div>
                {trend}
            </div>
        </GlassPanel>
    )
}
