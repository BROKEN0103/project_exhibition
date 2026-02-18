"use client"

import React, { useLayoutEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function CinematicContent() {
    const containerRef = useRef<HTMLDivElement>(null)
    const introRef = useRef<HTMLDivElement>(null)
    const conceptRef = useRef<HTMLDivElement>(null)
    const projectRef = useRef<HTMLDivElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Background and Global Scroll
            const sections = [introRef, conceptRef, projectRef, ctaRef]

            sections.forEach((section, i) => {
                if (!section.current) return

                gsap.fromTo(
                    section.current.querySelectorAll(".reveal"),
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.5,
                        ease: "power4.out",
                        stagger: 0.1,
                        scrollTrigger: {
                            trigger: section.current,
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse",
                        },
                    }
                )
            })

            // Specialparallax for massive text
            gsap.to(".parallax-text", {
                y: -150,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                },
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="relative z-10 w-full bg-transparent">
            {/* SECTION 1: HERO */}
            <section
                ref={introRef}
                className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
            >
                <div className="reveal">
                    <p className="cinematic-body mb-4">A New Digital Paradigm</p>
                    <h1 className="cinematic-heading parallax-text mb-8">
                        SIC<br />MUNDUS
                    </h1>
                    <p className="cinematic-body max-w-sm mx-auto opacity-60">
                        A state-of-the-art cryptographic vault designed for the cinematic age.
                    </p>
                </div>
            </section>

            {/* SECTION 2: CONCEPT */}
            <section
                ref={conceptRef}
                className="flex min-h-screen flex-col items-start justify-center px-8 md:px-20 bg-black/50 backdrop-blur-3xl"
            >
                <div className="reveal max-w-4xl">
                    <p className="cinematic-body mb-6">01 — The Blueprint</p>
                    <h2 className="cinematic-heading mb-10 text-left">
                        BEYOND<br />THE GRID
                    </h2>
                    <p className="cinematic-body text-left opacity-60 normal-case tracking-normal leading-relaxed max-w-lg">
                        No cards. No borders. We have stripped away the clutter to reveal a raw,
                        high-performance core. Security isn't just a feature; it's a visual language
                        that defines every interaction.
                    </p>
                </div>
            </section>

            {/* SECTION 3: MOTION SHOWCASE */}
            <section
                ref={projectRef}
                className="flex min-h-screen flex-col items-center justify-center px-8 md:px-20"
            >
                <div className="reveal text-center">
                    <p className="cinematic-body mb-6">02 — Kinetic Topology</p>
                    <h2 className="cinematic-heading mb-10">
                        LIQUID<br />STRUCT
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 max-w-5xl mx-auto">
                        <div className="reveal">
                            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Spatial Encryption</h3>
                            <p className="cinematic-body text-[9px] opacity-40 normal-case">Data projected into 3D manifolds for multi-dimensional security validation.</p>
                        </div>
                        <div className="reveal">
                            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Neural Routing</h3>
                            <p className="cinematic-body text-[9px] opacity-40 normal-case">Packet delivery optimized through a living, breathing network topology.</p>
                        </div>
                        <div className="reveal">
                            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Visual Provenance</h3>
                            <p className="cinematic-body text-[9px] opacity-40 normal-case">Every byte leaves a cinematic trail, verifiable and immutable.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: CTA */}
            <section
                ref={ctaRef}
                className="flex min-h-screen flex-col items-center justify-center px-4 py-20"
            >
                <div className="reveal text-center relative z-[101]">
                    <p className="cinematic-body mb-8">Secure Your Legacy</p>
                    <button
                        onClick={() => {
                            console.log("Navigating to login...")
                            router.push("/auth/login")
                        }}
                        className="cinematic-heading mb-12 hover:text-primary transition-all duration-500 cursor-pointer bg-transparent border-none appearance-none outline-none block mx-auto py-4 px-8"
                    >
                        ENTER<br />VAULT
                    </button>
                    <div className="flex gap-8 justify-center mt-12">
                        <button className="cinematic-body border-b border-white/20 pb-2 hover:border-white transition-all">Documentation</button>
                        <button className="cinematic-body border-b border-white/20 pb-2 hover:border-white transition-all">Access API</button>
                    </div>
                </div>
            </section>

            {/* GRAIN & VIGNETTE */}
            <div className="noise-overlay" />
            <div className="vignette" />
        </div>
    )
}
