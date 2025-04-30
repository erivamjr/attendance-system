"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

type Unit = {
  id: string
  name: string
}

type UserFormProps = {
  onSuccess: () => void
  onCancel: () => void
  editUser?: {
    id: string
    name: string
    email: string
    cpf: string
    role: string
    unit_id: string | null
    status: string
  }
}

export function UserForm({ onSuccess, onCancel, editUser }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [formData, setFormData] = useState({
    name: editUser?.name || "",
    email: editUser?.email || "",
    cpf: editUser?.cpf || "",
    role: editUser?.role || "responsible",
    unit_id: editUser?.unit_id || "",
    password: "",
    status: editUser?.status || "Ativo",
  })

  useEffect(() => {
    // Carregar unidades
    const loadUnits = async () => {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase.from("units").select("id, name")

        if (error) throw error

        setUnits(data || [])
      } catch (error) {
        console.error("Erro ao carregar unidades:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as unidades.",
          variant: "destructive",
        })
      }
    }

    loadUnits()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabase()
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}")

      if (!currentUser.organization_id) {
        toast({
          title: "Erro",
          description: "Não foi possível identificar a organização.",
          variant: "destructive",
        })
        return
      }

      if (editUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from("users")
          .update({
            name: formData.name,
            role: formData.role,
            unit_id: formData.unit_id === "none" ? null : formData.unit_id || null,
          })
          .eq("id", editUser.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        })
      } else {
        // Tentar criar usuário usando a API
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            organization_id: currentUser.organization_id,
            unit_id: formData.unit_id === "none" ? null : formData.unit_id || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erro ao criar usuário")
        }

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao salvar o usuário: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Ex: João da Silva"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Ex: joao.silva@example.com"
          disabled={!!editUser} // Não permitir editar e-mail de usuário existente
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={handleChange}
          required
          placeholder="Ex: 123.456.789-00"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Perfil</Label>
        <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="responsible">Responsável</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="unit_id">Unidade</Label>
        <Select
          value={formData.unit_id}
          onValueChange={(value) => handleSelectChange("unit_id", value)}
          disabled={formData.role === "admin"} // Administradores não têm unidade específica
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma (Administrador)</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!editUser && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Deixe em branco para senha padrão"
          />
          <p className="text-xs text-muted-foreground">Se não informada, será criada uma senha padrão.</p>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{editUser ? "Atualizar" : "Salvar"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
