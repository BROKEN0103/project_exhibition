"use client"

import React, { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, Stars, Float, Text, Environment } from "@react-three/drei"
import { motion, useScroll, useTransform } from "framer-motion"
import { ShaderBackground } from "./ShaderBackground"
import * as THREE from "three"

function SceneContent() {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1
            groupRef.current.rotation.x = Math.cos(t * 0.15) * 0.05
        }
    })

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#0066ff" />
            <fog attach="fog" args={["#000000", 5, 20]} />

            <group ref={groupRef}>
                <ShaderBackground />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <mesh position={[0, 0, -5]} rotation={[0, Math.PI / 4, 0]}>
                        <torusKnotGeometry args={[4, 0.5, 256, 32]} />
                        <meshStandardMaterial
                            color="#003366"
                            emissive="#001133"
                            metalness={0.9}
                            roughness={0.1}
                            wireframe
                        />
                    </mesh>
                </Float>
            </group>
        </>
    )
}

export function CinematicHero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

    return (
        <div ref={containerRef} className="relative h-[200vh] w-full bg-[#050505]">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <motion.div
                    style={{ y, opacity, scale }}
                    className="absolute inset-0"
                >
                    <Canvas gl={{ antialias: true, alpha: true }}>
                        <SceneContent />
                    </Canvas>
                </motion.div>

                <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="mb-4 text-7xl font-black uppercase tracking-tighter text-white md:text-[10rem] leading-[0.9]">
                            VAULT<br />
                            <span className="text-blue-600 drop-shadow-[0_0_50px_rgba(37,99,235,0.5)]">SECURITY</span>
                        </h1>
                        <p className="mx-auto max-w-xl text-lg font-medium tracking-widest text-slate-500 uppercase">
                            Next-Generation Content Protection & Spatial Monitoring
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-20 left-10 flex flex-col gap-2">
                    <div className="h-[1px] w-40 bg-gradient-to-r from-blue-600 to-transparent" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Infrastructure v4.2</p>
                </div>

                <div className="absolute bottom-20 right-10 flex flex-col items-end gap-2 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Scroll to enter the void</p>
                    <div className="h-[1px] w-20 bg-gradient-to-l from-slate-800 to-transparent" />
                </div>
            </div>
        </div>
    )
}
