-- Adicionar coluna cpf à tabela users se ela não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cpf TEXT;
