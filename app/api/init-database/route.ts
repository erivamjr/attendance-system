import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()

    // Verificar se já existem tabelas
    const { data: tables, error: tablesError } = await supabase.rpc("get_tables")

    if (tablesError) {
      // Se a função RPC não existir, vamos criar
      await supabase.rpc("create_get_tables_function", {}, { count: "exact" }).catch(() => {
        // Ignorar erro se a função já existir
      })
    }

    // Criar tabelas básicas
    const createTablesQuery = `
    -- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Criar tabela de organizações se não existir
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      logo_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Criar tabela de unidades se não existir
    CREATE TABLE IF NOT EXISTS units (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Criar tabela de usuários se não existir
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      unit_id UUID REFERENCES units(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `

    const { error: createError } = await supabase.rpc("exec_sql", { sql: createTablesQuery })

    if (createError) {
      console.error("Erro ao criar tabelas:", createError)

      // Tentar executar SQL diretamente
      const { error: sqlError } = await supabase.sql(createTablesQuery)

      if (sqlError) {
        return NextResponse.json(
          {
            message: "Erro ao criar tabelas",
            error: sqlError.message,
          },
          { status: 500 },
        )
      }
    }

    // Inserir organização inicial se não existir
    const { data: existingOrg, error: orgCheckError } = await supabase.from("organizations").select("id").single()

    if (orgCheckError && orgCheckError.code === "PGRST116") {
      const { data: newOrg, error: createOrgError } = await supabase
        .from("organizations")
        .insert({
          name: "Secretaria de Saúde",
          slug: "saude",
          logo_url: null,
        })
        .select()

      if (createOrgError) {
        console.error("Erro ao criar organização:", createOrgError)
        return NextResponse.json(
          {
            message: "Erro ao criar organização",
            error: createOrgError.message,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      message: "Banco de dados inicializado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error,
      },
      { status: 500 },
    )
  }
}
