-- ============================================
-- MIGRACIÓN: Agregar sistema de prompts múltiples al chatbot
-- ============================================
-- Fecha: 2025-11-04
-- Ejecutar en: Supabase SQL Editor
-- Tiempo: 5 segundos

-- 1. Añadir columna para prompts estructurados
ALTER TABLE chatbot_config 
ADD COLUMN IF NOT EXISTS prompts JSONB;

-- 2. Migrar el system_prompt actual a formato de prompts múltiples
UPDATE chatbot_config
SET prompts = jsonb_build_object(
  'prompts', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'role', 'system',
      'content', COALESCE(system_prompt, 'Eres el Tío Viajero, un asistente experto en áreas de autocaravanas y campings.'),
      'order', 1,
      'required', true
    )
  )
)
WHERE prompts IS NULL;

-- 3. Hacer que la columna sea obligatoria después de la migración
ALTER TABLE chatbot_config 
ALTER COLUMN prompts SET NOT NULL;

-- 4. Añadir índice GIN para búsquedas eficientes en JSONB
CREATE INDEX IF NOT EXISTS idx_chatbot_config_prompts ON chatbot_config USING GIN (prompts);

-- 5. Verificación (ver resultado en la pestaña "Results")
SELECT 
  nombre,
  modelo,
  jsonb_array_length(prompts->'prompts') as total_prompts,
  prompts->'prompts'->0->>'role' as primer_prompt_role,
  'Editor habilitado en /admin/configuracion' as mensaje
FROM chatbot_config
WHERE nombre = 'asistente_principal';

