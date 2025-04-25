import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnitManagementTable } from "@/components/unit-management-table"

export default function UnitsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Unidades</h1>
        <Button className="gap-2">
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
          <UnitManagementTable />
        </CardContent>
      </Card>
    </div>
  )
}
