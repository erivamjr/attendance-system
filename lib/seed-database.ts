import { getSupabase } from "./supabase"

export async function seedDatabase() {
  console.log("Iniciando seed do banco de dados...")

  try {
    const supabase = getSupabase()

    // Criar organização
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: "Secretaria de Saúde",
        slug: "saude",
        logo_url: null,
      })
      .select()
      .single()

    if (orgError) throw orgError
    console.log("Organização criada:", org.id)

    // Criar tipos de eventos
    const eventTypes = [
      { name: "absence", label: "Falta" },
      { name: "night_shift", label: "Adicional Noturno" },
      { name: "overtime_50", label: "Hora Extra 50%" },
      { name: "overtime_100", label: "Hora Extra 100%" },
      { name: "on_call", label: "Sobreaviso" },
      { name: "vacation", label: "Férias" },
    ]

    const { data: createdEventTypes, error: eventTypesError } = await supabase
      .from("event_types")
      .insert(eventTypes)
      .select()

    if (eventTypesError) throw eventTypesError
    console.log("Tipos de eventos criados:", createdEventTypes.length)

    // Criar códigos de eventos
    const eventCodes = []
    const contractTypes = ["EFETIVO", "TEMPORARIO", "COMISSIONADO"]

    for (const eventType of createdEventTypes) {
      for (const contractType of contractTypes) {
        // Gerar um código aleatório entre 100 e 999
        const code = Math.floor(Math.random() * 900) + 100

        eventCodes.push({
          organization_id: org.id,
          contract_type: contractType,
          event_type_id: eventType.id,
          code,
        })
      }
    }

    const { data: createdEventCodes, error: eventCodesError } = await supabase
      .from("event_codes")
      .insert(eventCodes)
      .select()

    if (eventCodesError) throw eventCodesError
    console.log("Códigos de eventos criados:", createdEventCodes.length)

    // Criar unidades
    const units = [
      { name: "UBS Vila Nova", location: "Rua das Flores, 123 - Vila Nova" },
      { name: "UBS Central", location: "Av. Principal, 500 - Centro" },
      { name: "UBS Jardim", location: "Rua das Árvores, 45 - Jardim" },
      { name: "UPA 24h", location: "Av. das Nações, 1000 - Centro" },
      { name: "Hospital Municipal", location: "Rua da Saúde, 789 - Centro" },
    ]

    const unitsWithOrgId = units.map((unit) => ({
      ...unit,
      organization_id: org.id,
    }))

    const { data: createdUnits, error: unitsError } = await supabase.from("units").insert(unitsWithOrgId).select()

    if (unitsError) throw unitsError
    console.log("Unidades criadas:", createdUnits.length)

    // Criar usuários
    const users = [
      {
        name: "Maria Silva",
        email: "admin@example.com",
        password_hash: "$2a$10$xVqYLGUuJ9Ry8zD1Z3JQj.rHGjlBQ9A4mUa9QXEwjYN5.qeNH9bAe", // "password"
        role: "admin",
        organization_id: org.id,
        unit_id: null,
      },
      {
        name: "João Santos",
        email: "joao.santos@example.com",
        password_hash: "$2a$10$xVqYLGUuJ9Ry8zD1Z3JQj.rHGjlBQ9A4mUa9QXEwjYN5.qeNH9bAe", // "password"
        role: "responsible",
        organization_id: org.id,
        unit_id: createdUnits[1].id, // UBS Central
      },
      {
        name: "Ana Oliveira",
        email: "ana.oliveira@example.com",
        password_hash: "$2a$10$xVqYLGUuJ9Ry8zD1Z3JQj.rHGjlBQ9A4mUa9QXEwjYN5.qeNH9bAe", // "password"
        role: "responsible",
        organization_id: org.id,
        unit_id: createdUnits[2].id, // UBS Jardim
      },
    ]

    const { data: createdUsers, error: usersError } = await supabase.from("users").insert(users).select()

    if (usersError) throw usersError
    console.log("Usuários criados:", createdUsers.length)

    // Criar funcionários
    const contractTypeOptions = ["EFETIVO", "TEMPORARIO", "COMISSIONADO"]
    const roleOptions = ["Enfermeiro", "Médico", "Técnico de Enfermagem", "Recepcionista", "Auxiliar Administrativo"]

    const employees = []

    for (const unit of createdUnits) {
      // Criar entre 5 e 10 funcionários por unidade
      const employeeCount = Math.floor(Math.random() * 6) + 5

      for (let i = 0; i < employeeCount; i++) {
        const randomRole = roleOptions[Math.floor(Math.random() * roleOptions.length)]
        const randomContractType = contractTypeOptions[Math.floor(Math.random() * contractTypeOptions.length)]

        // Gerar CPF aleatório (apenas para demonstração)
        const cpf = Array(11)
          .fill(0)
          .map(() => Math.floor(Math.random() * 10))
          .join("")
        const formattedCpf = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`

        employees.push({
          organization_id: org.id,
          unit_id: unit.id,
          name: `Funcionário ${i + 1} - ${unit.name}`,
          cpf: formattedCpf,
          role: randomRole,
          contract_type: randomContractType,
          floor_code: `${Math.floor(Math.random() * 900) + 100}`,
        })
      }
    }

    const { data: createdEmployees, error: employeesError } = await supabase
      .from("employees")
      .insert(employees)
      .select()

    if (employeesError) throw employeesError
    console.log("Funcionários criados:", createdEmployees.length)

    // Criar folhas de frequência
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // getMonth() retorna 0-11
    const currentYear = currentDate.getFullYear()

    const sheets = []

    for (const unit of createdUnits) {
      // Criar folha para o mês atual
      sheets.push({
        organization_id: org.id,
        unit_id: unit.id,
        month: currentMonth,
        year: currentYear,
        status: Math.random() > 0.3 ? "submitted" : "draft", // 70% chance de estar submetida
        submitted_by: null,
        submitted_at: null,
      })
    }

    const { data: createdSheets, error: sheetsError } = await supabase.from("frequency_sheets").insert(sheets).select()

    if (sheetsError) throw sheetsError
    console.log("Folhas de frequência criadas:", createdSheets.length)

    // Criar entradas de frequência
    const entries = []

    for (const sheet of createdSheets) {
      // Obter funcionários da unidade
      const { data: unitEmployees, error: unitEmployeesError } = await supabase
        .from("employees")
        .select()
        .eq("unit_id", sheet.unit_id)

      if (unitEmployeesError) throw unitEmployeesError

      for (const employee of unitEmployees) {
        entries.push({
          sheet_id: sheet.id,
          employee_id: employee.id,
          absence_days: Math.floor(Math.random() * 3), // 0-2 dias de falta
          additional_night_hours: Math.floor(Math.random() * 20), // 0-19 horas de adicional noturno
          overtime_50_hours: Math.floor(Math.random() * 15), // 0-14 horas extras 50%
          overtime_100_hours: Math.floor(Math.random() * 10), // 0-9 horas extras 100%
          on_call_hours: Math.floor(Math.random() * 24), // 0-23 horas de sobreaviso
          vacation_days: Math.random() > 0.9 ? 30 : 0, // 10% chance de estar de férias
          justification: Math.random() > 0.8 ? "Observação sobre o funcionário" : null, // 20% chance de ter observação
        })
      }
    }

    const { data: createdEntries, error: entriesError } = await supabase
      .from("frequency_entries")
      .insert(entries)
      .select()

    if (entriesError) throw entriesError
    console.log("Entradas de frequência criadas:", createdEntries.length)

    console.log("Seed concluído com sucesso!")
    return { success: true }
  } catch (error) {
    console.error("Erro ao realizar seed:", error)
    return { success: false, error }
  }
}
