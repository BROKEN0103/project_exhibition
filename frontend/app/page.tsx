import { redirect } from "next/navigation"
import { getSession } from "@/app/auth/actions"
import { EntryContent } from "@/components/entry-content"

export default async function EntryPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <EntryContent />
}
