-- Adicionar coluna is_active à tabela users
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
