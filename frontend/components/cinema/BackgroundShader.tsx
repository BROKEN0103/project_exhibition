"use client"

import React, { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    
    // Create soft pulsing glow
    float glow = 0.05 / (dist + 0.5);
    glow += sin(uTime * 0.5) * 0.02;

    // Dark cinematic blue/black
    vec3 color = vec3(0.01, 0.02, 0.04) * (1.0 - dist);
    color += vec3(0.1, 0.2, 0.5) * glow;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

export function BackgroundShader() {
    const meshRef = useRef<THREE.Mesh>(null)
    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime()
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, -5]} scale={[20, 20, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthWrite={false}
            />
        </mesh>
    )
}
