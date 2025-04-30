import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceForm } from "@/components/attendance-form"

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Folha de Frequência</h1>
      </div>

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList>
          <TabsTrigger value="form">Preenchimento</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preenchimento da Folha de Frequência</CardTitle>
              <CardDescription>Selecione a unidade e o período para preencher a folha</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Folha de Frequência</CardTitle>
              <CardDescription>Visualize a folha antes de finalizar</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="border p-4 text-center">
                <p className="mb-4">Visualização do PDF será exibida aqui</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline">Baixar PDF</Button>
                  <Button variant="outline">Imprimir</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
