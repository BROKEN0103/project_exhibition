"use client"

import { forwardRef, type ReactNode } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "subtle"
  glow?: boolean
  children?: ReactNode
  className?: string
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", glow = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "glass-panel shadow-2xl",
      strong: "glass-panel-strong shadow-[0_0_100px_-20px_rgba(37,99,235,0.15)]",
      subtle: "bg-background/20 backdrop-blur-lg border border-white/5",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
          glow && "glass-glow shadow-[0_0_50px_-15px_rgba(37,99,235,0.3)]",
          "rounded-2xl transition-all duration-300",
          className
        )}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={props.onClick ? { scale: 1.01, border: "1px solid rgba(59, 130, 246, 0.4)" } : undefined}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        {glow && (
          <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl -z-10 pointer-events-none" />
        )}
      </motion.div>
    )
  }
)
GlassPanel.displayName = "GlassPanel"

export { GlassPanel }
