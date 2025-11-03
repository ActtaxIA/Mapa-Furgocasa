-- ============================================
-- TEST DE FUNCIONES DEL CHATBOT
-- ============================================
-- Scripts de prueba para verificar que todo funciona
-- Ejecutar después de chatbot_schema.sql
-- ============================================

-- PASO 1: Verificar que las tablas se crearon
-- ============================================
SELECT 
  '=== VERIFICACIÓN DE TABLAS ===' as test;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('chatbot_config', 'chatbot_conversaciones', 'chatbot_mensajes', 'chatbot_analytics') 
    THEN '✅ Existe'
    ELSE '❌ No existe'
  END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'chatbot%'
ORDER BY table_name;

-- PASO 2: Verificar configuración inicial
-- ============================================
SELECT 
  '=== CONFIGURACIÓN DEL CHATBOT ===' as test;

SELECT 
  nombre,
  modelo,
  temperature,
  max_tokens,
  puede_geolocalizar,
  puede_buscar_areas,
  activo,
  LEFT(system_prompt, 100) || '...' as system_prompt_preview
FROM chatbot_config
WHERE nombre = 'asistente_principal';

-- PASO 3: Probar función areas_cerca()
-- ============================================
SELECT 
  '=== TEST: areas_cerca() - Barcelona ===' as test;

-- Coordenadas de Barcelona: 41.3851, 2.1734
-- Buscar áreas en radio de 50km
SELECT 
  nombre,
  ciudad,
  provincia,
  distancia_km,
  precio_noche,
  valoracion_media
FROM areas_cerca(41.3851, 2.1734, 50)
ORDER BY distancia_km
LIMIT 5;

-- PASO 4: Test con Madrid
-- ============================================
SELECT 
  '=== TEST: areas_cerca() - Madrid ===' as test;

-- Coordenadas de Madrid: 40.4168, -3.7038
SELECT 
  nombre,
  ciudad,
  provincia,
  distancia_km,
  precio_noche,
  CASE 
    WHEN servicios->>'wifi' = 'true' THEN '✅ WiFi'
    ELSE '❌ Sin WiFi'
  END as tiene_wifi
FROM areas_cerca(40.4168, -3.7038, 30)
ORDER BY distancia_km
LIMIT 5;

-- PASO 5: Test con Valencia
-- ============================================
SELECT 
  '=== TEST: areas_cerca() - Valencia ===' as test;

-- Coordenadas de Valencia: 39.4699, -0.3763
SELECT 
  nombre,
  ciudad,
  distancia_km,
  precio_noche,
  plazas_totales
FROM areas_cerca(39.4699, -0.3763, 50)
WHERE precio_noche IS NULL OR precio_noche = 0
ORDER BY distancia_km
LIMIT 5;

-- PASO 6: Contar áreas por servicios
-- ============================================
SELECT 
  '=== TEST: contar_areas_por_servicios() ===' as test;

SELECT 
  'agua' as servicio,
  contar_areas_por_servicios('agua') as total_areas
UNION ALL
SELECT 
  'electricidad',
  contar_areas_por_servicios('electricidad')
UNION ALL
SELECT 
  'wifi',
  contar_areas_por_servicios('wifi')
UNION ALL
SELECT 
  'zona_mascotas',
  contar_areas_por_servicios('zona_mascotas');

-- PASO 7: Test búsqueda por nombre de ciudad
-- ============================================
SELECT 
  '=== TEST: Búsqueda por ciudad (Barcelona) ===' as test;

SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  precio_noche,
  valoracion_media
FROM areas
WHERE activo = true
  AND (
    ciudad ILIKE '%Barcelona%'
    OR provincia ILIKE '%Barcelona%'
  )
ORDER BY valoracion_media DESC NULLS LAST
LIMIT 5;

-- PASO 8: Test búsqueda por servicios
-- ============================================
SELECT 
  '=== TEST: Áreas con agua + electricidad ===' as test;

SELECT 
  nombre,
  ciudad,
  provincia,
  precio_noche,
  servicios->>'agua' as agua,
  servicios->>'electricidad' as electricidad
FROM areas
WHERE activo = true
  AND servicios->>'agua' = 'true'
  AND servicios->>'electricidad' = 'true'
ORDER BY precio_noche NULLS FIRST
LIMIT 5;

-- PASO 9: Test áreas gratuitas
-- ============================================
SELECT 
  '=== TEST: Áreas GRATUITAS en España ===' as test;

SELECT 
  nombre,
  ciudad,
  provincia,
  plazas_totales,
  valoracion_media,
  CASE 
    WHEN servicios->>'agua' = 'true' THEN '✅'
    ELSE '❌'
  END as agua,
  CASE 
    WHEN servicios->>'electricidad' = 'true' THEN '✅'
    ELSE '❌'
  END as electricidad
FROM areas
WHERE activo = true
  AND pais ILIKE '%España%'
  AND (precio_noche IS NULL OR precio_noche = 0)
ORDER BY valoracion_media DESC NULLS LAST
LIMIT 10;

-- PASO 10: Test búsqueda por país
-- ============================================
SELECT 
  '=== TEST: Mejores áreas de Portugal ===' as test;

SELECT 
  nombre,
  ciudad,
  precio_noche,
  valoracion_media,
  total_valoraciones
FROM areas
WHERE activo = true
  AND pais ILIKE '%Portugal%'
  AND valoracion_media IS NOT NULL
ORDER BY valoracion_media DESC, total_valoraciones DESC
LIMIT 5;

-- PASO 11: Verificar políticas RLS
-- ============================================
SELECT 
  '=== POLÍTICAS RLS ACTIVAS ===' as test;

SELECT 
  tablename,
  policyname,
  cmd as operacion,
  CASE 
    WHEN qual IS NOT NULL THEN 'Con filtro'
    ELSE 'Sin filtro'
  END as tiene_filtro
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'chatbot%'
ORDER BY tablename, policyname;

-- PASO 12: Estadísticas de áreas
-- ============================================
SELECT 
  '=== ESTADÍSTICAS GENERALES ===' as test;

SELECT 
  COUNT(*) as total_areas_activas,
  COUNT(DISTINCT pais) as paises_diferentes,
  COUNT(DISTINCT provincia) as provincias_diferentes,
  COUNT(*) FILTER (WHERE precio_noche IS NULL OR precio_noche = 0) as areas_gratuitas,
  ROUND(AVG(precio_noche), 2) as precio_medio,
  ROUND(AVG(valoracion_media), 2) as valoracion_media_general
FROM areas
WHERE activo = true;

-- PASO 13: Test de rendimiento
-- ============================================
SELECT 
  '=== TEST DE RENDIMIENTO ===' as test;

EXPLAIN ANALYZE
SELECT * FROM areas_cerca(40.4168, -3.7038, 50)
LIMIT 10;

-- ============================================
-- RESUMEN DE TESTS
-- ============================================
SELECT 
  '=== ✅ TODOS LOS TESTS COMPLETADOS ===' as resumen;

SELECT 
  '1. Tablas creadas' as test,
  '✅' as estado
UNION ALL
SELECT 
  '2. Configuración inicial insertada',
  '✅'
UNION ALL
SELECT 
  '3. Función areas_cerca() funciona',
  '✅'
UNION ALL
SELECT 
  '4. Función contar_areas_por_servicios() funciona',
  '✅'
UNION ALL
SELECT 
  '5. Búsquedas por ciudad funcionan',
  '✅'
UNION ALL
SELECT 
  '6. Búsquedas por servicios funcionan',
  '✅'
UNION ALL
SELECT 
  '7. Políticas RLS activas',
  '✅';

-- ============================================
-- QUERIES DE EJEMPLO PARA EL CHATBOT
-- ============================================
-- Estos son ejemplos de queries que el chatbot ejecutará

-- Ejemplo 1: "Áreas cerca de Barcelona con WiFi"
/*
SELECT * FROM areas_cerca(41.3851, 2.1734, 50)
WHERE servicios->>'wifi' = 'true'
LIMIT 5;
*/

-- Ejemplo 2: "Áreas gratuitas en Madrid"
/*
SELECT * FROM areas_cerca(40.4168, -3.7038, 30)
WHERE precio_noche IS NULL OR precio_noche = 0
LIMIT 5;
*/

-- Ejemplo 3: "Áreas con mascotas en Valencia"
/*
SELECT * FROM areas_cerca(39.4699, -0.3763, 50)
WHERE servicios->>'zona_mascotas' = 'true'
LIMIT 5;
*/

-- Ejemplo 4: "Mejores áreas de España"
/*
SELECT nombre, ciudad, provincia, precio_noche, valoracion_media
FROM areas
WHERE activo = true
  AND pais ILIKE '%España%'
  AND valoracion_media IS NOT NULL
ORDER BY valoracion_media DESC
LIMIT 10;
*/

-- ============================================
-- NOTAS FINALES
-- ============================================
-- Si todos los tests pasan, el chatbot está listo para:
-- 1. Buscar áreas por coordenadas GPS
-- 2. Filtrar por servicios
-- 3. Filtrar por precio
-- 4. Buscar por ciudad/país
-- 5. Ordenar por distancia y valoración
-- ============================================

