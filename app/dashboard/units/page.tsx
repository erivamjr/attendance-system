"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabase } from "@/lib/supabase"
import { UnitManagementTable } from "@/components/unit-management-table"
import { UnitForm } from "@/components/unit-form"
import { toast } from "@/components/ui/use-toast"

type Unit = {
  id: string
  name: string
  location: string
  responsible: string | null
  employeeCount: number
  is_active?: boolean
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      // Buscar unidades com contagem de funcionários e responsável
      const { data, error } = await supabase.from("units").select(`
        id, 
        name, 
        location,
        is_active
      `)

      if (error) throw error

      // Buscar contagem de funcionários para cada unidade
      const unitsWithCounts = await Promise.all(
        data.map(async (unit) => {
          // Contar funcionários
          const { count: employeeCount, error: countError } = await supabase
            .from("employees")
            .select("id", { count: "exact", head: true })
            .eq("unit_id", unit.id)

          if (countError) throw countError

          // Buscar responsável
          const { data: responsibleData, error: responsibleError } = await supabase
            .from("users")
            .select("name")
            .eq("unit_id", unit.id)
            .eq("role", "responsible")
            .single()

          if (responsibleError && responsibleError.code !== "PGRST116") {
            console.error("Erro ao buscar responsável:", responsibleError)
          }

          return {
            ...unit,
            employeeCount: employeeCount || 0,
            responsible: responsibleData?.name || null,
          }
        }),
      )

      setUnits(unitsWithCounts)
    } catch (error) {
      console.error("Erro ao buscar unidades:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de unidades.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUnit = () => {
    setShowAddDialog(true)
  }

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit)
    setShowEditDialog(true)
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    fetchUnits()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setSelectedUnit(null)
    fetchUnits()
  }

  const handleCloseAddDialog = () => {
    setShowAddDialog(false)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setSelectedUnit(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Postos/Unidades</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Postos/Unidades</h2>
        <Button onClick={handleAddUnit} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar nova unidade
        </Button>
      </div>

      <UnitManagementTable units={units} onEdit={handleEditUnit} onRefresh={fetchUnits} />

      {/* Diálogo para adicionar unidade */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseAddDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Unidade</DialogTitle>
            <DialogDescription>Preencha os dados para adicionar uma nova unidade ao sistema.</DialogDescription>
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
          {selectedUnit && (
            <UnitForm unitId={selectedUnit.id} onSuccess={handleEditSuccess} onCancel={handleCloseEditDialog} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
