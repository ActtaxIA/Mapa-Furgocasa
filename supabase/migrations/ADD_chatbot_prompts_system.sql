-- ============================================
-- MIGRACIÓN: Agregar sistema de prompts múltiples al chatbot
-- ============================================
-- Fecha: 2025-01-04
-- Descripción: Convierte el system_prompt del chatbot a un sistema
--              de múltiples prompts igual que los otros agentes de IA

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

-- 5. Comentario para documentación
COMMENT ON COLUMN chatbot_config.prompts IS 'Sistema de prompts múltiples en formato JSONB: {prompts: [{id, role, content, order, required}]}';

-- 6. Verificación
DO $$ 
BEGIN
  RAISE NOTICE 'Migración completada. Verificando datos...';
  
  -- Mostrar cuántos registros se migraron
  PERFORM 1 FROM chatbot_config WHERE prompts IS NOT NULL;
  
  IF FOUND THEN
    RAISE NOTICE '✓ Sistema de prompts múltiples activado correctamente';
  ELSE
    RAISE WARNING '⚠ No se encontraron registros en chatbot_config';
  END IF;
END $$;

