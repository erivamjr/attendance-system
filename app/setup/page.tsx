"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Check, Copy, Database } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@supabase/supabase-js"

export default function SetupPage() {
  const router = useRouter()
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("credentials")

  const handleSaveCredentials = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Testar a conexão com o Supabase
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { error: pingError } = await supabase.from("_dummy_query").select("*").limit(1)

      // Se o erro for "relation does not exist", significa que a conexão está funcionando
      // mas a tabela não existe, o que é esperado
      if (pingError && !pingError.message.includes("relation") && !pingError.message.includes("does not exist")) {
        throw new Error(`Erro ao conectar ao Supabase: ${pingError.message}`)
      }

      // Salvar as credenciais no localStorage
      localStorage.setItem("SUPABASE_URL", supabaseUrl)
      localStorage.setItem("SUPABASE_ANON_KEY", supabaseAnonKey)

      setSuccess(true)
      setActiveTab("schema")
    } catch (err) {
      console.error("Erro ao testar conexão:", err)
      setError(`Erro ao conectar ao Supabase: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(databaseSchema)
    alert("Schema SQL copiado para a área de transferência!")
  }

  const handleGoToApp = () => {
    // Recarregar a página para aplicar as novas credenciais
    window.location.href = "/"
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Configuração do Sistema de Frequência</CardTitle>
          <CardDescription>Configure sua conexão com o Supabase e crie as tabelas necessárias</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">1. Credenciais do Supabase</TabsTrigger>
              <TabsTrigger value="schema" disabled={!success}>
                2. Criação do Schema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4 mt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Conexão estabelecida com sucesso!</AlertTitle>
                  <AlertDescription>
                    As credenciais foram salvas. Agora você precisa criar as tabelas no Supabase.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl">URL do Supabase</Label>
                  <Input
                    id="supabaseUrl"
                    placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Encontre esta URL no painel do Supabase em Configurações &gt; API
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabaseAnonKey">Chave Anônima do Supabase</Label>
                  <Input
                    id="supabaseAnonKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Encontre esta chave no painel do Supabase em Configurações &gt; API &gt; anon public
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schema" className="space-y-4 mt-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Criação do Schema</AlertTitle>
                <AlertDescription>
                  Copie o SQL abaixo e execute no Editor SQL do Supabase para criar todas as tabelas necessárias.
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96 text-sm">
                  {databaseSchema}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 gap-1"
                  onClick={handleCopySchema}
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-md border border-amber-200 dark:border-amber-800">
                <h3 className="font-medium text-amber-800 dark:text-amber-400">Instruções:</h3>
                <ol className="list-decimal ml-5 mt-2 text-amber-700 dark:text-amber-300 space-y-1">
                  <li>Acesse o painel do Supabase e vá para o Editor SQL</li>
                  <li>Cole o SQL acima e execute-o para criar todas as tabelas</li>
                  <li>
                    Depois, volte para esta página e clique em "Ir para o Aplicativo" para começar a usar o sistema
                  </li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTab === "credentials" ? (
            <Button onClick={handleSaveCredentials} disabled={loading}>
              {loading ? "Testando conexão..." : "Salvar e Testar Conexão"}
            </Button>
          ) : (
            <Button onClick={handleGoToApp}>Ir para o Aplicativo</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

// SQL para criar o schema do banco de dados
const databaseSchema = `-- Criar tabela de organizações
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de unidades
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  unit_id UUID REFERENCES units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de funcionários
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  pis TEXT,
  role TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  floor_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de folhas de frequência
CREATE TABLE frequency_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL,
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de entradas de frequência
CREATE TABLE frequency_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_id UUID NOT NULL REFERENCES frequency_sheets(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  absence_days INTEGER NOT NULL DEFAULT 0,
  additional_night_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  overtime_50_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  overtime_100_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  on_call_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  vacation_days INTEGER NOT NULL DEFAULT 0,
  justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tipos de eventos
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

-- Criar tabela de códigos de eventos
CREATE TABLE event_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contract_type TEXT NOT NULL,
  event_type_id UUID NOT NULL REFERENCES event_types(id),
  code INTEGER NOT NULL
);

-- Criar tabela de log de submissões
CREATE TABLE submissions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_id UUID NOT NULL REFERENCES frequency_sheets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir organização inicial
INSERT INTO organizations (name, slug) VALUES ('Secretaria de Saúde', 'saude');

-- Inserir tipos de eventos
INSERT INTO event_types (name, label) VALUES 
  ('absence', 'Falta'),
  ('night_shift', 'Adicional Noturno'),
  ('overtime_50', 'Hora Extra 50%'),
  ('overtime_100', 'Hora Extra 100%'),
  ('on_call', 'Sobreaviso'),
  ('vacation', 'Férias');

-- Inserir unidades iniciais
INSERT INTO units (organization_id, name, location) VALUES 
  ((SELECT id FROM organizations LIMIT 1), 'UBS Vila Nova', 'Rua das Flores, 123 - Vila Nova'),
  ((SELECT id FROM organizations LIMIT 1), 'UBS Central', 'Av. Principal, 500 - Centro'),
  ((SELECT id FROM organizations LIMIT 1), 'UBS Jardim', 'Rua das Árvores, 45 - Jardim');

-- Inserir usuário admin inicial
INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES 
  (uuid_generate_v4(), (SELECT id FROM organizations LIMIT 1), 'Administrador', 'admin@example.com', 'auth_managed', 'admin');

-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
`
