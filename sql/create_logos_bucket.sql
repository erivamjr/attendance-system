-- Criar bucket para armazenar logos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a coluna logo_url já existe na tabela organizations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'organizations'
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE organizations ADD COLUMN logo_url TEXT;
    END IF;
END $$;
