"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Particles({ count = 800 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!)
  const light = useRef<THREE.PointLight>(null!)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      sizes[i] = Math.random() * 2 + 0.5
    }
    return { positions, sizes }
  }, [count])

  useFrame((state: any) => {
    const time = state.clock.getElapsedTime()
    if (mesh.current) {
      mesh.current.rotation.y = time * 0.02
      mesh.current.rotation.x = Math.sin(time * 0.01) * 0.1
    }
    if (light.current) {
      light.current.position.x = Math.sin(time * 0.3) * 5
      light.current.position.z = Math.cos(time * 0.3) * 5
    }
  })

  return (
    <>
      <pointLight ref={light} color="#2dd4bf" intensity={0.4} distance={20} />
      <ambientLight intensity={0.03} />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={particles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#2dd4bf"
          transparent
          opacity={0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  )
}

function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[60, 60, 60, 60]} />
      <meshBasicMaterial
        color="#2dd4bf"
        wireframe
        transparent
        opacity={0.02}
      />
    </mesh>
  )
}

export default function ParticleField() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#050a0e", 8, 30]} />
        <Particles />
        <GridPlane />
      </Canvas>
    </div>
  )
}
