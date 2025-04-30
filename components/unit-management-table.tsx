"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Users, Plus, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSupabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { EmployeeForm } from "@/components/employee-form"

type Unit = {
  id: string
  name: string
  location: string
  responsible: string | null
  employeeCount: number
}

type Employee = {
  id: string
  name: string
  cpf: string
  role: string
  contract_type: string
  unit_id: string
  id: string
}

type UnitManagementTableProps = {
  units: Unit[]
  onEdit: (unit: Unit) => void
  onRefresh: () => void
}

export function UnitManagementTable({ units, onEdit, onRefresh }: UnitManagementTableProps) {
  const router = useRouter()
  const [showEmployeesDialog, setShowEmployeesDialog] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectedUnitName, setSelectedUnitName] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  // Add new states for employee management
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const handleViewEmployees = async (unit: Unit) => {
    setSelectedUnitId(unit.id)
    setSelectedUnitName(unit.name)
    setShowEmployeesDialog(true)
    setLoadingEmployees(true)

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("employees").select("*").eq("unit_id", unit.id)

      if (error) throw error

      setEmployees(data || [])
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários desta unidade.",
        variant: "destructive",
      })
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleAddEmployee = () => {
    if (!selectedUnitId) return
    setShowAddEmployeeDialog(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEditEmployeeDialog(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Tem certeza que deseja remover este servidor?")) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase.from("employees").delete().eq("id", employeeId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Servidor removido com sucesso!",
      })

      // Refresh the employees list
      if (selectedUnitId) {
        const { data, error: refreshError } = await supabase.from("employees").select("*").eq("unit_id", selectedUnitId)

        if (!refreshError) {
          setEmployees(data || [])
        }
      }
    } catch (error) {
      console.error("Erro ao remover funcionário:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o servidor.",
        variant: "destructive",
      })
    }
  }

  const handleEmployeeFormSuccess = async () => {
    setShowAddEmployeeDialog(false)
    setShowEditEmployeeDialog(false)
    setSelectedEmployee(null)

    // Refresh the employees list
    if (selectedUnitId) {
      setLoadingEmployees(true)
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase.from("employees").select("*").eq("unit_id", selectedUnitId)

        if (error) throw error

        setEmployees(data || [])
      } catch (error) {
        console.error("Erro ao recarregar funcionários:", error)
      } finally {
        setLoadingEmployees(false)
      }
    }
  }

  const handleCloseEmployeeDialogs = () => {
    setShowAddEmployeeDialog(false)
    setShowEditEmployeeDialog(false)
    setSelectedEmployee(null)
  }

  const handleCloseEmployeesDialog = () => {
    setShowEmployeesDialog(false)
    setSelectedUnitId(null)
    setSelectedUnitName("")
    setEmployees([])
    setShowAddEmployeeDialog(false)
    setShowEditEmployeeDialog(false)
    setSelectedEmployee(null)
    onRefresh() // Refresh the units list to update the employee count
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Unidade</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Servidores</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell className="font-medium">{unit.name}</TableCell>
              <TableCell>{unit.location}</TableCell>
              <TableCell>{unit.responsible || "Não atribuído"}</TableCell>
              <TableCell>{unit.employeeCount}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(unit)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewEmployees(unit)}>
                      <Users className="mr-2 h-4 w-4" />
                      Ver servidores
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogo para visualizar funcionários */}
      <Dialog
        open={showEmployeesDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseEmployeesDialog()
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Servidores da Unidade: {selectedUnitName}</DialogTitle>
            <DialogDescription>Lista de servidores cadastrados nesta unidade.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mb-4">
            <Button onClick={handleAddEmployee} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Servidor
            </Button>
          </div>

          {loadingEmployees ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">Nenhum servidor cadastrado nesta unidade.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.cpf}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.contract_type}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar funcionário */}
      <Dialog
        open={showAddEmployeeDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseEmployeeDialogs()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Servidor</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo servidor à unidade {selectedUnitName}.
            </DialogDescription>
          </DialogHeader>
          {selectedUnitId && (
            <EmployeeForm
              unitId={selectedUnitId}
              onSuccess={handleEmployeeFormSuccess}
              onCancel={handleCloseEmployeeDialogs}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar funcionário */}
      <Dialog
        open={showEditEmployeeDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseEmployeeDialogs()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Servidor</DialogTitle>
            <DialogDescription>Atualize os dados do servidor.</DialogDescription>
          </DialogHeader>
          {selectedUnitId && selectedEmployee && (
            <EmployeeForm
              unitId={selectedUnitId}
              onSuccess={handleEmployeeFormSuccess}
              onCancel={handleCloseEmployeeDialogs}
              editEmployee={selectedEmployee}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
