"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Dados de exemplo - em produção, viriam da API
const initialEventCodes = [
  {
    id: 1,
    eventType: "Falta",
    statutoryCode: "101",
    contractCode: "201",
    temporaryCode: "301",
  },
  {
    id: 2,
    eventType: "Adicional Noturno",
    statutoryCode: "102",
    contractCode: "202",
    temporaryCode: "302",
  },
  {
    id: 3,
    eventType: "Hora Extra 50%",
    statutoryCode: "103",
    contractCode: "203",
    temporaryCode: "303",
  },
  {
    id: 4,
    eventType: "Hora Extra 100%",
    statutoryCode: "104",
    contractCode: "204",
    temporaryCode: "304",
  },
  {
    id: 5,
    eventType: "Sobreaviso",
    statutoryCode: "105",
    contractCode: "205",
    temporaryCode: "305",
  },
  {
    id: 6,
    eventType: "Férias",
    statutoryCode: "106",
    contractCode: "206",
    temporaryCode: "306",
  },
]

export function EventCodeSettings() {
  const [eventCodes, setEventCodes] = useState(initialEventCodes)

  const handleInputChange = (id: number, field: string, value: string) => {
    setEventCodes((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSave = () => {
    // Em produção, isso salvaria os dados na API
    alert("Configurações salvas com sucesso!")
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
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
