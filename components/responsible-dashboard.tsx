import { AlertCircle, Clock } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeStatusTable } from "@/components/employee-status-table"

export function ResponsibleDashboard() {
  return (
    <>
      <Alert className="mb-6 border-amber-500 bg-amber-50 text-amber-800">
        <Clock className="h-4 w-4" />
        <AlertTitle>Prazo de envio</AlertTitle>
        <AlertDescription>Você tem até o dia 05/06/2025 para enviar a folha de frequência deste mês.</AlertDescription>
      </Alert>

      <Alert className="mb-6 border-red-500 bg-red-50 text-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>Você ainda não enviou a folha de frequência deste mês.</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Servidores da Unidade</CardTitle>
          <CardDescription>UBS Vila Nova - Maio 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeStatusTable />
          <div className="mt-4 flex justify-end">
            <Button className="gap-2">Preencher Folha</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
