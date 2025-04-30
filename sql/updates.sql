-- Adicionar histórico de servidores
CREATE TABLE IF NOT EXISTS employee_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  previous_unit_id UUID REFERENCES units(id),
  new_unit_id UUID REFERENCES units(id),
  action_type TEXT NOT NULL, -- 'transfer', 'delete', 'create'
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar a tabela de usuários para incluir os novos tipos
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'responsible';

-- Atualize todos os administradores existentes
UPDATE users SET user_type = 'admin_system' WHERE role = 'admin';

-- Atualize todos os responsáveis existentes
UPDATE users SET user_type = 'responsible' WHERE role = 'responsible';

-- Adicionar coluna para rastrear se um servidor foi deletado (soft delete)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
