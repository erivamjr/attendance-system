"use client"

import { useState, useEffect } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type EventCode = {
  id: string
  eventType: string
  statutoryCode: string
  contractCode: string
  temporaryCode: string
}

export function EventCodeSettings() {
  const [eventCodes, setEventCodes] = useState<EventCode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadEventCodes() {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}")

        if (!currentUser?.organization_id) {
          console.error("Organização não identificada")
          return
        }

        // Buscar tipos de eventos
        const { data: eventTypes, error: eventTypesError } = await supabase.from("event_types").select("*")

        if (eventTypesError) {
          console.error("Erro ao buscar tipos de eventos:", eventTypesError)
          return
        }

        // Buscar códigos de eventos
        const { data: eventCodesData, error: eventCodesError } = await supabase
          .from("event_codes")
          .select("*")
          .eq("organization_id", currentUser.organization_id)

        if (eventCodesError) {
          console.error("Erro ao buscar códigos de eventos:", eventCodesError)
          return
        }

        // Mapear dados para o formato esperado pelo componente
        const formattedCodes: EventCode[] = eventTypes.map((eventType) => {
          const statutoryCode = eventCodesData.find(
            (code) => code.event_type_id === eventType.id && code.contract_type === "EFETIVO",
          )
          const contractCode = eventCodesData.find(
            (code) => code.event_type_id === eventType.id && code.contract_type === "COMISSIONADO",
          )
          const temporaryCode = eventCodesData.find(
            (code) => code.event_type_id === eventType.id && code.contract_type === "TEMPORARIO",
          )

          return {
            id: eventType.id,
            eventType: eventType.label,
            statutoryCode: statutoryCode?.code?.toString() || "",
            contractCode: contractCode?.code?.toString() || "",
            temporaryCode: temporaryCode?.code?.toString() || "",
          }
        })

        setEventCodes(formattedCodes)
      } catch (error) {
        console.error("Erro ao carregar códigos de eventos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEventCodes()
  }, [])

  const handleInputChange = (id: string, field: string, value: string) => {
    setEventCodes((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const supabase = getSupabase()
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}")

      if (!currentUser?.organization_id) {
        toast({
          title: "Erro",
          description: "Organização não identificada",
          variant: "destructive",
        })
        return
      }

      // Para cada tipo de evento, atualizar ou criar os códigos para cada tipo de contrato
      for (const eventCode of eventCodes) {
        // Estatutário (EFETIVO)
        await upsertEventCode(
          supabase,
          currentUser.organization_id,
          eventCode.id,
          "EFETIVO",
          Number.parseInt(eventCode.statutoryCode) || 0,
        )

        // Comissionado
        await upsertEventCode(
          supabase,
          currentUser.organization_id,
          eventCode.id,
          "COMISSIONADO",
          Number.parseInt(eventCode.contractCode) || 0,
        )

        // Temporário
        await upsertEventCode(
          supabase,
          currentUser.organization_id,
          eventCode.id,
          "TEMPORARIO",
          Number.parseInt(eventCode.temporaryCode) || 0,
        )
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Função auxiliar para inserir ou atualizar um código de evento
  async function upsertEventCode(
    supabase: any,
    organizationId: string,
    eventTypeId: string,
    contractType: string,
    code: number,
  ) {
    // Verificar se o código já existe
    const { data, error: selectError } = await supabase
      .from("event_codes")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("event_type_id", eventTypeId)
      .eq("contract_type", contractType)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Erro ao verificar código existente:", selectError)
      return
    }

    if (data) {
      // Atualizar código existente
      const { error: updateError } = await supabase.from("event_codes").update({ code }).eq("id", data.id)

      if (updateError) {
        console.error("Erro ao atualizar código:", updateError)
      }
    } else {
      // Inserir novo código
      const { error: insertError } = await supabase.from("event_codes").insert({
        organization_id: organizationId,
        event_type_id: eventTypeId,
        contract_type: contractType,
        code,
      })

      if (insertError) {
        console.error("Erro ao inserir código:", insertError)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tipo de Evento</TableHead>
              <TableHead>Código Estatutário</TableHead>
              <TableHead>Código Contratado</TableHead>
              <TableHead>Código Temporário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventCodes.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.eventType}</TableCell>
                <TableCell>
                  <Input
                    value={event.statutoryCode}
                    onChange={(e) => handleInputChange(event.id, "statutoryCode", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={event.contractCode}
                    onChange={(e) => handleInputChange(event.id, "contractCode", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={event.temporaryCode}
                    onChange={(e) => handleInputChange(event.id, "temporaryCode", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
