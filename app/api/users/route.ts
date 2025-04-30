import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role, organization_id, unit_id } = body

    if (!name || !email || !role || !organization_id) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    const supabase = getSupabase()

    // Gerar um UUID para o usuário
    const userId = crypto.randomUUID()

    // Inserir usuário com o UUID gerado
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        name,
        email,
        password_hash: "password", // Senha fictícia para teste
        role,
        organization_id,
        unit_id: unit_id === "none" ? null : unit_id || null,
      })
      .select()

    if (error) {
      return NextResponse.json({ message: "Erro ao criar usuário", error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Usuário criado com sucesso", user: data[0] }, { status: 201 })
  } catch (error) {
    console.error("Erro ao processar a requisição:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error }, { status: 500 })
  }
}
