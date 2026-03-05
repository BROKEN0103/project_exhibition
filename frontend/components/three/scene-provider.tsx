"use client"

import dynamic from "next/dynamic"

const ParticleField = dynamic(
  () => import("@/components/three/particle-field"),
  { ssr: false }
)

export function SceneProvider() {
  return <ParticleField />
}
