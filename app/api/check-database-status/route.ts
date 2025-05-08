import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()

    // Verificar se as tabelas principais existem
    const { data: tables, error } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'frequency_sheets'
        ) as has_frequency_sheets,
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'organizations'
        ) as has_organizations;
      `,
    })

    if (error) {
      throw error
    }

    const initialized = tables && tables[0] && tables[0].has_frequency_sheets

    return NextResponse.json({
      success: true,
      initialized,
    })
  } catch (error) {
    console.error("Erro ao verificar status do banco de dados:", error)
    return NextResponse.json(
      {
        success: false,
        initialized: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
