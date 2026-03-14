"use client"

import React, { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AuthBackground } from "@/components/premium/AuthBackground"
import { loginAction, verify2FAAction } from "@/app/auth/actions"

const demoAccounts = [
  { email: "admin@vault.io", role: "admin" },
  { email: "editor@vault.io", role: "editor" },
  { email: "viewer@vault.io", role: "viewer" },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState("")
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const formData = new FormData()
    formData.set("email", email)
    formData.set("password", password)

    startTransition(async () => {
      const result = await loginAction(formData)
      if (result.success) {
        if (result.requires2FA) {
          setRequires2FA(true)
          if (result.testOtp) {
            setOtp(result.testOtp)
            // Just output it directly or prefill
          }
        } else if (result.redirect) {
          router.push(result.redirect)
        }
      } else if (result.error) {
        setError(result.error)
      }
    })
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const formData = new FormData()
    formData.set("otp", otp)

    startTransition(async () => {
      const result = await verify2FAAction(formData)
      if (result.success && result.redirect) {
        router.push(result.redirect)
      } else if (result.error) {
        setError(result.error)
      }
    })
  }

  if (requires2FA) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <GlassPanel
          variant="strong"
          glow
          className="w-full max-w-sm p-8"
        >
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-sm tracking-widest text-muted-foreground uppercase">
              Two-Factor Authentication
            </h1>
            <p className="text-center text-xs text-muted-foreground">
              Enter the code sent to your email.
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            <div className="group relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP Code"
                required
                maxLength={6}
                className="w-full rounded-lg border border-border/50 bg-background/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                aria-label="OTP Code"
              />
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
              {isPending ? "Verifying..." : "Verify Code"}
            </motion.button>

            <button
              type="button"
              onClick={() => setRequires2FA(false)}
              className="text-xs text-muted-foreground hover:text-foreground text-center"
            >
              Back to Login
            </button>
          </form>
        </GlassPanel>
      </div>
    )
  }

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
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm tracking-widest text-muted-foreground uppercase">
            Authenticate
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
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
                Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground/60">
          {"Don't have an account? "}
          <Link
            href="/auth/signup"
            className="text-primary/70 transition-colors hover:text-primary"
          >
            Create one
          </Link>
        </p>

        <div className="mt-6 border-t border-border/20 pt-4">
          <p className="mb-2 text-center text-xs text-muted-foreground/60">
            Demo accounts (password: demo)
          </p>
          <div className="flex flex-col gap-1">
            {demoAccounts.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => {
                  setEmail(u.email)
                  setPassword("demo")
                  setError("")
                }}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                <span>{u.email}</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
