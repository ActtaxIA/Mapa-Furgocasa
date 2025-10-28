-- Añadir campo con_descuento_furgocasa a la tabla areas
-- Este campo indica si el área tiene descuento especial para miembros de FURGOCASA

ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS con_descuento_furgocasa BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar el rendimiento de búsqueda
CREATE INDEX IF NOT EXISTS idx_areas_con_descuento_furgocasa 
ON areas(con_descuento_furgocasa) 
WHERE con_descuento_furgocasa = TRUE;

-- Comentario de la columna
COMMENT ON COLUMN areas.con_descuento_furgocasa IS 'Indica si el área ofrece descuento especial para miembros de FURGOCASA';

-- Mostrar resultado
SELECT 'Campo con_descuento_furgocasa añadido correctamente a la tabla areas' AS resultado;

