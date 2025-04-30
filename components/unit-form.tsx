"use client"

import type React from "react"

import { useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

type UnitFormProps = {
  onSuccess: () => void
  onCancel: () => void
  editUnit?: {
    id: string
    name: string
    location: string
  }
}

export function UnitForm({ onSuccess, onCancel, editUnit }: UnitFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: editUnit?.name || "",
    location: editUnit?.location || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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

      if (editUnit) {
        // Atualizar unidade existente
        const { error } = await supabase
          .from("units")
          .update({
            name: formData.name,
            location: formData.location,
          })
          .eq("id", editUnit.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Unidade atualizada com sucesso!",
        })
      } else {
        // Criar nova unidade
        const { error } = await supabase.from("units").insert({
          organization_id: currentUser.organization_id,
          name: formData.name,
          location: formData.location,
        })

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Unidade criada com sucesso!",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Erro ao salvar unidade:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a unidade.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Unidade</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Ex: UBS Central"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Endereço</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="Ex: Av. Principal, 500 - Centro"
        />
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
            <>{editUnit ? "Atualizar" : "Salvar"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
