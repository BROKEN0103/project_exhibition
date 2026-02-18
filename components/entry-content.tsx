"use client"

import React, { Suspense } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

// Dynamically import Three.js components to avoid SSR issues
const CinemaEngine = dynamic(
  () => import("@/components/cinema/CinemaEngine").then((mod) => mod.CinemaEngine),
  { ssr: false }
)
const CinematicContent = dynamic(
  () => import("@/components/cinema/CinematicContent").then((mod) => mod.CinematicContent),
  { ssr: false }
)

export function EntryContent() {
  return (
    <main className="relative min-h-screen bg-[#000] text-white selection:bg-white selection:text-black">
      {/* 1. LAYER 0: The WebGL Engine */}
      <CinemaEngine />

      {/* 2. LAYER 1: The Scroll-Driven Cinematic Content */}
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase font-black tracking-[1em]"
          >
            Initializing_Protocol...
          </motion.div>
        </div>
      }>
        <CinematicContent />
      </Suspense>

      {/* 3. LAYER 2: Global UI Elements (Minimal) */}
      <nav className="fixed top-12 left-12 z-[100] flex items-center gap-4">
        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Sic_Mundus</span>
      </nav>

      <div className="fixed bottom-12 right-12 z-[100] hidden md:block">
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="text-[10px] font-mono uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity flex flex-col items-center gap-2"
        >
          Scrl_To_Navigate // [0.0 - 1.0]
          <div className="w-px h-8 bg-white/20" />
        </button>
      </div>
    </main>
  )
}
