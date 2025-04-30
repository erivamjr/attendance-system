import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ message: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Verificar se a senha é a de teste
    if (password === "password") {
      const supabase = getSupabase()

      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

      if (userError) {
        return NextResponse.json({ message: "Usuário não encontrado", error: userError.message }, { status: 401 })
      }

      return NextResponse.json({
        message: "Login bem-sucedido",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id,
          unit_id: user.unit_id,
        },
      })
    } else {
      return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error }, { status: 500 })
  }
}
