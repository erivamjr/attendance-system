"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"

type User = {
  id: string
  name: string
  email: string
  role: string
  organization_id: string
  unit_id: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há um usuário na sessão do navegador
    const checkUser = () => {
      const userStr = sessionStorage.getItem("currentUser")
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          setUser(userData)
        } catch (error) {
          console.error("Erro ao processar dados do usuário:", error)
          sessionStorage.removeItem("currentUser")
        }
      }
      setLoading(false)
    }

    checkUser()

    // Verificar se o usuário está autenticado no Supabase
    const supabase = getSupabase()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        sessionStorage.removeItem("currentUser")
        router.push("/")
      } else if (event === "SIGNED_IN" && session) {
        // Já tratamos o login no componente de login
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
      setUser(null)
      sessionStorage.removeItem("currentUser")
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
