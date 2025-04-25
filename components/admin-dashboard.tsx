"use client"

import { useEffect, useState } from "react"
import { Download, Filter, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnitsStatusTable } from "@/components/units-status-table"
import { StatusChart } from "@/components/status-chart"
import { getSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardStats = {
  totalUnits: number
  submittedSheets: number
  pendingSignature: number
  pendingSheets: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUnits: 0,
    submittedSheets: 0,
    pendingSignature: 0,
    pendingSheets: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = getSupabase()

        // Buscar total de unidades
        const { data: units, error: unitsError } = await supabase.from("units").select("id")

        if (unitsError) throw unitsError

        const totalUnits = units.length

        // Buscar folhas de frequência do mês atual
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        const { data: sheets, error: sheetsError } = await supabase
          .from("frequency_sheets")
          .select("*")
          .eq("month", currentMonth)
          .eq("year", currentYear)

        if (sheetsError) throw sheetsError

        // Contar folhas por status
        let submittedSheets = 0
        let pendingSignature = 0

        sheets.forEach((sheet) => {
          if (sheet.status === "submitted") {
            submittedSheets++
          } else if (sheet.status === "draft") {
            pendingSignature++
          }
        })

        const pendingSheets = totalUnits - submittedSheets - pendingSignature

        setStats({
          totalUnits,
          submittedSheets,
          pendingSignature,
          pendingSheets,
        })
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">Unidades cadastradas no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Folhas Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submittedSheets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUnits > 0
                ? `${Math.round((stats.submittedSheets / stats.totalUnits) * 100)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSignature}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUnits > 0
                ? `${Math.round((stats.pendingSignature / stats.totalUnits) * 100)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSheets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUnits > 0
                ? `${Math.round((stats.pendingSheets / stats.totalUnits) * 100)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Status das Unidades</CardTitle>
              <CardDescription>Visão geral do status de envio das folhas de frequência</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UnitsStatusTable />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Resumo de Status</CardTitle>
            <CardDescription>Distribuição das folhas por status</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <StatusChart data={[stats.submittedSheets, stats.pendingSignature, stats.pendingSheets]} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Frequência
        </Button>
      </div>
    </>
  )
}
