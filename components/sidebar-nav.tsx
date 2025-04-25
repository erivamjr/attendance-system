"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  Home,
  LogOut,
  Settings,
  User,
  Users,
  Building2,
  Menu,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/components/auth-provider"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Folhas de Frequência",
    href: "/dashboard/attendance",
    icon: ClipboardList,
  },
  {
    title: "Postos/Unidades",
    href: "/dashboard/units",
    icon: Building2,
  },
  {
    title: "Usuários",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Exportações",
    href: "/dashboard/exports",
    icon: FileSpreadsheet,
  },
  {
    title: "Relatórios",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: User,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { signOut } = useAuth()

  // Close mobile sidebar when navigating
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await signOut()
  }

  const NavLinks = () => (
    <nav className="grid gap-1 px-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
            pathname === item.href ? "bg-gray-100 dark:bg-gray-800" : "text-gray-500 dark:text-gray-400",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )

  // Desktop sidebar
  if (isDesktop) {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="flex h-14 items-center justify-between border-b px-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Sistema de Frequência</h2>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <NavLinks />
        </div>
        <div className="border-t p-4 dark:border-gray-800">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    )
  }

  // Mobile sidebar
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-gray-950 dark:border-gray-800">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-between border-b px-4 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Sistema de Frequência</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <NavLinks />
              </div>
              <div className="border-t p-4 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Button variant="outline" className="justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Sistema de Frequência</h2>
        <ThemeToggle />
      </div>
      <div className="h-14"></div> {/* Spacer for fixed header */}
    </>
  )
}
