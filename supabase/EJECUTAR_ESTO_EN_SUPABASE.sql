-- ============================================
-- COPIA Y PEGA SOLO ESTE CÓDIGO EN SUPABASE
-- ============================================

-- Añadir campo con_descuento_furgocasa a la tabla areas
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS con_descuento_furgocasa BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_areas_con_descuento_furgocasa 
ON areas(con_descuento_furgocasa) 
WHERE con_descuento_furgocasa = TRUE;

-- Comentario de la columna
COMMENT ON COLUMN areas.con_descuento_furgocasa IS 'Indica si el área ofrece descuento especial para miembros de FURGOCASA';

-- Verificar que se creó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'areas' 
  AND column_name = 'con_descuento_furgocasa';

