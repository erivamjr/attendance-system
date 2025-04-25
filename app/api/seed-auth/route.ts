import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()

    // Buscar organização
    const { data: org, error: orgError } = await supabase.from("organizations").select("id").single()

    if (orgError) {
      return NextResponse.json({ message: "Organização não encontrada. Execute /api/seed primeiro." }, { status: 404 })
    }

    // Criar usuários de teste com autenticação
    const users = [
      {
        email: "admin@example.com",
        password: "password",
        name: "Maria Silva",
        role: "admin",
        organization_id: org.id,
        unit_id: null,
      },
      {
        email: "joao.santos@example.com",
        password: "password",
        name: "João Santos",
        role: "responsible",
        organization_id: org.id,
        unit_id: null, // Será atualizado depois
      },
      {
        email: "ana.oliveira@example.com",
        password: "password",
        name: "Ana Oliveira",
        role: "responsible",
        organization_id: org.id,
        unit_id: null, // Será atualizado depois
      },
    ]

    // Buscar unidades para associar aos responsáveis
    const { data: units, error: unitsError } = await supabase.from("units").select("id, name").limit(3)

    if (unitsError) {
      return NextResponse.json({ message: "Erro ao buscar unidades", error: unitsError.message }, { status: 500 })
    }

    // Atualizar unit_id dos usuários responsáveis
    if (units && units.length >= 2) {
      users[1].unit_id = units[0].id
      users[2].unit_id = units[1].id
    }

    const results = []

    // Criar usuários
    for (const user of users) {
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        results.push({
          email: user.email,
          success: false,
          error: authError.message,
        })
        continue
      }

      // 2. Atualizar o registro existente na tabela users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .update({
          id: authData.user.id,
          password_hash: "auth_managed", // Não armazenamos a senha, pois é gerenciada pelo Auth
        })
        .eq("email", user.email)
        .select()

      results.push({
        email: user.email,
        success: !userError,
        error: userError ? userError.message : null,
        user: userData,
      })
    }

    return NextResponse.json({
      message: "Seed de autenticação concluído",
      results,
    })
  } catch (error) {
    console.error("Erro ao realizar seed de autenticação:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error }, { status: 500 })
  }
}
