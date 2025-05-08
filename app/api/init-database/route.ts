import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Usar a chave de serviço para ignorar RLS
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

    // Criar tabelas
    const { error: createTablesError } = await supabaseAdmin.rpc("create_tables")

    if (createTablesError) {
      console.error("Erro ao criar tabelas:", createTablesError)

      // Tentar abordagem alternativa se a função RPC falhar
      const { error: createTablesManuallyError } = await supabaseAdmin.from("_schema_init").select("*").limit(1)

      if (createTablesManuallyError) {
        // Criar tabela de controle de inicialização
        await supabaseAdmin.query(`
          CREATE TABLE IF NOT EXISTS _schema_init (
            id SERIAL PRIMARY KEY,
            initialized BOOLEAN DEFAULT FALSE,
            initialized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `)

        // Criar tabelas principais
        await supabaseAdmin.query(`
          -- Organizações
          CREATE TABLE IF NOT EXISTS organizations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            logo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Unidades
          CREATE TABLE IF NOT EXISTS units (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            address TEXT,
            organization_id INTEGER REFERENCES organizations(id),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Usuários
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            role TEXT NOT NULL,
            unit_id INTEGER REFERENCES units(id),
            organization_id INTEGER REFERENCES organizations(id),
            cpf TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Tipos de eventos
          CREATE TABLE IF NOT EXISTS event_types (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            description TEXT,
            organization_id INTEGER REFERENCES organizations(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Folhas de frequência
          CREATE TABLE IF NOT EXISTS frequency_sheets (
            id SERIAL PRIMARY KEY,
            month INTEGER NOT NULL,
            year INTEGER NOT NULL,
            unit_id INTEGER REFERENCES units(id),
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            closed_at TIMESTAMP WITH TIME ZONE
          );

          -- Entradas de frequência
          CREATE TABLE IF NOT EXISTS frequency_entries (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            user_id UUID REFERENCES users(id),
            sheet_id INTEGER REFERENCES frequency_sheets(id),
            event_type_id INTEGER REFERENCES event_types(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)

        // Inserir dados iniciais
        const { error: insertOrgError } = await supabaseAdmin
          .from("organizations")
          .insert({ name: "Organização Padrão" })
          .select()

        if (insertOrgError) {
          console.error("Erro ao inserir organização padrão:", insertOrgError)
        } else {
          // Buscar ID da organização
          const { data: orgData } = await supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("name", "Organização Padrão")
            .limit(1)

          if (orgData && orgData.length > 0) {
            const orgId = orgData[0].id

            // Inserir tipos de eventos padrão
            await supabaseAdmin.from("event_types").insert([
              { name: "Presente", code: "P", description: "Funcionário presente", organization_id: orgId },
              { name: "Falta", code: "F", description: "Funcionário ausente", organization_id: orgId },
              { name: "Atestado", code: "A", description: "Funcionário com atestado médico", organization_id: orgId },
              { name: "Férias", code: "V", description: "Funcionário em férias", organization_id: orgId },
            ])
          }
        }

        // Marcar como inicializado
        await supabaseAdmin.from("_schema_init").insert({ initialized: true })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
