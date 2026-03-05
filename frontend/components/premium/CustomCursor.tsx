"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false)
    const cursorRef = useRef<HTMLDivElement>(null)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.5 })
    const springY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.5 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
            if (!isVisible) setIsVisible(true)
        }

        const handleMouseEnter = () => setIsVisible(true)
        const handleMouseLeave = () => setIsVisible(false)

        window.addEventListener("mousemove", handleMouseMove)
        document.body.addEventListener("mouseenter", handleMouseEnter)
        document.body.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            document.body.removeEventListener("mouseenter", handleMouseEnter)
            document.body.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [isVisible, mouseX, mouseY])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <motion.div
                ref={cursorRef}
                className="absolute top-0 left-0 w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-500/5 backdrop-blur-sm shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
            </motion.div>

            {/* Trailing blur effect */}
            <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px]"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </div>
    )
}
