import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()

    // Verificar se já existe um usuário admin
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@example.com")
      .single()

    if (existingUserError && existingUserError.code !== "PGRST116") {
      return NextResponse.json(
        { message: "Erro ao verificar usuário existente", error: existingUserError.message },
        { status: 500 },
      )
    }

    if (existingUser) {
      // Criar usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: "admin@example.com",
        password: "password",
        email_confirm: true,
      })

      if (authError) {
        return NextResponse.json(
          { message: "Erro ao criar usuário na autenticação", error: authError.message },
          { status: 500 },
        )
      }

      // Atualizar o ID do usuário na tabela users
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ id: authData.user.id })
        .eq("email", "admin@example.com")
        .select()

      if (updateError) {
        return NextResponse.json(
          { message: "Erro ao atualizar ID do usuário", error: updateError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Usuário de teste criado com sucesso",
        user: updatedUser,
      })
    } else {
      return NextResponse.json(
        { message: "Usuário admin não encontrado. Execute o script SQL primeiro." },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Erro ao criar usuário de teste:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error }, { status: 500 })
  }
}
