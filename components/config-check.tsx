"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Função que verifica se uma string é uma URL válida
function isValidUrl(urlString: string | undefined | null): boolean {
  if (!urlString) return false

  try {
    new URL(urlString)
    return true
  } catch (error) {
    return false
  }
}

export function ConfigCheck({ children }: { children: React.ReactNode }) {
  const [configIssue, setConfigIssue] = useState<string | null>(null)
  const [envDetails, setEnvDetails] = useState({
    url: false,
    key: false,
    urlValue: "",
    keyLength: 0,
  })

  useEffect(() => {
    // Verificar se as variáveis de ambiente estão definidas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Guardar detalhes para diagnóstico
    setEnvDetails({
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      urlValue: supabaseUrl || "",
      keyLength: supabaseAnonKey?.length || 0,
    })

    if (!supabaseUrl && !supabaseAnonKey) {
      setConfigIssue("Variáveis de ambiente ausentes")
    } else if (!supabaseUrl) {
      setConfigIssue("NEXT_PUBLIC_SUPABASE_URL ausente")
    } else if (!supabaseAnonKey) {
      setConfigIssue("NEXT_PUBLIC_SUPABASE_ANON_KEY ausente")
    } else if (!isValidUrl(supabaseUrl)) {
      setConfigIssue("NEXT_PUBLIC_SUPABASE_URL inválida")
    } else {
      setConfigIssue(null)
    }
  }, [])

  if (configIssue) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de Configuração: {configIssue}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">As variáveis de ambiente do Supabase não foram configuradas corretamente.</p>

            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="diagnostico">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informações de diagnóstico
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-xs space-y-1 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                    <p>URL definida: {envDetails.url ? "Sim" : "Não"}</p>
                    <p>Chave definida: {envDetails.key ? "Sim" : "Não"}</p>
                    {envDetails.url && <p>URL válida: {isValidUrl(envDetails.urlValue) ? "Sim" : "Não"}</p>}
                    {envDetails.key && <p>Tamanho da chave: {envDetails.keyLength} caracteres</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Crie um arquivo <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">.env.local</code> na raiz do
                projeto
              </li>
              <li>
                Adicione as seguintes variáveis:
                <pre className="bg-gray-200 dark:bg-gray-800 p-2 rounded mt-1 text-xs overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
                </pre>
              </li>
              <li>
                Certifique-se de que a URL começa com{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">https://</code>
              </li>
              <li>Reinicie o servidor de desenvolvimento após criar/modificar o arquivo</li>
            </ol>
            <p className="mt-4">
              Você pode encontrar essas informações no painel do Supabase em Configurações &gt; API.
            </p>
            <Button className="mt-4 w-full" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
              Acessar Painel do Supabase
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
