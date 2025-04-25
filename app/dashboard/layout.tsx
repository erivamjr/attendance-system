import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { AuthProvider } from "@/components/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <SidebarNav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </AuthProvider>
  )
}
