"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabase } from "@/lib/supabase"
import { UserManagementTable } from "@/components/user-management-table"
import { UserForm } from "@/components/user-form"
import { toast } from "@/components/ui/use-toast"

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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      // Buscar usuários com informações da unidade
      const { data, error } = await supabase
        .from("users")
        .select(`
        id, 
        name, 
        email, 
        cpf,
        role, 
        is_active,
        unit_id,
        units(name)
      `)
        .order("name")

      if (error) throw error

      // Mapear dados para o formato esperado
      const formattedUsers = data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf || "",
        role: user.role,
        unit: user.units?.name || null,
        unit_id: user.unit_id,
        status: user.is_active ? "Ativo" : "Inativo",
      }))

      setUsers(formattedUsers)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setShowAddDialog(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditDialog(true)
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const supabase = getSupabase()
      const newStatus = currentStatus === "Ativo" ? false : true

      const { error } = await supabase.from("users").update({ is_active: newStatus }).eq("id", userId)

      if (error) throw error

      // Atualizar lista de usuários
      fetchUsers()
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error)
      throw error
    }
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    fetchUsers()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setSelectedUser(null)
    fetchUsers()
  }

  const handleCloseAddDialog = () => {
    setShowAddDialog(false)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <Button onClick={handleAddUser} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <UserManagementTable
        users={users}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleUserStatus}
        onRefresh={fetchUsers}
      />

      {/* Diálogo para adicionar usuário */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseAddDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
            <DialogDescription>Preencha os dados para adicionar um novo usuário ao sistema.</DialogDescription>
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
          {selectedUser && (
            <UserForm editUser={selectedUser} onSuccess={handleEditSuccess} onCancel={handleCloseEditDialog} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
