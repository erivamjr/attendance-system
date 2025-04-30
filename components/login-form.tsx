"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, HelpCircle, Loader2, Users } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type TestUser = {
  email: string
  password: string
  name: string
  role: string
  unit: string | null
}

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSettingUpTestUser, setIsSettingUpTestUser] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [setupSuccess, setSetupSuccess] = useState(false)
  const [testUsers, setTestUsers] = useState<TestUser[]>([])
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
      // Tentar login com a API alternativa
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Armazenar informações do usuário na sessão
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...data.user,
            access_token: "mock-token", // Token fictício para teste
          }),
        )

        // Redirecionar para o dashboard
        router.push("/dashboard")
        return
      } else {
        console.error("Erro no login:", data.message)
        setError(`Erro de autenticação: ${data.message}`)
      }
    } catch (err) {
      console.error("Erro no processo de login:", err)
      setError("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const setupTestUser = async (email = "admin@example.com", password = "password") => {
    setFormData({
      email,
      password,
    })
    setSetupSuccess(true)
  }

  const loadTestUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch("/api/setup-test-users")
      const data = await response.json()

      if (response.ok) {
        setTestUsers(data.users)
      } else {
        setError(`Erro ao carregar usuários de teste: ${data.message}`)
      }
    } catch (err) {
      console.error("Erro ao carregar usuários de teste:", err)
      setError("Ocorreu um erro ao carregar os usuários de teste.")
    } finally {
      setIsLoadingUsers(false)
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

      {setupSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-500">
          <AlertDescription>
            Credenciais preenchidas com sucesso! Clique em "Entrar" para acessar o sistema.
          </AlertDescription>
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

      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" className="w-full flex gap-2">
              <HelpCircle className="h-4 w-4" />
              Preciso de ajuda para entrar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajuda para Login</DialogTitle>
              <DialogDescription>
                Se você está tendo problemas para fazer login, você pode usar as credenciais de teste.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="users" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Usuários de Teste</TabsTrigger>
                <TabsTrigger value="admin">Admin Rápido</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="py-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Selecione um usuário para testar:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadTestUsers}
                      disabled={isLoadingUsers}
                      className="flex gap-2"
                    >
                      {isLoadingUsers ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          Carregar Usuários
                        </>
                      )}
                    </Button>
                  </div>

                  {testUsers.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead>Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testUsers.map((user) => (
                            <TableRow key={user.email}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                  {user.role === "admin" ? "Admin" : "Responsável"}
                                </Badge>
                                {user.unit && <div className="text-xs text-gray-500 mt-1">{user.unit}</div>}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setupTestUser(user.email, user.password)}
                                >
                                  Usar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {isLoadingUsers ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      ) : (
                        <Users className="h-8 w-8 mx-auto mb-2" />
                      )}
                      <p>
                        {isLoadingUsers ? "Carregando usuários..." : "Clique em 'Carregar Usuários' para ver as opções"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="admin" className="py-4">
                <div className="space-y-4">
                  <p className="text-sm mb-4">Use as credenciais de administrador para acesso rápido:</p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-4">
                    <p>
                      <strong>Email:</strong> admin@example.com
                    </p>
                    <p>
                      <strong>Senha:</strong> password
                    </p>
                  </div>
                  <Button onClick={() => setupTestUser()} disabled={isSettingUpTestUser} className="w-full">
                    {isSettingUpTestUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      "Usar Credenciais de Admin"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <p className="text-xs text-gray-500 w-full text-center">
                Após selecionar as credenciais, clique em "Entrar" para acessar o sistema.
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </form>
  )
}
