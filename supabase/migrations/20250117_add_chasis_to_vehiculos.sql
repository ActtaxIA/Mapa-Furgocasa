-- ===================================================================
-- MIGRACIÓN: Añadir campo 'chasis' a vehiculos_registrados
-- ===================================================================
-- Fecha: 2025-01-17
-- Descripción: Añade el campo 'chasis' para registrar la marca del
--              chasis del vehículo (Fiat, Peugeot, Citroën, Mercedes, etc.)
-- ===================================================================

-- Añadir columna chasis
ALTER TABLE vehiculos_registrados
ADD COLUMN IF NOT EXISTS chasis TEXT;

-- Añadir comentario
COMMENT ON COLUMN vehiculos_registrados.chasis IS 'Marca del chasis del vehículo (Fiat, Peugeot, Citroën, Mercedes, etc.)';

-- Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_vehiculos_chasis ON vehiculos_registrados(chasis);



