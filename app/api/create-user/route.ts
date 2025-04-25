import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role, organization_id, unit_id } = body

    if (!email || !password || !name || !role || !organization_id) {
      return NextResponse.json({ message: "Dados incompletos para criação do usuário" }, { status: 400 })
    }

    const supabase = getSupabase()

    // 1. Criar o usuário na autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Erro ao criar usuário na autenticação:", authError)
      return NextResponse.json({ message: "Erro ao criar usuário", error: authError.message }, { status: 500 })
    }

    // 2. Criar o registro do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        organization_id,
        name,
        email,
        password_hash: "auth_managed", // Não armazenamos a senha, pois é gerenciada pelo Auth
        role,
        unit_id: unit_id || null,
      })
      .select()
      .single()

    if (userError) {
      console.error("Erro ao criar registro do usuário:", userError)
      // Tentar remover o usuário da autenticação para manter consistência
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { message: "Erro ao criar registro do usuário", error: userError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "Usuário criado com sucesso", user: userData }, { status: 201 })
  } catch (error) {
    console.error("Erro ao processar a requisição:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error }, { status: 500 })
  }
}
