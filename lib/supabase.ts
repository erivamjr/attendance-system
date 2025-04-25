import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Verificar se estamos no lado do cliente
const isClient = typeof window !== "undefined"

// Obter as variáveis de ambiente ou do localStorage
const getSupabaseCredentials = () => {
  if (isClient) {
    const url = localStorage.getItem("SUPABASE_URL")
    const key = localStorage.getItem("SUPABASE_ANON_KEY")

    if (url && key) {
      return { url, key }
    }
  }

  // Fallback para variáveis de ambiente
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  }
}

// Criar um cliente singleton para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const getSupabase = () => {
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials()

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isClient) {
      // Redirecionar para a página de configuração se estamos no cliente
      window.location.href = "/setup"
    }
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables or setup page.")
  }

  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return supabaseInstance
}

// Para compatibilidade com o código existente
export const supabase = isClient ? getSupabase() : null

// Função para obter o cliente com o token de acesso do usuário atual
export const getAuthenticatedSupabase = () => {
  const supabase = getSupabase()

  // Se estamos no cliente e temos um usuário logado, adicionar o token de acesso
  if (isClient) {
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.access_token) {
        return supabase
      }
    }
  }

  return supabase
}
