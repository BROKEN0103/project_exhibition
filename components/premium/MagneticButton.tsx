"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}

export function MagneticButton({ children, className, onClick }: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouse = (e: React.MouseEvent) => {
        const { clientX, clientY } = e
        const { height, width, left, top } = ref.current!.getBoundingClientRect()
        const middleX = clientX - (left + width / 2)
        const middleY = clientY - (top + height / 2)
        setPosition({ x: middleX * 0.4, y: middleY * 0.4 })
    }

    const reset = () => {
        setPosition({ x: 0, y: 0 })
    }

    const { x, y } = position

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.2 }}
            className={cn(
                "relative inline-flex items-center justify-center overflow-hidden transition-colors border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]",
                className
            )}
            onClick={onClick}
        >
            <div className="relative z-10 flex items-center gap-2">
                {children}
            </div>
            <motion.div
                className="absolute inset-0 bg-blue-600/5"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
            />
        </motion.button>
    )
}
