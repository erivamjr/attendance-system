-- Adicionar coluna is_active à tabela users
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Atualizar todos os registros existentes para terem is_active = TRUE
UPDATE users SET is_active = TRUE;
