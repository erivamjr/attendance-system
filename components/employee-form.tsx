"use client"

import type React from "react"

import { useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

type EmployeeFormProps = {
  unitId: string
  onSuccess: () => void
  onCancel: () => void
  editEmployee?: {
    id: string
    name: string
    cpf: string
    role: string
    contract_type: string
  }
}

export function EmployeeForm({ unitId, onSuccess, onCancel, editEmployee }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: editEmployee?.name || "",
    cpf: editEmployee?.cpf || "",
    role: editEmployee?.role || "",
    contract_type: editEmployee?.contract_type || "EFETIVO",
  })

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

      if (editEmployee) {
        // Atualizar funcionário existente
        const { error } = await supabase
          .from("employees")
          .update({
            name: formData.name,
            cpf: formData.cpf,
            role: formData.role,
            contract_type: formData.contract_type,
          })
          .eq("id", editEmployee.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Servidor atualizado com sucesso!",
        })
      } else {
        // Criar novo funcionário
        const { error } = await supabase.from("employees").insert({
          organization_id: currentUser.organization_id,
          unit_id: unitId,
          name: formData.name,
          cpf: formData.cpf,
          role: formData.role,
          contract_type: formData.contract_type,
        })

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Servidor cadastrado com sucesso!",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o servidor.",
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
        <Label htmlFor="role">Função</Label>
        <Input
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          placeholder="Ex: Enfermeiro"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contract_type">Tipo de Vínculo</Label>
        <Select value={formData.contract_type} onValueChange={(value) => handleSelectChange("contract_type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de vínculo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EFETIVO">EFETIVO</SelectItem>
            <SelectItem value="TEMPORARIO">TEMPORÁRIO</SelectItem>
            <SelectItem value="COMISSIONADO">COMISSIONADO</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
            <>{editEmployee ? "Atualizar" : "Salvar"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
