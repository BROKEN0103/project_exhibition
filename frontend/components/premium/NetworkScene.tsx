"use client"

import React, { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Line, Float, PerspectiveCamera, Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

const NODE_COUNT = 40

function Pulse({ start, end, delay }: { start: THREE.Vector3, end: THREE.Vector3, delay: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const t = (state.clock.getElapsedTime() * 0.5 + delay) % 1
        if (meshRef.current) {
            meshRef.current.position.lerpVectors(start, end, t)
            meshRef.current.scale.setScalar(Math.sin(t * Math.PI) * 0.1)
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#00f2fe" transparent opacity={0.8} />
        </mesh>
    )
}

interface Connection {
    start: THREE.Vector3
    end: THREE.Vector3
    delay: number
}

function Connections() {
    const nodes = useMemo(() => {
        const p = []
        for (let i = 0; i < NODE_COUNT; i++) {
            p.push(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ))
        }
        return p
    }, [])

    const connections = useMemo(() => {
        const c: Connection[] = []
        for (let i = 0; i < nodes.length; i++) {
            const current = nodes[i]
            if (!current) continue

            const nearest = [...nodes]
                .sort((a, b) => a.distanceTo(current) - b.distanceTo(current))
                .slice(1, 3)

            nearest.forEach(n => {
                c.push({ start: current, end: n, delay: Math.random() })
            })
        }
        return c
    }, [nodes])

    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <group ref={groupRef}>
            {nodes.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshBasicMaterial color="#00f2fe" />
                </mesh>
            ))}
            {connections.map((c, i) => (
                <React.Fragment key={i}>
                    <Line
                        points={[c.start, c.end]}
                        color="#00f2fe"
                        lineWidth={0.2}
                        transparent
                        opacity={0.1}
                    />
                    <Pulse start={c.start} end={c.end} delay={c.delay} />
                </React.Fragment>
            ))}
        </group>
    )
}

export function NetworkScene() {
    return (
        <div className="h-[600px] w-full rounded-[2rem] bg-[#080808] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-radial-gradient from-blue-600/5 to-transparent pointer-events-none" />
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} />
                <ambientLight intensity={0.5} />
                <Connections />
            </Canvas>

            <div className="absolute top-10 left-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Live Visualization</p>
                <h3 className="text-3xl font-black text-white italic">NETWORK_TOPOLOGY</h3>
            </div>

            <div className="absolute bottom-10 right-10 flex gap-4">
                <div className="flex flex-col items-end">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Nodes</p>
                    <p className="text-sm font-mono text-blue-400">128_CONNECTED</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-800" />
                <div className="flex flex-col items-end">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                    <p className="text-sm font-mono text-emerald-400">PROTECTED</p>
                </div>
            </div>
        </div>
    )
}
