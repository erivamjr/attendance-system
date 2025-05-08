import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Obter o nome do arquivo da requisição
    const { fileName } = await request.json()

    if (!fileName) {
      return NextResponse.json({ success: false, error: "Nome do arquivo não fornecido" }, { status: 400 })
    }

    // Usar a chave de serviço para ignorar RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Variáveis de ambiente do Supabase não configuradas" },
        { status: 500 },
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Remover o arquivo
    const { error: removeError } = await supabaseAdmin.storage.from("logos").remove([fileName])

    if (removeError) {
      console.error("Erro ao remover arquivo:", removeError)
      return NextResponse.json({ success: false, error: removeError.message }, { status: 500 })
    }

    // Atualizar a URL da logo na tabela organizations
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("logo_url", fileName)
      .maybeSingle()

    if (orgError && orgError.code !== "PGRST116") {
      console.error("Erro ao buscar organização:", orgError)
      return NextResponse.json({ success: false, error: orgError.message }, { status: 500 })
    }

    if (orgData?.id) {
      // Atualizar organização existente
      const { error: updateError } = await supabaseAdmin
        .from("organizations")
        .update({ logo_url: null })
        .eq("id", orgData.id)

      if (updateError) {
        console.error("Erro ao atualizar organização:", updateError)
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Logo removida com sucesso",
    })
  } catch (error) {
    console.error("Erro ao processar remoção:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
