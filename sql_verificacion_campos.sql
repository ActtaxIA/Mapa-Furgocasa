-- =====================================================
-- SQL DE VERIFICACIÓN DE CAMPOS
-- =====================================================
-- Ejecuta estos queries en Supabase SQL Editor

-- 1. Verificar estructura de vehiculo_ficha_tecnica
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vehiculo_ficha_tecnica'
ORDER BY ordinal_position;

-- 2. Ver muestra de datos de vehiculo_ficha_tecnica
SELECT * FROM vehiculo_ficha_tecnica LIMIT 3;

-- 3. Verificar si hay datos en datos_mercado_autocaravanas
SELECT COUNT(*) as total_registros FROM datos_mercado_autocaravanas;

-- 4. Ver muestra de datos_mercado_autocaravanas
SELECT id, marca, modelo, precio, año, verificado, created_at
FROM datos_mercado_autocaravanas
LIMIT 5;

-- 5. Verificar campos de areas que usa analytics
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'areas'
  AND column_name IN ('pais', 'comunidad_autonoma', 'provincia', 'precio_noche', 'servicios', 'imagenes', 'descripcion', 'verificado')
ORDER BY column_name;

-- 6. Verificar campos de rutas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'rutas'
  AND column_name IN ('distancia_km', 'puntos', 'user_id')
ORDER BY column_name;

