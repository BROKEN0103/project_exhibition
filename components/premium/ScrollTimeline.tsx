"use client"

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion } from "framer-motion"

gsap.registerPlugin(ScrollTrigger)

export function ScrollTimeline() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const pin = gsap.fromTo(
            sectionRef.current,
            { x: 0 },
            {
                x: "-200vw",
                ease: "none",
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: "top top",
                    end: "2000 top",
                    scrub: 1,
                    pin: true,
                },
            }
        )
        return () => {
            pin.kill()
        }
    }, [])

    return (
        <section ref={triggerRef} className="overflow-hidden bg-[#050505]">
            <div ref={sectionRef} className="flex w-[300vw] h-screen items-center relative">
                <div className="w-screen h-full flex flex-col justify-center px-10 md:px-40">
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-blue-500 mb-6">Phase 01</p>
                    <h2 className="text-6xl md:text-9xl font-black text-white leading-tight uppercase italic">
                        The Core of<br />Protection
                    </h2>
                    <p className="max-w-xl text-slate-500 mt-8 text-xl leading-relaxed">
                        Every bit of data is fragmented and encrypted before it even hits our storage cluster.
                        No single point of failure. No exposed URLs.
                    </p>
                </div>

                <div className="w-screen h-full flex flex-col justify-center px-10 md:px-40 bg-zinc-950">
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-cyan-500 mb-6">Phase 02</p>
                    <h2 className="text-6xl md:text-9xl font-black text-white leading-tight uppercase italic">
                        Spatial<br />Awareness
                    </h2>
                    <p className="max-w-xl text-slate-500 mt-8 text-xl leading-relaxed">
                        Our monitoring system uses spatial algorithms to detect anomalies in traffic patterns
                        before they become threats.
                    </p>
                </div>

                <div className="w-screen h-full flex flex-col justify-center px-10 md:px-40 bg-black">
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-blue-600 mb-6">Phase 03</p>
                    <h2 className="text-6xl md:text-9xl font-black text-white leading-tight uppercase italic">
                        Quantum<br />Resilience
                    </h2>
                    <p className="max-w-xl text-slate-500 mt-8 text-xl leading-relaxed">
                        Future-proof encryption standards designed to resist even quantum-based brute force
                        attacks on your most sensitive content.
                    </p>
                </div>
            </div>
        </section>
    )
}
