"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Trash2, Upload, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function LogoSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFileName, setLogoFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bucketExists, setBucketExists] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initializingBucket, setInitializingBucket] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkBucketAndFetchLogo()
  }, [])

  const checkBucketAndFetchLogo = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = getSupabase()

      // Verificar se o bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error("Erro ao listar buckets:", bucketsError)
        setError("Erro ao verificar buckets. Por favor, tente novamente.")
        return
      }

      const logosBucketExists = buckets.some((bucket) => bucket.name === "logos")
      setBucketExists(logosBucketExists)

      if (!logosBucketExists) {
        setError("O bucket de logos não existe. Clique em 'Inicializar Bucket' para criá-lo.")
        return
      }

      await fetchLogo()
    } catch (err) {
      console.error("Erro ao verificar bucket:", err)
      setError("Ocorreu um erro ao verificar a configuração do sistema.")
    } finally {
      setLoading(false)
    }
  }

  const fetchLogo = async () => {
    try {
      const supabase = getSupabase()

      // Verificar se a tabela organizations existe
      const { data, error } = await supabase.from("organizations").select("logo_url").maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar logo:", error)
        return
      }

      if (data?.logo_url) {
        setLogoFileName(data.logo_url)

        // Obter URL pública para o logo
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(data.logo_url)
        setLogoUrl(urlData.publicUrl)
      } else {
        setLogoFileName(null)
        setLogoUrl(null)
      }
    } catch (error) {
      console.error("Erro ao buscar logo:", error)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      // Verificar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem (PNG, JPG, GIF).",
          variant: "destructive",
        })
        return
      }

      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 2MB.",
          variant: "destructive",
        })
        return
      }

      setUploading(true)

      // Criar FormData para enviar o arquivo
      const formData = new FormData()
      formData.append("file", file)

      // Enviar para a API
      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erro ao fazer upload da logo")
      }

      // Atualizar o estado com a nova URL
      setLogoUrl(data.url)
      setLogoFileName(data.fileName)

      toast({
        title: "Logo atualizada com sucesso",
        description: "A nova logo foi salva e será exibida nos documentos.",
      })

      // Limpar o input de arquivo
      event.target.value = ""
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error)
      toast({
        title: "Erro ao fazer upload",
        description: error instanceof Error ? error.message : "Não foi possível fazer o upload da logo.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      if (!logoFileName) return

      setUploading(true)

      // Enviar para a API
      const response = await fetch("/api/remove-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: logoFileName }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erro ao remover logo")
      }

      // Atualizar o estado
      setLogoUrl(null)
      setLogoFileName(null)

      toast({
        title: "Logo removida com sucesso",
        description: "A logo foi removida e não será mais exibida nos documentos.",
      })
    } catch (error) {
      console.error("Erro ao remover logo:", error)
      toast({
        title: "Erro ao remover logo",
        description: "Não foi possível remover a logo. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleInitBucket = async () => {
    try {
      setInitializingBucket(true)
      setError(null)

      // Chamar a API para inicializar o bucket
      const response = await fetch("/api/init-logos-bucket")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erro ao inicializar bucket")
      }

      // Atualizar o estado
      setBucketExists(true)

      toast({
        title: "Bucket inicializado com sucesso",
        description: "Agora você pode fazer upload de logos.",
      })

      // Recarregar os dados
      await fetchLogo()
    } catch (err) {
      console.error("Erro ao inicializar bucket:", err)
      setError("Não foi possível inicializar o bucket de logos.")
      toast({
        title: "Erro ao inicializar bucket",
        description: err instanceof Error ? err.message : "Ocorreu um erro ao configurar o armazenamento de logos.",
        variant: "destructive",
      })
    } finally {
      setInitializingBucket(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logomarca da Organização</CardTitle>
        <CardDescription>
          A logomarca será exibida nos documentos gerados pelo sistema, como folhas de frequência e relatórios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Verificando configuração...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {!bucketExists ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuração necessária</AlertTitle>
                <AlertDescription>
                  {error || "O bucket de logos não está configurado."}
                  <div className="mt-2">
                    <Button onClick={handleInitBucket} disabled={initializingBucket} className="flex items-center">
                      {initializingBucket && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {initializingBucket ? "Inicializando..." : "Inicializar Bucket"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {logoUrl && (
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="max-w-xs mx-auto mb-4">
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Logo da organização"
                        className="max-h-40 max-w-full object-contain"
                      />
                    </div>
                    <Button variant="destructive" onClick={handleRemoveLogo} disabled={uploading}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover Logo
                    </Button>
                  </div>
                )}

                <div>
                  <div className="relative">
                    <input
                      type="file"
                      id="logo-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <Button variant="outline" className="w-full" disabled={uploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Enviando..." : "Fazer Upload de Nova Logo"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Formatos aceitos: PNG, JPG, GIF. Tamanho máximo: 2MB.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
