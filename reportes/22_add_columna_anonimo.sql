-- ===================================================================
-- AÑADIR COLUMNA es_anonimo A reportes_accidentes
-- ===================================================================
-- Ejecutar en: Supabase SQL Editor
-- Descripción: Añade la columna es_anonimo para permitir reportes anónimos
-- Orden: 22 (después de crear tablas y políticas)
-- ===================================================================

BEGIN;

-- Añadir columna es_anonimo (por defecto false para mantener compatibilidad)
ALTER TABLE public.reportes_accidentes
ADD COLUMN IF NOT EXISTS es_anonimo BOOLEAN DEFAULT false;

-- Comentario descriptivo
COMMENT ON COLUMN public.reportes_accidentes.es_anonimo IS 'Indica si el testigo quiere que su reporte sea anónimo. Si es true, no se mostrará su nombre/email/teléfono al propietario.';

-- Índice para búsquedas por anonimato (opcional, pero útil para estadísticas)
CREATE INDEX IF NOT EXISTS idx_reportes_anonimo ON public.reportes_accidentes (es_anonimo);

COMMIT;

-- ===================================================================
-- VERIFICACIÓN: Comprobar que la columna se creó correctamente
-- ===================================================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'reportes_accidentes'
  AND column_name = 'es_anonimo';

