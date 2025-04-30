-- Adicionar coluna is_active para unidades (soft delete)
ALTER TABLE units 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
