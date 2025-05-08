"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { BarChart3, CalendarDays, FileText, Home, Settings, Users, Building2, ImageIcon, LogOut } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  role?: string
}

export function SidebarNav({ className, role = "admin", ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema.",
      })
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Itens de navegação comuns a todos os usuários
  const commonItems = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Início",
    },
    {
      href: "/dashboard/attendance",
      icon: CalendarDays,
      title: "Frequência",
    },
    {
      href: "/dashboard/reports",
      icon: BarChart3,
      title: "Relatórios",
    },
    {
      href: "/dashboard/exports",
      icon: FileText,
      title: "Exportações",
    },
    {
      href: "/dashboard/profile",
      icon: Users,
      title: "Perfil",
    },
  ]

  // Itens de navegação apenas para administradores
  const adminItems = [
    {
      href: "/dashboard/users",
      icon: Users,
      title: "Usuários",
    },
    {
      href: "/dashboard/units",
      icon: Building2,
      title: "Unidades",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Configurações",
      subItems: [
        {
          href: "/dashboard/settings",
          title: "Códigos de Evento",
        },
        {
          href: "/dashboard/settings/logo",
          title: "Logomarca",
          icon: ImageIcon,
        },
      ],
    },
  ]

  // Combinar itens com base no papel do usuário
  const navItems = [...commonItems, ...(role === "admin" ? adminItems : [])]

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center font-semibold">
          <span className="text-lg">Sistema de Frequência</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className={cn("flex flex-col space-y-1 px-2", className)} {...props}>
          {navItems.map((item) => {
            const isActive = item.subItems
              ? item.subItems.some((subItem) => pathname === subItem.href)
              : pathname === item.href

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    isActive ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                    "justify-start w-full",
                  )}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>

                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          pathname === subItem.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                          "justify-start w-full",
                        )}
                      >
                        {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600",
          )}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  )
}
