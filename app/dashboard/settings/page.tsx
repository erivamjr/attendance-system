import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventCodeSettings } from "@/components/event-code-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Códigos por Vínculo</CardTitle>
          <CardDescription>Configure os códigos utilizados para cada tipo de evento por vínculo</CardDescription>
        </CardHeader>
        <CardContent>
          <EventCodeSettings />
        </CardContent>
      </Card>
    </div>
  )
}
