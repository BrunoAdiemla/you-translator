-- SQL para alterar a coluna 'score' da tabela 'translations' para aceitar números decimais
-- Execute este comando no SQL Editor do Supabase

-- Alterar o tipo da coluna 'score' de integer para numeric(3,1)
-- numeric(3,1) significa: 3 dígitos no total, sendo 1 casa decimal
-- Exemplos de valores aceitos: 0.0, 7.5, 10.0, 9.8, etc.
ALTER TABLE public.translations 
ALTER COLUMN score TYPE numeric(3,1);

-- Verificar a alteração (opcional)
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'translations' 
  AND column_name = 'score';
