-- ================================================================
-- Agregar campo chasis a datos_mercado_autocaravanas
-- ================================================================
-- Fecha: 20 Noviembre 2025
-- Motivo: Necesario para comparar correctamente vehículos en valoraciones.
--         El chasis (Fiat, Mercedes, VW, etc.) puede duplicar el precio base.
--         Un Weinsberg sobre Mercedes cuesta 20.000€ más que sobre Fiat.
-- ================================================================

-- Agregar columna chasis
ALTER TABLE datos_mercado_autocaravanas 
ADD COLUMN IF NOT EXISTS chasis VARCHAR(100);

-- Crear índice para búsquedas por chasis
CREATE INDEX IF NOT EXISTS idx_datos_mercado_chasis 
ON datos_mercado_autocaravanas(chasis);

-- Comentario explicativo
COMMENT ON COLUMN datos_mercado_autocaravanas.chasis IS 
'Marca del chasis base (Fiat Ducato, Mercedes Sprinter, Citroën Jumper, Peugeot Boxer, VW Crafter, Ford Transit, Renault Master, etc.). 
CRÍTICO: Un mismo modelo camperizado puede costar hasta 30.000€ más con chasis Mercedes vs Fiat.
La "marca" es del camperizador (Hymer, Weinsberg, Knaus), el "chasis" es del fabricante del vehículo base.';

-- Mensaje de confirmación
SELECT 'Columna chasis agregada correctamente a datos_mercado_autocaravanas' as mensaje;


