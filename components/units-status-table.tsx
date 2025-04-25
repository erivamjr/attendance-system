"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

type UnitStatus = {
  id: string
  name: string
  status: string
  lastUpdate: string | null
  responsible: string | null
}

export function UnitsStatusTable() {
  const [units, setUnits] = useState<UnitStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUnits() {
      try {
        const supabase = getSupabase()
        // Buscar todas as unidades
        const { data: unitsData, error: unitsError } = await supabase.from("units").select("*")

        if (unitsError) throw unitsError

        // Buscar folhas de frequência para cada unidade
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        const unitsWithStatus: UnitStatus[] = await Promise.all(
          unitsData.map(async (unit) => {
            // Buscar folha de frequência do mês atual
            const { data: sheet, error: sheetError } = await supabase
              .from("frequency_sheets")
              .select("*, users(name)")
              .eq("unit_id", unit.id)
              .eq("month", currentMonth)
              .eq("year", currentYear)
              .single()

            if (sheetError && sheetError.code !== "PGRST116") {
              console.error("Erro ao buscar folha:", sheetError)
            }

            // Buscar responsável pela unidade
            const { data: responsible, error: responsibleError } = await supabase
              .from("users")
              .select("name")
              .eq("unit_id", unit.id)
              .eq("role", "responsible")
              .single()

            if (responsibleError && responsibleError.code !== "PGRST116") {
              console.error("Erro ao buscar responsável:", responsibleError)
            }

            // Determinar status da folha
            let status = "Pendente"
            let lastUpdate = null
            const responsibleName = responsible?.name || null

            if (sheet) {
              status =
                sheet.status === "submitted"
                  ? "Enviada"
                  : sheet.status === "signed"
                    ? "Assinada"
                    : "Aguardando Assinatura"
              lastUpdate = sheet.submitted_at ? new Date(sheet.submitted_at).toLocaleDateString("pt-BR") : null
            }

            return {
              id: unit.id,
              name: unit.name,
              status,
              lastUpdate,
              responsible: responsibleName,
            }
          }),
        )

        setUnits(unitsWithStatus)
      } catch (error) {
        console.error("Erro ao carregar unidades:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unidade</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Última Atualização</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {units.map((unit) => (
          <TableRow key={unit.id}>
            <TableCell className="font-medium">{unit.name}</TableCell>
            <TableCell>{unit.responsible || "Não atribuído"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  unit.status === "Enviada" || unit.status === "Assinada"
                    ? "success"
                    : unit.status === "Aguardando Assinatura"
                      ? "warning"
                      : "destructive"
                }
              >
                {unit.status}
              </Badge>
            </TableCell>
            <TableCell>{unit.lastUpdate || "—"}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver detalhes</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
