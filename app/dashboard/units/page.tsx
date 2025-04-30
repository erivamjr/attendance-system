"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnitManagementTable } from "@/components/unit-management-table"
import { UnitForm } from "@/components/unit-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

type Unit = {
  id: string
  name: string
  location: string
  responsible: string | null
  employeeCount: number
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editUnit, setEditUnit] = useState<Unit | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const loadUnits = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()

      // Buscar todas as unidades
      const { data: unitsData, error: unitsError } = await supabase.from("units").select("*")

      if (unitsError) throw unitsError

      // Para cada unidade, buscar o responsável e o número de funcionários
      const unitsWithDetails = await Promise.all(
        unitsData.map(async (unit) => {
          // Buscar responsável
          const { data: responsibleData } = await supabase
            .from("users")
            .select("name")
            .eq("unit_id", unit.id)
            .eq("role", "responsible")
            .single()

          // Contar funcionários
          const { count: employeeCount } = await supabase
            .from("employees")
            .select("*", { count: "exact", head: true })
            .eq("unit_id", unit.id)

          return {
            id: unit.id,
            name: unit.name,
            location: unit.location,
            responsible: responsibleData?.name || null,
            employeeCount: employeeCount || 0,
          }
        }),
      )

      setUnits(unitsWithDetails)
    } catch (error) {
      console.error("Erro ao carregar unidades:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnits()
  }, [])

  const handleAddUnit = () => {
    setShowAddDialog(true)
  }

  const handleEditUnit = (unit: Unit) => {
    setEditUnit(unit)
    setShowEditDialog(true)
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    loadUnits()
  }

  // Vamos corrigir o problema de travamento após editar uma unidade

  // Primeiro, vamos garantir que o estado do diálogo seja corretamente resetado
  // Modifique a função handleEditSuccess para:
  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditUnit(null)
    loadUnits()
  }

  // Modifique a função handleCloseEditDialog para:
  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setEditUnit(null)
  }

  // Modifique a função handleCloseAddDialog para:
  const handleCloseAddDialog = () => {
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Unidades</h1>
        <Button className="gap-2" onClick={handleAddUnit}>
          <Plus className="h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unidades e Postos</CardTitle>
          <CardDescription>Gerencie as unidades e seus responsáveis</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <UnitManagementTable units={units} onEdit={handleEditUnit} onRefresh={loadUnits} />
          )}
        </CardContent>
      </Card>

      {/* Diálogo para adicionar unidade */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseAddDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Unidade</DialogTitle>
            <DialogDescription>Preencha os dados para adicionar uma nova unidade.</DialogDescription>
          </DialogHeader>
          <UnitForm onSuccess={handleAddSuccess} onCancel={handleCloseAddDialog} />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar unidade */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseEditDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Unidade</DialogTitle>
            <DialogDescription>Atualize os dados da unidade.</DialogDescription>
          </DialogHeader>
          {editUnit && (
            <UnitForm
              onSuccess={handleEditSuccess}
              onCancel={handleCloseEditDialog}
              editUnit={{
                id: editUnit.id,
                name: editUnit.name,
                location: editUnit.location,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
