import React from "react"
import { getSession } from "@/app/auth/actions"
import { SessionHydrator } from "@/components/auth/session-hydrator"
import { FloatingDock } from "@/components/dashboard/floating-dock"
import { DataInitializer } from "@/components/auth/data-initializer"

import { Sidebar } from "@/components/dashboard/sidebar"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware already guards these routes. We read the session here
  // only to hydrate Zustand — never redirect from here.
  const session = await getSession()

  const user = session
    ? {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      token: session.token as string,
    }
    : null

  return (
    <SessionHydrator user={user}>
      <DataInitializer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
            {children}
          </main>
          <div className="md:hidden">
            <FloatingDock />
          </div>
        </div>
      </div>
    </SessionHydrator>
  )
}
