import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { unitId } = body

    if (!unitId) {
      return NextResponse.json({ message: "ID da unidade é obrigatório" }, { status: 400 })
    }

    const supabase = getSupabase()

    // Verificar se a organização existe
    const { data: org, error: orgError } = await supabase.from("organizations").select("id").single()

    if (orgError) {
      // Criar organização se não existir
      const { data: newOrg, error: newOrgError } = await supabase
        .from("organizations")
        .insert({
          name: "Secretaria de Saúde",
          slug: "saude",
          logo_url: null,
        })
        .select()
        .single()

      if (newOrgError) {
        return NextResponse.json(
          {
            message: "Erro ao criar organização",
            error: newOrgError.message,
          },
          { status: 500 },
        )
      }

      // Usar o ID da nova organização
      const organizationId = newOrg.id

      // Criar funcionários de teste
      const testEmployees = [
        {
          organization_id: organizationId,
          unit_id: unitId,
          name: "João da Silva",
          cpf: "123.456.789-00",
          role: "Enfermeiro",
          contract_type: "EFETIVO",
        },
        {
          organization_id: organizationId,
          unit_id: unitId,
          name: "Maria Oliveira",
          cpf: "987.654.321-00",
          role: "Médica",
          contract_type: "EFETIVO",
        },
        {
          organization_id: organizationId,
          unit_id: unitId,
          name: "Pedro Santos",
          cpf: "456.789.123-00",
          role: "Técnico de Enfermagem",
          contract_type: "TEMPORARIO",
        },
      ]

      const { data: createdEmployees, error: createError } = await supabase
        .from("employees")
        .insert(testEmployees)
        .select()

      if (createError) {
        return NextResponse.json(
          {
            message: "Erro ao criar funcionários de teste",
            error: createError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Dados inicializados com sucesso",
        employees: createdEmployees,
      })
    } else {
      // Organização existe, verificar se há funcionários
      const { data: employees, error: employeesError } = await supabase
        .from("employees")
        .select("*")
        .eq("unit_id", unitId)

      if (employeesError) {
        return NextResponse.json(
          {
            message: "Erro ao buscar funcionários",
            error: employeesError.message,
          },
          { status: 500 },
        )
      }

      // Se não há funcionários, criar alguns para teste
      if (!employees || employees.length === 0) {
        const testEmployees = [
          {
            organization_id: org.id,
            unit_id: unitId,
            name: "João da Silva",
            cpf: "123.456.789-00",
            role: "Enfermeiro",
            contract_type: "EFETIVO",
          },
          {
            organization_id: org.id,
            unit_id: unitId,
            name: "Maria Oliveira",
            cpf: "987.654.321-00",
            role: "Médica",
            contract_type: "EFETIVO",
          },
          {
            organization_id: org.id,
            unit_id: unitId,
            name: "Pedro Santos",
            cpf: "456.789.123-00",
            role: "Técnico de Enfermagem",
            contract_type: "TEMPORARIO",
          },
        ]

        const { data: createdEmployees, error: createError } = await supabase
          .from("employees")
          .insert(testEmployees)
          .select()

        if (createError) {
          return NextResponse.json(
            {
              message: "Erro ao criar funcionários de teste",
              error: createError.message,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          message: "Dados inicializados com sucesso",
          employees: createdEmployees,
        })
      }

      return NextResponse.json({
        message: "Dados já inicializados",
        employees: employees,
      })
    }
  } catch (error) {
    console.error("Erro ao inicializar dados:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error,
      },
      { status: 500 },
    )
  }
}
