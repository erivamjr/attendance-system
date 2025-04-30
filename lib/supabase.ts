import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Verificar se estamos no lado do cliente
const isClient = typeof window !== "undefined"

// Função que verifica se uma string é uma URL válida
function isValidUrl(urlString: string | undefined | null): boolean {
  if (!urlString) return false

  try {
    // Tenta criar um objeto URL para verificar se a string é uma URL válida
    new URL(urlString)
    return true
  } catch (error) {
    return false
  }
}

// Criar um cliente mock para quando o Supabase não está configurado
function createMockClient() {
  console.warn("Using mock Supabase client. Supabase functionality will not work.")

  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      eq: () => ({ data: null, error: new Error("Supabase not configured") }),
    }),
    auth: {
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      admin: {
        listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
        deleteUser: () => Promise.resolve({ data: null, error: null }),
        createUser: () => Promise.resolve({ data: { user: { id: "mock" } }, error: null }),
        getUserByEmail: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
    sql: () => Promise.resolve({ data: null, error: null }),
  } as any
}

// Criar um cliente singleton para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const getSupabase = () => {
  // Obter as variáveis de ambiente explicitamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Verificar se as variáveis são URLs válidas e strings não vazias
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
    console.error("Supabase URL inválida ou chave anônima ausente:", {
      url: supabaseUrl ? "✓" : "✗",
      key: supabaseAnonKey ? "✓" : "✗",
    })

    // Se estamos no cliente, mostrar um alerta
    if (isClient) {
      console.error("Erro de configuração: As credenciais do Supabase são inválidas. Verifique o arquivo .env.local.")
    }

    return createMockClient()
  }

  // Se já temos uma instância, retorná-la
  if (supabaseInstance) return supabaseInstance

  // Criar uma nova instância
  try {
    // Aqui temos certeza que supabaseUrl e supabaseAnonKey são válidos
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    return supabaseInstance
  } catch (error) {
    console.error("Error initializing Supabase client:", error)

    if (isClient) {
      console.error("Erro ao inicializar o cliente Supabase. Verifique o console para mais detalhes.")
    }

    return createMockClient()
  }
}

// Para compatibilidade com o código existente
export const supabase = getSupabase()

// Função para obter o cliente com o token de acesso do usuário atual
export const getAuthenticatedSupabase = () => {
  return getSupabase()
}
