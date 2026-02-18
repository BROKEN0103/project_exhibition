"use client"

import React, { useState, useTransition, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Check, X } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AuthBackground } from "@/components/premium/AuthBackground"
import { signupAction } from "@/app/auth/actions"

function usePasswordStrength(password: string) {
  return useMemo(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    }
    const score = Object.values(checks).filter(Boolean).length
    return { checks, score }
  }, [password])
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { checks, score } = usePasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (score < 4) {
      setError("Please meet all password requirements")
      return
    }

    const formData = new FormData()
    formData.set("email", email)
    formData.set("name", name)
    formData.set("password", password)

    startTransition(async () => {
      const result = await signupAction(formData)
      if (result.success && result.redirect) {
        router.push(result.redirect)
      } else if (result.error) {
        setError(result.error)
      }
    })
  }

  const strengthColor =
    score <= 1
      ? "bg-destructive"
      : score <= 2
        ? "bg-orange-500"
        : score <= 3
          ? "bg-yellow-500"
          : "bg-primary"

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <AuthBackground />
      <GlassPanel
        variant="strong"
        glow
        className="w-full max-w-sm p-8"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm tracking-widest text-muted-foreground uppercase">
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            {/* Name */}
            <div className="group relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full rounded-lg border border-border/50 bg-background/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                aria-label="Full name"
              />
            </div>

            {/* Email */}
            <div className="group relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-lg border border-border/50 bg-background/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                aria-label="Email address"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-lg border border-border/50 bg-background/50 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password strength */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-2"
              >
                {/* Strength bar */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i < score ? strengthColor : "bg-border/30"
                        }`}
                    />
                  ))}
                </div>

                {/* Requirements list */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {[
                    { key: "length" as const, label: "8+ characters" },
                    { key: "uppercase" as const, label: "Uppercase" },
                    { key: "lowercase" as const, label: "Lowercase" },
                    { key: "number" as const, label: "Number" },
                  ].map((req) => (
                    <div
                      key={req.key}
                      className="flex items-center gap-1.5 text-[10px]"
                    >
                      {checks[req.key] ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          checks[req.key]
                            ? "text-foreground/70"
                            : "text-muted-foreground/40"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-xs text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2.5 text-sm text-primary transition-all hover:bg-primary/15 disabled:opacity-50"
          >
            {isPending ? (
              <motion.div
                className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground/60">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary/70 transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </GlassPanel>
    </div>
  )
}
