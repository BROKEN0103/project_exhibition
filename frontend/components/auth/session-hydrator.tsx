"use client"

import React, { useEffect, useRef } from "react"
import { useAppStore, type User } from "@/stores/app-store"

interface SessionHydratorProps {
  user: User | null
  children: React.ReactNode
}

export function SessionHydrator({ user, children }: SessionHydratorProps) {
  const setUser = useAppStore((s) => s.setUser)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current && user) {
      setUser(user)
      hydrated.current = true
    }
  }, [user, setUser])

  return <>{children}</>
}
