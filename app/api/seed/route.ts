import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-database"

export async function GET() {
  try {
    const result = await seedDatabase()

    if (result.success) {
      return NextResponse.json({ message: "Database seeded successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Failed to seed database", error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal server error", error }, { status: 500 })
  }
}
