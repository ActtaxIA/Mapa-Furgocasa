-- =====================================================
-- AGREGAR CAMPO TIPO_VEHICULO A VEHICULOS_REGISTRADOS
-- =====================================================
-- Fecha: 2025-11-13
-- Descripción: Añade el campo tipo_vehiculo para clasificar
-- el tipo de autocaravana/camper
-- =====================================================

-- Agregar columna tipo_vehiculo
ALTER TABLE public.vehiculos_registrados
ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(100);

-- Añadir comentario
COMMENT ON COLUMN public.vehiculos_registrados.tipo_vehiculo IS 'Tipo de vehículo: Furgoneta Camper, Autocaravana Perfilada, Autocaravana Integral, Autocaravana Capuchina, Camper, Furgoneta, etc.';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Columna tipo_vehiculo agregada correctamente a vehiculos_registrados';
END $$;

