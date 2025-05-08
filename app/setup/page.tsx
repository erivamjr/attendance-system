"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [bucketStatus, setBucketStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [dbError, setDbError] = useState<string | null>(null)
  const [bucketError, setBucketError] = useState<string | null>(null)
  const router = useRouter()

  const handleInitDb = async () => {
    setDbStatus("loading")
    setDbError(null)

    try {
      const response = await fetch("/api/init-database")
      const data = await response.json()

      if (data.success) {
        setDbStatus("success")
      } else {
        setDbStatus("error")
        setDbError(data.error || "Erro desconhecido ao inicializar banco de dados")
      }
    } catch (error) {
      setDbStatus("error")
      setDbError("Erro ao conectar com o servidor")
      console.error("Erro ao inicializar banco de dados:", error)
    }
  }

  const handleInitLogosBucket = async () => {
    setBucketStatus("loading")
    setBucketError(null)

    try {
      const response = await fetch("/api/init-logos-bucket")
      const data = await response.json()

      if (data.success) {
        setBucketStatus("success")
      } else {
        setBucketStatus("error")
        setBucketError(data.error || "Erro desconhecido ao criar bucket de logos")
      }
    } catch (error) {
      setBucketStatus("error")
      setBucketError("Erro ao conectar com o servidor")
      console.error("Erro ao criar bucket de logos:", error)
    }
  }

  const handleSetupAll = async () => {
    await handleInitDb()
    await handleInitLogosBucket()
  }

  const isSetupComplete = dbStatus === "success" && bucketStatus === "success"

  useEffect(() => {
    if (isSetupComplete) {
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isSetupComplete, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuração Inicial do Sistema</CardTitle>
          <CardDescription>
            Configure o banco de dados e os buckets de armazenamento necessários para o funcionamento do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Banco de Dados</h3>
              <p className="text-sm text-gray-500">Inicializar tabelas e dados básicos</p>
            </div>
            <div>
              {dbStatus === "idle" && (
                <Button variant="outline" onClick={handleInitDb}>
                  Inicializar
                </Button>
              )}
              {dbStatus === "loading" && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
              {dbStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {dbStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          </div>

          {dbError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{dbError}</div>}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Bucket de Logos</h3>
              <p className="text-sm text-gray-500">Criar bucket para armazenamento de logos</p>
            </div>
            <div>
              {bucketStatus === "idle" && (
                <Button variant="outline" onClick={handleInitLogosBucket} disabled={dbStatus !== "success"}>
                  Inicializar
                </Button>
              )}
              {bucketStatus === "loading" && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
              {bucketStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {bucketStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          </div>

          {bucketError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{bucketError}</div>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={handleSetupAll}
            disabled={dbStatus === "loading" || bucketStatus === "loading" || isSetupComplete}
          >
            {isSetupComplete ? "Configuração Concluída!" : "Configurar Tudo"}
          </Button>

          {isSetupComplete && (
            <p className="text-sm text-center text-green-600">
              Configuração concluída com sucesso! Redirecionando para o dashboard...
            </p>
          )}

          {(dbStatus === "error" || bucketStatus === "error") && (
            <p className="text-sm text-center text-red-600">
              Ocorreram erros durante a configuração. Verifique os detalhes acima e tente novamente.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
