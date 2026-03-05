"use client"

import React, { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial, Line } from "@react-three/drei"
import * as THREE from "three"

function Connections({ count = 50 }) {
    const points = useMemo(() => {
        const p = []
        for (let i = 0; i < count; i++) {
            p.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ))
        }
        return p
    }, [count])

    const group = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = state.clock.getElapsedTime() * 0.1
            group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
        }
    })

    return (
        <group ref={group}>
            {points.map((p, i) => (
                <group key={i}>
                    <mesh position={p}>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshBasicMaterial color="#00f2fe" />
                    </mesh>
                    {points.slice(i + 1, i + 3).map((target, j) => (
                        <Line
                            key={j}
                            points={[p, target]}
                            color="#00f2fe"
                            lineWidth={0.5}
                            transparent
                            opacity={0.2}
                        />
                    ))}
                </group>
            ))}
        </group>
    )
}

export function NetworkTopology3D() {
    return (
        <div className="h-[400px] w-full rounded-2xl bg-slate-900/50 backdrop-blur-md shadow-2xl overflow-hidden border border-slate-800">
            <Canvas camera={{ position: [0, 0, 10] }}>
                <ambientLight intensity={0.5} />
                <Connections />
            </Canvas>
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Node Topology</p>
                <h3 className="text-xl font-bold text-white">Live Network State</h3>
            </div>
        </div>
    )
}
