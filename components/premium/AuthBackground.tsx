"use client"

import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei"

export function AuthBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full" />

            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <Suspense fallback={null}>
                    <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
                        <Sphere args={[1, 64, 64]} position={[3, 2, 0]} scale={2}>
                            <MeshDistortMaterial
                                color="#1e40af"
                                distort={0.3}
                                speed={1.5}
                                transparent
                                opacity={0.4}
                            />
                        </Sphere>
                    </Float>
                    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                        <Sphere args={[1, 64, 64]} position={[-4, -2, 0]} scale={1.5}>
                            <MeshDistortMaterial
                                color="#0891b2"
                                distort={0.5}
                                speed={2}
                                transparent
                                opacity={0.3}
                            />
                        </Sphere>
                    </Float>
                </Suspense>
            </Canvas>
        </div>
    )
}
