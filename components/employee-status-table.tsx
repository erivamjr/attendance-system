"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

type Employee = {
  id: string
  name: string
  cpf: string
  role: string
  status: string
}

export function EmployeeStatusTable() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [unitId, setUnitId] = useState<string | null>(null)

  useEffect(() => {
    // Recuperar informações do usuário da sessão
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setUnitId(user.unit_id)
    }
  }, [])

  useEffect(() => {
    async function fetchEmployees() {
      if (!unitId) return

      try {
        const supabase = getSupabase()

        // Buscar funcionários da unidade
        const { data, error } = await supabase.from("employees").select("*").eq("unit_id", unitId)

        if (error) throw error

        // Buscar folha de frequência atual
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        const { data: sheet, error: sheetError } = await supabase
          .from("frequency_sheets")
          .select("id")
          .eq("unit_id", unitId)
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .single()

        if (sheetError && sheetError.code !== "PGRST116") {
          console.error("Erro ao buscar folha:", sheetError)
        }

        // Se existir uma folha, buscar as entradas
        const entriesMap = new Map()

        if (sheet) {
          const { data: entries, error: entriesError } = await supabase
            .from("frequency_entries")
            .select("*")
            .eq("sheet_id", sheet.id)

          if (entriesError) {
            console.error("Erro ao buscar entradas:", entriesError)
          } else if (entries) {
            // Criar mapa de entradas por funcionário
            entries.forEach((entry) => {
              entriesMap.set(entry.employee_id, entry)
            })
          }
        }

        // Mapear funcionários com status
        const employeesWithStatus = data.map((emp) => {
          const entry = entriesMap.get(emp.id)
          const status = entry ? "Preenchido" : "Pendente"

          return {
            id: emp.id,
            name: emp.name,
            cpf: emp.cpf,
            role: emp.role,
            status,
          }
        })

        setEmployees(employeesWithStatus)
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [unitId])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.cpf}</TableCell>
            <TableCell>{employee.role}</TableCell>
            <TableCell>
              <Badge variant={employee.status === "Preenchido" ? "success" : "destructive"}>{employee.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
