-- Adicionar coluna cpf à tabela users se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Adicionar coluna is_active à tabela users se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
