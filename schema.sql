-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de organizações
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de unidades
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  unit_id UUID REFERENCES units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de funcionários
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  pis TEXT,
  role TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  floor_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de folhas de frequência
CREATE TABLE frequency_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL,
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de entradas de frequência
CREATE TABLE frequency_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_id UUID NOT NULL REFERENCES frequency_sheets(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  absence_days INTEGER NOT NULL DEFAULT 0,
  additional_night_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  overtime_50_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  overtime_100_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  on_call_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  vacation_days INTEGER NOT NULL DEFAULT 0,
  justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tipos de eventos
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

-- Criar tabela de códigos de eventos
CREATE TABLE event_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contract_type TEXT NOT NULL,
  event_type_id UUID NOT NULL REFERENCES event_types(id),
  code INTEGER NOT NULL
);

-- Criar tabela de log de submissões
CREATE TABLE submissions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_id UUID NOT NULL REFERENCES frequency_sheets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir organização inicial
INSERT INTO organizations (name, slug) VALUES ('Secretaria de Saúde', 'saude');

-- Inserir tipos de eventos
INSERT INTO event_types (name, label) VALUES 
  ('absence', 'Falta'),
  ('night_shift', 'Adicional Noturno'),
  ('overtime_50', 'Hora Extra 50%'),
  ('overtime_100', 'Hora Extra 100%'),
  ('on_call', 'Sobreaviso'),
  ('vacation', 'Férias');

-- Inserir unidades iniciais
INSERT INTO units (organization_id, name, location) VALUES 
  ((SELECT id FROM organizations LIMIT 1), 'UBS Vila Nova', 'Rua das Flores, 123 - Vila Nova'),
  ((SELECT id FROM organizations LIMIT 1), 'UBS Central', 'Av. Principal, 500 - Centro'),
  ((SELECT id FROM organizations LIMIT 1), 'UBS Jardim', 'Rua das Árvores, 45 - Jardim');

-- Inserir usuário admin inicial (você precisará criar este usuário na autenticação do Supabase)
-- Substitua o UUID abaixo pelo UUID do usuário criado na autenticação
INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES 
  ('SUBSTITUA_PELO_UUID_DO_USUARIO', (SELECT id FROM organizations LIMIT 1), 'Administrador', 'admin@example.com', 'auth_managed', 'admin');
