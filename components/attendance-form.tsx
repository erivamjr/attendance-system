"use client"

import { useState, useEffect } from "react"
import { Copy, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

type Employee = {
  id: string
  name: string
  cpf: string
  role: string
  contract_type: string
}

type AttendanceEntry = {
  employeeId: string
  absences: string
  nightShift: string
  overtime50: string
  overtime100: string
  onCall: string
  vacation: string
  observation: string
}

export function AttendanceForm() {
  const [month, setMonth] = useState(new Date().getMonth() + 1 + "")
  const [year, setYear] = useState(new Date().getFullYear() + "")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [sheetId, setSheetId] = useState<string | null>(null)

  // Recuperar informações do usuário da sessão
  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setUnitId(user.unit_id)
    }
  }, [])

  // Carregar funcionários e dados de frequência
  useEffect(() => {
    async function fetchData() {
      if (!unitId) return

      try {
        setLoading(true)
        const supabase = getSupabase()

        // Buscar funcionários da unidade
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("*")
          .eq("unit_id", unitId)

        if (employeesError) throw employeesError

        setEmployees(employeesData)

        // Verificar se já existe uma folha para o mês/ano selecionado
        const { data: sheet, error: sheetError } = await supabase
          .from("frequency_sheets")
          .select("*")
          .eq("unit_id", unitId)
          .eq("month", Number.parseInt(month))
          .eq("year", Number.parseInt(year))
          .single()

        if (sheetError && sheetError.code !== "PGRST116") {
          console.error("Erro ao buscar folha:", sheetError)
        }

        // Se existir uma folha, buscar as entradas
        if (sheet) {
          setSheetId(sheet.id)
          const supabase = getSupabase()

          const { data: entries, error: entriesError } = await supabase
            .from("frequency_entries")
            .select("*")
            .eq("sheet_id", sheet.id)

          if (entriesError) throw entriesError

          // Mapear entradas para o formato do estado
          const entriesMap = new Map()
          entries?.forEach((entry) => {
            entriesMap.set(entry.employee_id, {
              employeeId: entry.employee_id,
              absences: entry.absence_days.toString(),
              nightShift: entry.additional_night_hours.toString(),
              overtime50: entry.overtime_50_hours.toString(),
              overtime100: entry.overtime_100_hours.toString(),
              onCall: entry.on_call_hours.toString(),
              vacation: entry.vacation_days > 0 ? "Sim" : "Não",
              observation: entry.justification || "",
            })
          })

          // Criar array de dados de frequência
          const attendanceEntries = employeesData.map((employee) => {
            return (
              entriesMap.get(employee.id) || {
                employeeId: employee.id,
                absences: "0",
                nightShift: "0",
                overtime50: "0",
                overtime100: "0",
                onCall: "0",
                vacation: "Não",
                observation: "",
              }
            )
          })

          setAttendanceData(attendanceEntries)
        } else {
          // Criar entradas vazias para novos funcionários
          setSheetId(null)
          setAttendanceData(
            employeesData.map((employee) => ({
              employeeId: employee.id,
              absences: "0",
              nightShift: "0",
              overtime50: "0",
              overtime100: "0",
              onCall: "0",
              vacation: "Não",
              observation: "",
            })),
          )
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [unitId, month, year])

  const handleInputChange = (employeeId: string, field: string, value: string) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, [field]: value } : item)),
    )
  }

  const handleCopyFromPreviousMonth = async () => {
    if (!unitId) return

    try {
      // Calcular mês anterior
      let prevMonth = Number.parseInt(month) - 1
      let prevYear = Number.parseInt(year)

      if (prevMonth === 0) {
        prevMonth = 12
        prevYear--
      }
      const supabase = getSupabase()

      // Buscar folha do mês anterior
      const { data: prevSheet, error: prevSheetError } = await supabase
        .from("frequency_sheets")
        .select("*")
        .eq("unit_id", unitId)
        .eq("month", prevMonth)
        .eq("year", prevYear)
        .single()

      if (prevSheetError) {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar dados do mês anterior.",
          variant: "destructive",
        })
        return
      }

      // Buscar entradas do mês anterior
      const { data: prevEntries, error: prevEntriesError } = await supabase
        .from("frequency_entries")
        .select("*")
        .eq("sheet_id", prevSheet.id)

      if (prevEntriesError) throw prevEntriesError

      // Mapear entradas para o formato do estado
      const entriesMap = new Map()
      prevEntries?.forEach((entry) => {
        entriesMap.set(entry.employee_id, {
          employeeId: entry.employee_id,
          absences: entry.absence_days.toString(),
          nightShift: entry.additional_night_hours.toString(),
          overtime50: entry.overtime_50_hours.toString(),
          overtime100: entry.overtime_100_hours.toString(),
          onCall: entry.on_call_hours.toString(),
          vacation: entry.vacation_days > 0 ? "Sim" : "Não",
          observation: entry.justification || "",
        })
      })

      // Atualizar dados de frequência
      setAttendanceData(
        employees.map((employee) => {
          return (
            entriesMap.get(employee.id) || {
              employeeId: employee.id,
              absences: "0",
              nightShift: "0",
              overtime50: "0",
              overtime100: "0",
              onCall: "0",
              vacation: "Não",
              observation: "",
            }
          )
        }),
      )

      toast({
        title: "Sucesso",
        description: "Dados do mês anterior copiados com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao copiar dados do mês anterior:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao copiar dados do mês anterior.",
        variant: "destructive",
      })
    }
  }

  const handleSaveDraft = async () => {
    if (!unitId) return

    try {
      // Criar ou atualizar folha de frequência
      let currentSheetId = sheetId
      const supabase = getSupabase()

      if (!currentSheetId) {
        // Criar nova folha
        const { data: newSheet, error: newSheetError } = await supabase
          .from("frequency_sheets")
          .insert({
            organization_id: JSON.parse(sessionStorage.getItem("currentUser") || "{}").organization_id,
            unit_id: unitId,
            month: Number.parseInt(month),
            year: Number.parseInt(year),
            status: "draft",
            submitted_by: null,
            submitted_at: null,
          })
          .select()
          .single()

        if (newSheetError) throw newSheetError

        currentSheetId = newSheet.id
        setSheetId(currentSheetId)
      }

      // Criar ou atualizar entradas
      for (const entry of attendanceData) {
        // Verificar se a entrada já existe
        const { data: existingEntry, error: existingEntryError } = await supabase
          .from("frequency_entries")
          .select("id")
          .eq("sheet_id", currentSheetId)
          .eq("employee_id", entry.employeeId)
          .single()

        if (existingEntryError && existingEntryError.code !== "PGRST116") {
          console.error("Erro ao verificar entrada existente:", existingEntryError)
        }

        const entryData = {
          sheet_id: currentSheetId,
          employee_id: entry.employeeId,
          absence_days: Number.parseInt(entry.absences) || 0,
          additional_night_hours: Number.parseFloat(entry.nightShift) || 0,
          overtime_50_hours: Number.parseFloat(entry.overtime50) || 0,
          overtime_100_hours: Number.parseFloat(entry.overtime100) || 0,
          on_call_hours: Number.parseFloat(entry.onCall) || 0,
          vacation_days: entry.vacation === "Sim" ? 30 : 0,
          justification: entry.observation || null,
        }

        if (existingEntry) {
          // Atualizar entrada existente
          const { error: updateError } = await supabase
            .from("frequency_entries")
            .update(entryData)
            .eq("id", existingEntry.id)

          if (updateError) throw updateError
        } else {
          // Criar nova entrada
          const { error: insertError } = await supabase.from("frequency_entries").insert(entryData)

          if (insertError) throw insertError
        }
      }

      // Registrar no log
      await supabase.from("submissions_log").insert({
        sheet_id: currentSheetId,
        user_id: JSON.parse(sessionStorage.getItem("currentUser") || "{}").id,
        action: "save_draft",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Sucesso",
        description: "Rascunho salvo com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o rascunho.",
        variant: "destructive",
      })
    }
  }

  const handleFinalize = async () => {
    if (!unitId) return

    try {
      // Primeiro salvar como rascunho
      await handleSaveDraft()
      const supabase = getSupabase()

      // Atualizar status da folha para 'submitted'
      const { error: updateError } = await supabase
        .from("frequency_sheets")
        .update({
          status: "submitted",
          submitted_by: JSON.parse(sessionStorage.getItem("currentUser") || "{}").id,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", sheetId)

      if (updateError) throw updateError

      // Registrar no log
      await supabase.from("submissions_log").insert({
        sheet_id: sheetId,
        user_id: JSON.parse(sessionStorage.getItem("currentUser") || "{}").id,
        action: "submit",
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Sucesso",
        description: "Folha finalizada e enviada com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao finalizar folha:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar a folha.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    )
  }

  const monthNames = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((name, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleCopyFromPreviousMonth}>
          <Copy className="h-4 w-4" />
          Copiar do mês anterior
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Servidor</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Vínculo</TableHead>
              <TableHead className="w-[80px]">Faltas</TableHead>
              <TableHead className="w-[80px]">Ad. Noturno</TableHead>
              <TableHead className="w-[80px]">H.Ex. 50%</TableHead>
              <TableHead className="w-[80px]">H.Ex. 100%</TableHead>
              <TableHead className="w-[80px]">Sobreaviso</TableHead>
              <TableHead className="w-[80px]">Férias</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.cpf}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.contract_type}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={attendanceData[index]?.absences || "0"}
                    onChange={(e) => handleInputChange(employee.id, "absences", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={attendanceData[index]?.nightShift || "0"}
                    onChange={(e) => handleInputChange(employee.id, "nightShift", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={attendanceData[index]?.overtime50 || "0"}
                    onChange={(e) => handleInputChange(employee.id, "overtime50", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={attendanceData[index]?.overtime100 || "0"}
                    onChange={(e) => handleInputChange(employee.id, "overtime100", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={attendanceData[index]?.onCall || "0"}
                    onChange={(e) => handleInputChange(employee.id, "onCall", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={attendanceData[index]?.vacation || "Não"}
                    onValueChange={(value) => handleInputChange(employee.id, "vacation", value)}
                  >
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={attendanceData[index]?.observation || ""}
                    onChange={(e) => handleInputChange(employee.id, "observation", e.target.value)}
                    className="h-8 w-full"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
          <Save className="h-4 w-4" />
          Salvar Rascunho
        </Button>
        <Button onClick={handleFinalize}>Finalizar e Gerar PDF</Button>
      </div>
    </div>
  )
}
