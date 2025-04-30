import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()

    // 1. Verificar se a organização existe
    let organizationId: string
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

      organizationId = newOrg.id
    } else {
      organizationId = org.id
    }

    // 2. Criar unidades de teste se não existirem
    const { data: existingUnits, error: unitsError } = await supabase.from("units").select("id, name")

    let units = existingUnits || []

    if (unitsError || units.length === 0) {
      const unitsToCreate = [
        { name: "UBS Vila Nova", location: "Rua das Flores, 123 - Vila Nova" },
        { name: "UBS Central", location: "Av. Principal, 500 - Centro" },
        { name: "UBS Jardim", location: "Rua das Árvores, 45 - Jardim" },
      ]

      const unitsWithOrgId = unitsToCreate.map((unit) => ({
        ...unit,
        organization_id: organizationId,
      }))

      const { data: newUnits, error: createUnitsError } = await supabase.from("units").insert(unitsWithOrgId).select()

      if (createUnitsError) {
        return NextResponse.json(
          {
            message: "Erro ao criar unidades",
            error: createUnitsError.message,
          },
          { status: 500 },
        )
      }

      units = newUnits
    }

    // 3. Criar usuários de teste
    const testUsers = [
      {
        email: "admin@example.com",
        password: "password",
        name: "Maria Silva",
        role: "admin",
        unit_id: null,
      },
      {
        email: "responsavel1@example.com",
        password: "password",
        name: "João Santos",
        role: "responsible",
        unit_id: units[0]?.id,
      },
      {
        email: "responsavel2@example.com",
        password: "password",
        name: "Ana Oliveira",
        role: "responsible",
        unit_id: units[1]?.id,
      },
    ]

    const createdUsers = []

    for (const user of testUsers) {
      // Verificar se o usuário já existe
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single()

      if (existingUser) {
        // Usuário já existe, apenas adicionar à lista
        createdUsers.push({
          email: user.email,
          password: user.password,
          name: existingUser.name,
          role: existingUser.role,
          unit: units.find((u) => u.id === existingUser.unit_id)?.name || "Sem unidade",
        })
      } else {
        // Criar novo usuário
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({
            id: `test-user-${createdUsers.length + 1}`, // ID fictício para usuário de teste
            organization_id: organizationId,
            name: user.name,
            email: user.email,
            password_hash: "password", // Não é seguro, apenas para teste
            role: user.role,
            unit_id: user.unit_id,
          })
          .select()
          .single()

        if (createUserError) {
          console.error(`Erro ao criar usuário ${user.email}:`, createUserError)
          // Continuar com o próximo usuário
          continue
        }

        createdUsers.push({
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          unit: units.find((u) => u.id === user.unit_id)?.name || "Sem unidade",
        })
      }
    }

    return NextResponse.json({
      message: "Usuários de teste configurados com sucesso",
      users: createdUsers,
    })
  } catch (error) {
    console.error("Erro ao configurar usuários de teste:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error,
      },
      { status: 500 },
    )
  }
}
