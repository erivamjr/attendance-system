"use client"

import { useState } from "react"
import { Calendar, Download, FileSpreadsheet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ExportsPage() {
  const [month, setMonth] = useState("maio")
  const [year, setYear] = useState("2025")

  const handleExportExcel = () => {
    // Em produção, isso geraria e baixaria o arquivo Excel
    alert("Exportação de Excel iniciada!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exportação de Dados</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportação de Excel Consolidado</CardTitle>
          <CardDescription>Gere a planilha consolidada no formato do sistema de folha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="month" className="text-sm font-medium">
                Mês
              </label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="janeiro">Janeiro</SelectItem>
                  <SelectItem value="fevereiro">Fevereiro</SelectItem>
                  <SelectItem value="março">Março</SelectItem>
                  <SelectItem value="abril">Abril</SelectItem>
                  <SelectItem value="maio">Maio</SelectItem>
                  <SelectItem value="junho">Junho</SelectItem>
                  <SelectItem value="julho">Julho</SelectItem>
                  <SelectItem value="agosto">Agosto</SelectItem>
                  <SelectItem value="setembro">Setembro</SelectItem>
                  <SelectItem value="outubro">Outubro</SelectItem>
                  <SelectItem value="novembro">Novembro</SelectItem>
                  <SelectItem value="dezembro">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="year" className="text-sm font-medium">
                Ano
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="gap-2" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Gerar Excel Consolidado
            </Button>
          </div>

          <Alert className="border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Calendar className="h-4 w-4" />
            <AlertTitle>Verificação de Envios</AlertTitle>
            <AlertDescription>
              Existem 2 unidades que ainda não enviaram a folha de frequência para o período selecionado.
            </AlertDescription>
          </Alert>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Hospital Municipal</TableCell>
                  <TableCell className="text-red-600">Pendente</TableCell>
                  <TableCell>Juliana Costa</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Notificar
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">UBS Parque das Flores</TableCell>
                  <TableCell className="text-red-600">Pendente</TableCell>
                  <TableCell>Roberto Almeida</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Notificar
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Baixar Relatório de Pendências
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
