"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/stores/app-store"
import { fetchDashboardData } from "@/app/(authenticated)/dashboard/actions"

export function DataInitializer() {
  const setDocuments = useAppStore((s) => s.setDocuments)
  const setAccessLogs = useAppStore((s) => s.setAccessLogs)
  const setNotifications = useAppStore((s) => s.setNotifications)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      fetchDashboardData().then(({ documents, accessLogs, notifications }) => {
        setDocuments(documents)
        setAccessLogs(accessLogs)
        if (notifications) setNotifications(notifications)
      })
      initialized.current = true
    }
  }, [setDocuments, setAccessLogs, setNotifications])

  return null
}
