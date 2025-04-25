export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string
          password_hash: string
          role: string
          unit_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email: string
          password_hash: string
          role: string
          unit_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string
          password_hash?: string
          role?: string
          unit_id?: string | null
          created_at?: string
        }
      }
      units: {
        Row: {
          id: string
          organization_id: string
          name: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          location?: string
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          organization_id: string
          unit_id: string
          name: string
          cpf: string
          pis: string | null
          role: string
          contract_type: string
          floor_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          unit_id: string
          name: string
          cpf: string
          pis?: string | null
          role: string
          contract_type: string
          floor_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          unit_id?: string
          name?: string
          cpf?: string
          pis?: string | null
          role?: string
          contract_type?: string
          floor_code?: string | null
          created_at?: string
        }
      }
      frequency_sheets: {
        Row: {
          id: string
          organization_id: string
          unit_id: string
          month: number
          year: number
          status: string
          submitted_by: string | null
          submitted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          unit_id: string
          month: number
          year: number
          status: string
          submitted_by?: string | null
          submitted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          unit_id?: string
          month?: number
          year?: number
          status?: string
          submitted_by?: string | null
          submitted_at?: string | null
          created_at?: string
        }
      }
      frequency_entries: {
        Row: {
          id: string
          sheet_id: string
          employee_id: string
          absence_days: number
          additional_night_hours: number
          overtime_50_hours: number
          overtime_100_hours: number
          on_call_hours: number
          vacation_days: number
          justification: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sheet_id: string
          employee_id: string
          absence_days: number
          additional_night_hours: number
          overtime_50_hours: number
          overtime_100_hours: number
          on_call_hours: number
          vacation_days: number
          justification?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sheet_id?: string
          employee_id?: string
          absence_days?: number
          additional_night_hours?: number
          overtime_50_hours?: number
          overtime_100_hours?: number
          on_call_hours?: number
          vacation_days?: number
          justification?: string | null
          created_at?: string
        }
      }
      event_types: {
        Row: {
          id: string
          name: string
          label: string
        }
        Insert: {
          id?: string
          name: string
          label: string
        }
        Update: {
          id?: string
          name?: string
          label?: string
        }
      }
      event_codes: {
        Row: {
          id: string
          organization_id: string
          contract_type: string
          event_type_id: string
          code: number
        }
        Insert: {
          id?: string
          organization_id: string
          contract_type: string
          event_type_id: string
          code: number
        }
        Update: {
          id?: string
          organization_id?: string
          contract_type?: string
          event_type_id?: string
          code?: number
        }
      }
      submissions_log: {
        Row: {
          id: string
          sheet_id: string
          user_id: string
          action: string
          timestamp: string
        }
        Insert: {
          id?: string
          sheet_id: string
          user_id: string
          action: string
          timestamp?: string
        }
        Update: {
          id?: string
          sheet_id?: string
          user_id?: string
          action?: string
          timestamp?: string
        }
      }
    }
  }
}
