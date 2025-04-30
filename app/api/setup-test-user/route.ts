import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()

    // 1. Verificar se a organização existe
    const { data: org, error: orgError } = await supabase.from("organizations").select("id").single()

    if (orgError) {
      console.error("Erro ao buscar organização:", orgError)

      // Se a organização não existe, vamos criar uma
      if (orgError.code === "PGRST116") {
        const { data: newOrg, error: createOrgError } = await supabase
          .from("organizations")
          .insert({
            name: "Secretaria de Saúde",
            slug: "saude",
            logo_url: null,
          })
          .select()
          .single()

        if (createOrgError) {
          return NextResponse.json(
            {
              message: "Erro ao criar organização",
              error: createOrgError.message,
            },
            { status: 500 },
          )
        }

        console.log("Organização criada com sucesso:", newOrg)
      } else {
        return NextResponse.json(
          {
            message: "Erro ao buscar organização",
            error: orgError.message,
          },
          { status: 500 },
        )
      }
    }

    // Buscar organização novamente (caso tenha sido criada)
    const { data: organization } = await supabase.from("organizations").select("id").single()

    if (!organization) {
      return NextResponse.json(
        {
          message: "Organização não encontrada e não foi possível criar",
        },
        { status: 500 },
      )
    }

    // 2. Verificar se o usuário já existe na autenticação
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserByEmail("admin@example.com")

    // 3. Se o usuário já existe na autenticação, remova-o para recriar
    if (authUser && authUser.user) {
      await supabase.auth.admin.deleteUser(authUser.user.id)
    }

    // 4. Criar o usuário na autenticação
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@example.com",
      password: "password",
      email_confirm: true,
    })

    if (authError) {
      console.error("Erro ao criar usuário na autenticação:", authError)
      return NextResponse.json(
        {
          message: "Erro ao criar usuário na autenticação",
          error: authError.message,
        },
        { status: 500 },
      )
    }

    // 5. Verificar se o usuário existe na tabela users
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@example.com")
      .single()

    if (existingUser) {
      // 6. Atualizar o ID do usuário na tabela users para corresponder ao ID da autenticação
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ id: authData.user.id })
        .eq("email", "admin@example.com")
        .select()

      if (updateError) {
        console.error("Erro ao atualizar ID do usuário:", updateError)
        return NextResponse.json(
          {
            message: "Erro ao atualizar ID do usuário",
            error: updateError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Usuário de teste atualizado com sucesso",
        user: updatedUser,
        credentials: {
          email: "admin@example.com",
          password: "password",
        },
      })
    } else {
      // 7. Criar o usuário na tabela users se não existir
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          organization_id: organization.id,
          name: "Administrador",
          email: "admin@example.com",
          password_hash: "auth_managed",
          role: "admin",
          unit_id: null,
        })
        .select()

      if (createError) {
        console.error("Erro ao criar usuário na tabela users:", createError)
        return NextResponse.json(
          {
            message: "Erro ao criar usuário na tabela users",
            error: createError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Usuário de teste criado com sucesso",
        user: newUser,
        credentials: {
          email: "admin@example.com",
          password: "password",
        },
      })
    }
  } catch (error) {
    console.error("Erro ao configurar usuário de teste:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error,
      },
      { status: 500 },
    )
  }
}
