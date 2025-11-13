-- =====================================================
-- AÑADIR CAMPO PARA GUARDAR ÁREAS ENCONTRADAS EN RUTAS
-- =====================================================
-- Este script añade un campo para guardar los puntos encontrados
-- cuando se guarda una ruta, evitando tener que buscarlos de nuevo
-- =====================================================

-- Añadir campo para guardar áreas encontradas
ALTER TABLE public.rutas
ADD COLUMN IF NOT EXISTS areas_encontradas JSONB DEFAULT '[]'::jsonb;

-- Comentario del campo
COMMENT ON COLUMN public.rutas.areas_encontradas IS 'Array de áreas encontradas a lo largo de la ruta guardado en caché para evitar búsquedas repetidas';

-- Crear índice GIN para búsquedas rápidas en el JSONB
CREATE INDEX IF NOT EXISTS idx_rutas_areas_encontradas ON public.rutas USING GIN (areas_encontradas);

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Campo areas_encontradas añadido a la tabla rutas';
  RAISE NOTICE '   - Los puntos encontrados ahora se guardan en caché';
  RAISE NOTICE '   - Las rutas guardadas cargarán los puntos instantáneamente';
END $$;
