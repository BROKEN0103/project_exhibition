"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TraceEntry {
    id: string
    timestamp: string
    event: string
    status: "success" | "warning" | "error"
    ip: string
}

export function SecurityTracePanel() {
    const [traces, setTraces] = useState<TraceEntry[]>([])

    useEffect(() => {
        const events = [
            "Handshake TLS 1.3",
            "JWT Verification",
            "RBAC Check",
            "IP Whitelist Validation",
            "Rate Limit Check",
            "Session Heartbeat",
            "E2EE Key Exchange"
        ]

        const interval = setInterval(() => {
            const newTrace: TraceEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                event: events[Math.floor(Math.random() * events.length)],
                status: Math.random() > 0.9 ? "warning" : Math.random() > 0.95 ? "error" : "success",
                ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            }

            setTraces(prev => [newTrace, ...prev.slice(0, 5)])
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-full w-full rounded-2xl bg-black/80 backdrop-blur-xl border border-blue-500/20 p-6 font-mono text-xs overflow-hidden shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
            <div className="flex items-center justify-between mb-4 border-b border-blue-500/10 pb-2">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-blue-400 font-bold uppercase tracking-widest">Live Security Trace</span>
                </div>
                <span className="text-slate-500">v4.2.0-secure</span>
            </div>

            <div className="space-y-2">
                <AnimatePresence initial={false}>
                    {traces.map((trace) => (
                        <motion.div
                            key={trace.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-between border-l-2 border-blue-500/30 pl-3 py-1 bg-blue-500/5"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500">{trace.timestamp}</span>
                                <span className={
                                    trace.status === "success" ? "text-emerald-400" :
                                        trace.status === "warning" ? "text-amber-400" : "text-rose-400"
                                }>
                                    [{trace.status.toUpperCase()}]
                                </span>
                                <span className="text-blue-100">{trace.event}</span>
                            </div>
                            <span className="text-slate-500">{trace.ip}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    )
}
