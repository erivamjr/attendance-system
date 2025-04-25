import { Edit, MoreHorizontal, Users } from "lucide-react"

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

// Dados de exemplo - em produção, viriam da API
const units = [
  {
    id: 1,
    name: "UBS Vila Nova",
    responsible: "Maria Silva",
    employeeCount: 24,
    address: "Rua das Flores, 123 - Vila Nova",
  },
  {
    id: 2,
    name: "UBS Central",
    responsible: "João Santos",
    employeeCount: 32,
    address: "Av. Principal, 500 - Centro",
  },
  {
    id: 3,
    name: "UBS Jardim",
    responsible: "Ana Oliveira",
    employeeCount: 18,
    address: "Rua das Árvores, 45 - Jardim",
  },
  {
    id: 4,
    name: "UPA 24h",
    responsible: "Carlos Ferreira",
    employeeCount: 42,
    address: "Av. das Nações, 1000 - Centro",
  },
  {
    id: 5,
    name: "Hospital Municipal",
    responsible: "Juliana Costa",
    employeeCount: 156,
    address: "Rua da Saúde, 789 - Centro",
  },
]

export function UnitManagementTable() {
  return (
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
            <TableCell>{unit.address}</TableCell>
            <TableCell>{unit.responsible}</TableCell>
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
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Ver Servidores
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
