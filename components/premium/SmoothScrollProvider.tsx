"use client"

import React, { useEffect, useRef } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import "lenis/dist/lenis.css"

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.05,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        })

        lenisRef.current = lenis

        // Sync ScrollTrigger with Lenis
        lenis.on("scroll", ScrollTrigger.update)

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })

        gsap.ticker.lagSmoothing(0)

        // Ensure ScrollTrigger refreshes after layout
        const timeout = setTimeout(() => {
            ScrollTrigger.refresh()
        }, 500)

        return () => {
            clearTimeout(timeout)
            lenis.destroy()
            gsap.ticker.remove(lenis.raf)
        }
    }, [])

    return <>{children}</>
}
