"use client"

import React, { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, Environment, Float, MeshDistortMaterial, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { BackgroundShader } from "./BackgroundShader"

function SceneContent() {
    const meshRef = useRef<THREE.Mesh>(null)
    const [scroll, setScroll] = React.useState(0)

    // Listen to window scroll for camera depth
    React.useEffect(() => {
        const handleScroll = () => {
            setScroll(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight))
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.getElapsedTime()

        // Idle Float
        meshRef.current.rotation.x = Math.cos(t / 2) / 8 + (scroll * 2)
        meshRef.current.rotation.y = Math.sin(t / 2) / 8 + (scroll * 1.5)

        // Scroll Driven Depth
        state.camera.position.z = 5 + (scroll * 3)
        state.camera.position.y = (scroll * -1.5)

        // Subtle mouse parallax can be added here if needed
    })

    return (
        <>
            <color attach="background" args={["#000000"]} />
            <BackgroundShader />
            <fog attach="fog" args={["#000000", 2, 12]} />

            <ambientLight intensity={0.1} />
            <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={10} color="#ffffff" castShadow />
            <pointLight position={[-10, 10, -5]} intensity={2} color="#4477ff" />
            <pointLight position={[5, -5, 5]} intensity={1.5} color="#ff3366" />

            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.2}>
                <mesh ref={meshRef} scale={1.2}>
                    <torusKnotGeometry args={[1, 0.3, 128, 32]} />
                    <MeshDistortMaterial
                        color="#ffffff"
                        speed={2}
                        distort={0.3}
                        radius={1}
                        roughness={0}
                        metalness={1}
                        envMapIntensity={2}
                    />
                </mesh>
            </Float>

            <ContactShadows
                position={[0, -3, 0]}
                opacity={0.3}
                scale={20}
                blur={3}
                far={6}
            />

            <Environment preset="city" />
        </>
    )
}

export function CinemaEngine() {
    return (
        <div className="fixed inset-0 z-0 h-screen w-full pointer-events-none">
            <Canvas shadows gl={{ antialias: true }}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
                    <SceneContent />
                </Suspense>
            </Canvas>
        </div>
    )
}
