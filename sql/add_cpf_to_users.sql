-- Adicionar coluna cpf à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Garantir que a coluna is_active existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Atualizar todos os usuários existentes para estarem ativos
UPDATE users SET is_active = true;
