import { LogoSettings } from "@/components/logo-settings"

export default function LogoSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurações de Logomarca</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie a logomarca da sua organização que será exibida nos documentos.
        </p>
      </div>
      <LogoSettings />
    </div>
  )
}
