-- =====================================================
-- AÑADIR: Porcentaje IEDMT configurable globalmente
-- =====================================================
-- Fecha: 18 de noviembre de 2025
-- 
-- Añade configuración global para el porcentaje de IEDMT
-- (Impuesto Especial sobre Determinados Medios de Transporte)
-- usado para normalizar precios sin impuesto incluido.
--
-- Este porcentaje se usará en:
-- 1. Extracción URL manual (admin)
-- 2. Compras de usuario (frontend)
-- 3. Cálculos de valoración IA
-- =====================================================

-- Insertar configuración del porcentaje IEDMT
INSERT INTO ia_config (config_key, config_value, descripcion)
VALUES (
  'porcentaje_iedmt',
  '{
    "valor": 14.75,
    "descripcion": "Porcentaje del Impuesto de Matriculación para autocaravanas >3.5t",
    "notas": "Según BOE - Real Decreto Legislativo 1/1993. Varía por tipo de vehículo y CCAA, pero 14,75% es el estándar para autocaravanas >3.500 kg. Usado para normalizar precios de empresas exentas (alquiler) a PVP equivalente particular."
  }'::jsonb,
  'Porcentaje IEDMT (Impuesto de Matriculación) para normalización de precios'
)
ON CONFLICT (config_key)
DO UPDATE SET
  config_value = EXCLUDED.config_value,
  descripcion = EXCLUDED.descripcion,
  updated_at = NOW();

-- Verificación
SELECT
  config_key,
  config_value->>'valor' as porcentaje,
  config_value->>'descripcion' as descripcion
FROM ia_config
WHERE config_key = 'porcentaje_iedmt';

-- =====================================================
-- NOTAS DE USO:
-- =====================================================
-- 
-- Frontend (React):
-- const { data } = await supabase
--   .from('ia_config')
--   .select('config_value')
--   .eq('config_key', 'porcentaje_iedmt')
--   .single()
-- const porcentaje = data.config_value.valor
-- const precioNormalizado = precioSinImpuesto * (1 + porcentaje / 100)
--
-- Backend (API Routes):
-- const { data } = await supabase
--   .from('ia_config')
--   .select('config_value')
--   .eq('config_key', 'porcentaje_iedmt')
--   .single()
-- const factor = 1 + data.config_value.valor / 100
-- const precioNormalizado = Math.round(precioOriginal * factor)
--
-- =====================================================

