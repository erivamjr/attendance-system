"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabase } from "@/lib/supabase"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const supabase = getSupabase()

      // Usar a API de autenticação do Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error("Erro de autenticação:", signInError)
        setError("Credenciais inválidas. Por favor, tente novamente.")
        return
      }

      if (!data.user || !data.session) {
        setError("Erro ao autenticar. Por favor, tente novamente.")
        return
      }

      // Buscar informações adicionais do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.user.email)
        .single()

      if (userError) {
        console.error("Erro ao buscar dados do usuário:", userError)
        setError("Erro ao buscar informações do usuário.")
        return
      }

      // Armazenar informações do usuário na sessão
      sessionStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          organization_id: userData.organization_id,
          unit_id: userData.unit_id,
          // Incluir token de acesso para uso em requisições autenticadas
          access_token: data.session.access_token,
        }),
      )

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Erro no processo de login:", err)
      setError("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Digite seu e-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Digite sua senha"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}
