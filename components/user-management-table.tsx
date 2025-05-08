"use client"

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
import { toast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  unit: string | null
  status: string
}

type UserManagementTableProps = {
  users: User[]
  onEdit: (user: User) => void
  onToggleStatus: (userId: string, currentStatus: string) => void
  onRefresh: () => void
}

export function UserManagementTable({ users, onEdit, onToggleStatus, onRefresh }: UserManagementTableProps) {
  const handleToggleStatus = async (user: User) => {
    try {
      await onToggleStatus(user.id, user.status)

      toast({
        title: "Sucesso",
        description: `Usuário ${user.status === "Ativo" ? "desativado" : "ativado"} com sucesso!`,
      })
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status do usuário.",
        variant: "destructive",
      })
    }
  }

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
              {user.cpf && (
                <>
                  <br />
                  <span className="text-xs text-muted-foreground">{user.cpf}</span>
                </>
              )}
            </TableCell>
            <TableCell>{user.role === "admin" ? "Admin" : "Responsável"}</TableCell>
            <TableCell>{user.unit || "—"}</TableCell>
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
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={user.status === "Ativo" ? "text-red-600" : "text-green-600"}
                    onClick={() => handleToggleStatus(user)}
                  >
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
