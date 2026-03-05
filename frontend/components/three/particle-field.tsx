"use client"

import React, { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function CinematicParticles({ count = 2000 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40
      vel[i] = Math.random() * 0.02 + 0.01
    }
    return { pos, vel }
  }, [count])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (points.current) {
      points.current.rotation.y = t * 0.02
      points.current.rotation.x = Math.sin(t * 0.05) * 0.1
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.pos, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3b82f6"
        transparent
        opacity={0.15}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function ParticleField() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={["#050505", 5, 25]} />
        <CinematicParticles />
        <ambientLight intensity={0.5} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
    </div>
  )
}
