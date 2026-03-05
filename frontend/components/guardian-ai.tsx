"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    MessageSquare,
    X,
    Send,
    Bot,
    Shield,
    Cpu,
    Zap,
    ChevronDown,
    Lock,
    Eye
} from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"

export function GuardianAI() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Guardian AI initialized. Security protocols active. How can I assist you with the Vault today?', time: 'Just now' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
        setInput('')
        setIsTyping(true)

        // Simulated AI Logic
        setTimeout(() => {
            let response = ""
            const lowerMsg = userMsg.toLowerCase()

            if (lowerMsg.includes('status')) {
                response = "System integrity is at 98.4%. No active breaches detected. All files are sealed with SHA3-512 hashes."
            } else if (lowerMsg.includes('access') || lowerMsg.includes('who')) {
                response = "Currently, 3 users have administrative access. All entries are being logged to the immutable audit trail."
            } else if (lowerMsg.includes('help')) {
                response = "I can verify document signatures, report on storage trajectories, or help you navigate your project workspaces."
            } else {
                response = "Processing request... My semantic index suggests you are inquiring about vault operations. Would you like a security summary?"
            }

            setMessages(prev => [...prev, { role: 'bot', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all hover:scale-110 active:scale-95"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Bot className="h-6 w-6 text-white" />
                        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="mb-4 w-[380px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-primary/20 to-primary/5 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/20">
                                        <Shield className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Guardian AI</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-medium text-emerald-500 uppercase">Operational</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full bg-white/5 p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="h-[400px] overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'bot' ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'bot'
                                        ? 'bg-white/5 border border-white/5 text-foreground/90 rounded-tl-none'
                                        : 'bg-primary text-white rounded-tr-none'
                                        }`}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <p className={`mt-1 text-[9px] ${msg.role === 'bot' ? 'text-muted-foreground' : 'text-white/60'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Inquire protocols..."
                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mt-3 flex justify-around">
                                <QuickAction icon={Zap} label="Status" onClick={() => setInput('Check status')} />
                                <QuickAction icon={Lock} label="Security" onClick={() => setInput('Who has access?')} />
                                <QuickAction icon={Eye} label="Audit" onClick={() => setInput('Help')} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function QuickAction({ icon: Icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
        >
            <Icon className="h-3 w-3" />
            {label}
        </button>
    )
}
