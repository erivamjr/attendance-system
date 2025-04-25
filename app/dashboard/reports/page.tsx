"use client"

import { useState } from "react"
import { Calendar, Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceBarChart } from "@/components/attendance-bar-chart"
import { AttendanceLineChart } from "@/components/attendance-line-chart"
import { OvertimeDistributionChart } from "@/components/overtime-distribution-chart"

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [unit, setUnit] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Maio 2025
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="period" className="text-sm font-medium">
            Período
          </label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="period">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
              <SelectItem value="semester">Semestral</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="unit" className="text-sm font-medium">
            Unidade
          </label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="unit">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Unidades</SelectItem>
              <SelectItem value="ubs-vila-nova">UBS Vila Nova</SelectItem>
              <SelectItem value="ubs-central">UBS Central</SelectItem>
              <SelectItem value="ubs-jardim">UBS Jardim</SelectItem>
              <SelectItem value="upa-24h">UPA 24h</SelectItem>
              <SelectItem value="hospital-municipal">Hospital Municipal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance">Frequência</TabsTrigger>
          <TabsTrigger value="overtime">Horas Extras</TabsTrigger>
          <TabsTrigger value="absences">Faltas</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequência por Unidade</CardTitle>
                <CardDescription>Comparativo de frequência entre unidades</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <AttendanceBarChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Frequência</CardTitle>
                <CardDescription>Evolução da frequência ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <AttendanceLineChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overtime" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Horas Extras</CardTitle>
                <CardDescription>Distribuição por tipo de hora extra</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <OvertimeDistributionChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Horas Extras por Função</CardTitle>
                <CardDescription>Distribuição de horas extras por função</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de horas extras por função</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="absences" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Faltas por Unidade</CardTitle>
                <CardDescription>Comparativo de faltas entre unidades</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de faltas por unidade</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Faltas</CardTitle>
                <CardDescription>Evolução das faltas ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de tendência de faltas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
