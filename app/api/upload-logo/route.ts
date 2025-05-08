import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Obter o arquivo da requisição
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Tipo de arquivo inválido. Envie apenas imagens." },
        { status: 400 },
      )
    }

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Arquivo muito grande. O tamanho máximo é 2MB." },
        { status: 400 },
      )
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

    // Gerar nome de arquivo único
    const fileExt = file.name.split(".").pop()
    const fileName = `logo_${Date.now()}.${fileExt}`

    // Converter o arquivo para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Fazer upload do arquivo
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("logos")
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error("Erro ao fazer upload:", uploadError)
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
    }

    // Obter URL pública
    const { data: urlData } = supabaseAdmin.storage.from("logos").getPublicUrl(fileName)

    // Atualizar a URL da logo na tabela organizations
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (orgError && orgError.code !== "PGRST116") {
      console.error("Erro ao buscar organização:", orgError)
      return NextResponse.json({ success: false, error: orgError.message }, { status: 500 })
    }

    if (orgData?.id) {
      // Atualizar organização existente
      const { error: updateError } = await supabaseAdmin
        .from("organizations")
        .update({ logo_url: fileName })
        .eq("id", orgData.id)

      if (updateError) {
        console.error("Erro ao atualizar organização:", updateError)
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    } else {
      // Criar nova organização
      const { error: insertError } = await supabaseAdmin
        .from("organizations")
        .insert({ name: "Minha Organização", logo_url: fileName })

      if (insertError) {
        console.error("Erro ao criar organização:", insertError)
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
    })
  } catch (error) {
    console.error("Erro ao processar upload:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
