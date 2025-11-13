-- =====================================================
-- Agregar campos adicionales de venta a vehiculo_valoracion_economica
-- =====================================================
-- Fecha: 13 de noviembre de 2025
-- Descripción: Añade campos para registrar información detallada de la venta
--              (tipo de comprador, kilometraje al momento de venta, estado del vehículo)

-- Agregar columna comprador_tipo
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS comprador_tipo VARCHAR(50);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.comprador_tipo IS 'Tipo de comprador: particular, profesional, concesionario, etc.';

-- Agregar columna kilometros_venta
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS kilometros_venta INTEGER;

COMMENT ON COLUMN public.vehiculo_valoracion_economica.kilometros_venta IS 'Kilometraje del vehículo en el momento de la venta';

-- Agregar columna estado_venta
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS estado_venta VARCHAR(50);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.estado_venta IS 'Estado del vehículo al vender: excelente, bueno, regular, para reparar, etc.';

-- Verificación
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehiculo_valoracion_economica'
  AND column_name IN ('comprador_tipo', 'kilometros_venta', 'estado_venta')
ORDER BY column_name;

-- =====================================================
-- Notas de implementación:
-- =====================================================
-- 1. Todos los campos son opcionales (NULL permitido)
-- 2. comprador_tipo: valores sugeridos 'particular', 'profesional', 'concesionario'
-- 3. kilometros_venta: número entero con el kilometraje exacto
-- 4. estado_venta: valores sugeridos 'excelente', 'bueno', 'regular', 'para_reparar'
-- 5. Estos campos complementan la información básica de venta ya existente
-- =====================================================

