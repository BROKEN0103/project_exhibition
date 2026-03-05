"use client"

import React, { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float, PerspectiveCamera, Stars } from "@react-three/drei"
import { motion } from "framer-motion"
import * as THREE from "three"

function AnimatedSphere() {
    return (
        <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            <Sphere args={[1, 100, 200]} scale={2.4}>
                <MeshDistortMaterial
                    color="#00d2ff"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    )
}

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d2ff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#00f2fe" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Suspense fallback={null}>
                <AnimatedSphere />
            </Suspense>
        </>
    )
}

export function AnimatedHero() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Scene />
                </Canvas>
            </div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h1 className="mb-6 text-6xl font-bold tracking-tighter text-white md:text-8xl">
                        SECURE THE <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">FUTURE</span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400 md:text-xl">
                        A production-ready Secure Content Distribution Platform with E2EE,
                        dynamic watermarking, and real-time monitoring.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
                        >
                            Get Started
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-full border border-slate-800 bg-black/50 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-slate-900"
                        >
                            Documentation
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="h-6 w-4 rounded-full border-2 border-slate-700 relative">
                    <div className="h-1 w-1 bg-blue-500 rounded-full absolute top-1 left-1.5 animate-scrollIndicator"></div>
                </div>
            </div>
        </div>
    )
}
