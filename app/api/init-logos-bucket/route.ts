import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
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

    // Verificar se o bucket já existe
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("Erro ao listar buckets:", bucketsError)
      return NextResponse.json({ success: false, error: bucketsError.message }, { status: 500 })
    }

    const logosBucketExists = buckets.some((bucket) => bucket.name === "logos")

    if (logosBucketExists) {
      console.log("Bucket 'logos' já existe")
      return NextResponse.json({ success: true, message: "Bucket já existe" })
    }

    // Criar o bucket de logos
    const { error: createBucketError } = await supabaseAdmin.storage.createBucket("logos", {
      public: true,
      fileSizeLimit: 2097152, // 2MB
    })

    if (createBucketError) {
      console.error("Erro ao criar bucket:", createBucketError)
      return NextResponse.json({ success: false, error: createBucketError.message }, { status: 500 })
    }

    // Definir políticas de acesso público para o bucket
    try {
      await supabaseAdmin.storage.from("logos").getPublicUrl("test.txt")
    } catch (error) {
      console.log("Erro ao testar URL pública (esperado se o arquivo não existir)")
    }

    // Verificar se a tabela organizations existe
    const { error: tableCheckError } = await supabaseAdmin.from("organizations").select("id").limit(1)

    if (tableCheckError && tableCheckError.code === "PGRST116") {
      // Tabela não existe, criar
      const { error: createTableError } = await supabaseAdmin.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS organizations (
            id SERIAL PRIMARY KEY,
            name TEXT,
            logo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createTableError) {
        console.error("Erro ao criar tabela organizations:", createTableError)
      }
    }

    return NextResponse.json({ success: true, message: "Bucket criado com sucesso" })
  } catch (error) {
    console.error("Erro ao inicializar bucket de logos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
