import { redirect } from "next/navigation"

export default function AccountSettingsRedirect() {
  redirect("/dashboard/settings")
}
