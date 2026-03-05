"use client"

import React, { useMemo, useRef } from "react"
import { extend, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Extend R3F with ShaderMaterial
extend({ ShaderMaterial: THREE.ShaderMaterial })

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simple noise function
  float noise(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;
    
    float t = uTime * 0.2;
    float dist = length(p);
    
    // Create animated noise layers
    float n = noise(vUv * 10.0 + t);
    float n2 = noise(vUv * 20.0 - t * 0.5);
    
    // Volumetric glow effect
    vec3 color = vec3(0.02, 0.05, 0.1); // Deep base
    float glow = 0.05 / (dist + 0.1);
    
    // Add pulsing highlights
    float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
    color += vec3(0.0, 0.4, 0.8) * glow * (0.8 + 0.2 * n);
    color += vec3(0.0, 0.2, 0.4) * n2 * 0.1;
    
    // Grain overlay
    float grain = (noise(vUv * uResolution + uTime) - 0.5) * 0.05;
    color += grain;
    
    gl_FragColor = vec4(color, 1.0);
  }
`


export function ShaderBackground() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) }
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height)
    }
  })

  return (
    <mesh ref={meshRef} scale={[100, 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}
