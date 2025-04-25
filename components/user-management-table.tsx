import { Edit, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
const users = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria.silva@example.com",
    cpf: "123.456.789-00",
    role: "Admin",
    unit: "Secretaria de Saúde",
    status: "Ativo",
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao.santos@example.com",
    cpf: "987.654.321-00",
    role: "Responsável",
    unit: "UBS Central",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Ana Oliveira",
    email: "ana.oliveira@example.com",
    cpf: "456.789.123-00",
    role: "Responsável",
    unit: "UBS Jardim",
    status: "Ativo",
  },
  {
    id: 4,
    name: "Carlos Ferreira",
    email: "carlos.ferreira@example.com",
    cpf: "789.123.456-00",
    role: "Responsável",
    unit: "UPA 24h",
    status: "Ativo",
  },
  {
    id: 5,
    name: "Juliana Costa",
    email: "juliana.costa@example.com",
    cpf: "321.654.987-00",
    role: "Responsável",
    unit: "Hospital Municipal",
    status: "Inativo",
  },
]

export function UserManagementTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail / CPF</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>
              {user.email}
              <br />
              <span className="text-xs text-muted-foreground">{user.cpf}</span>
            </TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.unit}</TableCell>
            <TableCell>
              <Badge
                variant={user.status === "Ativo" ? "outline" : "secondary"}
                className={user.status === "Ativo" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
              >
                {user.status}
              </Badge>
            </TableCell>
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
                  <DropdownMenuItem className={user.status === "Ativo" ? "text-red-600" : "text-green-600"}>
                    <Trash className="mr-2 h-4 w-4" />
                    {user.status === "Ativo" ? "Desativar" : "Ativar"}
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
