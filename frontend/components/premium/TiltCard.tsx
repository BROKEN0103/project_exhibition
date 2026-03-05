"use client"

import React, { useRef, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface TiltCardProps {
    children: React.ReactNode
    className?: string
}

export function TiltCard({ children, className }: TiltCardProps) {
    const x = useSpring(0, { stiffness: 300, damping: 30 })
    const y = useSpring(0, { stiffness: 300, damping: 30 })

    const rotateX = useTransform(y, [-0.5, 0.5], [15, -15])
    const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15])

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    function handleMouseLeave() {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={className}
        >
            <div style={{ transform: "translateZ(50px)" }}>
                {children}
            </div>
        </motion.div>
    )
}
