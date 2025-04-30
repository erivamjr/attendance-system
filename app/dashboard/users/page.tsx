"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagementTable } from "@/components/user-management-table"
import { UserForm } from "@/components/user-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSupabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

type User = {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  unit: string | null
  unit_id: string | null
  status: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()

      // Buscar todos os usuários com suas unidades
      const { data, error } = await supabase.from("users").select(`
          id, 
          name, 
          email, 
          role, 
          unit_id,
          units(name)
        `)

      if (error) throw error

      // Formatar os dados para o formato esperado pela tabela
      const formattedUsers = data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: "123.456.789-00", // Valor padrão, pois não temos CPF na tabela users
        role: user.role,
        unit: user.units?.name || null,
        unit_id: user.unit_id,
        status: "Ativo", // Valor padrão, pois não temos status na tabela users
      }))

      setUsers(formattedUsers)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddUser = () => {
    setShowAddDialog(true)
  }

  const handleEditUser = (user: User) => {
    setEditUser(user)
    setShowEditDialog(true)
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    loadUsers()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditUser(null)
    loadUsers()
  }

  // Add these functions to handle dialog closing
  const handleCloseAddDialog = () => {
    setShowAddDialog(false)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setEditUser(null)
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const supabase = getSupabase()

      // Atualizar status do usuário
      // Como não temos um campo de status na tabela, vamos apenas simular a mudança
      // Em uma implementação real, você atualizaria o campo status no banco de dados

      // Atualizar a lista de usuários localmente
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: currentStatus === "Ativo" ? "Inativo" : "Ativo" } : user,
        ),
      )
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <Button className="gap-2" onClick={handleAddUser}>
          <Plus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>Gerencie os usuários e seus níveis de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <UserManagementTable
              users={users}
              onEdit={handleEditUser}
              onToggleStatus={handleToggleStatus}
              onRefresh={loadUsers}
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogo para adicionar usuário */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseAddDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Preencha os dados para adicionar um novo usuário.</DialogDescription>
          </DialogHeader>
          <UserForm onSuccess={handleAddSuccess} onCancel={handleCloseAddDialog} />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar usuário */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseEditDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados do usuário.</DialogDescription>
          </DialogHeader>
          {editUser && <UserForm onSuccess={handleEditSuccess} onCancel={handleCloseEditDialog} editUser={editUser} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
