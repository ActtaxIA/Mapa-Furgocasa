-- ============================================================================
-- SCRIPT PARA CORREGIR NOMBRES DUPLICADOS EN ÁREAS
-- ============================================================================
-- Este script detecta áreas con nombres duplicados y les añade la ciudad
-- para hacerlos únicos. Común en nombres genéricos como "MOTORHOME PARKING"
-- ============================================================================
-- IMPORTANTE: Este script debe ejecutarse en Supabase SQL Editor
-- ============================================================================

-- PASO 1: IDENTIFICAR NOMBRES DUPLICADOS
-- ============================================================================

-- 1.1 Ver cuántas áreas tienen nombres duplicados
SELECT 
  nombre,
  COUNT(*) as total_duplicados,
  STRING_AGG(ciudad, ', ') as ciudades
FROM public.areas
WHERE activo = true
  AND nombre IS NOT NULL
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC, nombre;

-- 1.2 Ver detalles de todas las áreas duplicadas
SELECT 
  id,
  nombre,
  ciudad,
  provincia,
  pais,
  direccion,
  slug
FROM public.areas
WHERE activo = true
  AND nombre IN (
    SELECT nombre
    FROM public.areas
    WHERE activo = true
      AND nombre IS NOT NULL
    GROUP BY nombre
    HAVING COUNT(*) > 1
  )
ORDER BY nombre, ciudad;


-- ============================================================================
-- PASO 2: CORRECCIÓN AUTOMÁTICA
-- ============================================================================
-- IMPORTANTE: Este UPDATE modificará los nombres y slugs de áreas duplicadas
-- Revisa los resultados del PASO 1 antes de ejecutar este PASO 2
-- ============================================================================

-- 2.1 Actualizar nombres duplicados añadiendo la ciudad
-- Solo para áreas que:
-- - Tienen nombre duplicado
-- - Tienen ciudad disponible
-- - La ciudad no está ya en el nombre

WITH duplicados AS (
  -- Identificar áreas con nombres duplicados
  SELECT nombre
  FROM public.areas
  WHERE activo = true
    AND nombre IS NOT NULL
  GROUP BY nombre
  HAVING COUNT(*) > 1
),
areas_a_actualizar AS (
  -- Seleccionar áreas que necesitan actualización
  SELECT 
    a.id,
    a.nombre as nombre_actual,
    a.ciudad,
    a.slug as slug_actual,
    -- Nuevo nombre: agregar ciudad si no está ya incluida
    CASE 
      WHEN a.ciudad IS NOT NULL 
           AND TRIM(a.ciudad) != '' 
           AND LOWER(a.nombre) NOT LIKE '%' || LOWER(TRIM(a.ciudad)) || '%'
      THEN a.nombre || ' ' || TRIM(a.ciudad)
      ELSE a.nombre
    END as nombre_nuevo,
    -- Generar nuevo slug (sin acentos)
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRANSLATE(
              CASE 
                WHEN a.ciudad IS NOT NULL 
                     AND TRIM(a.ciudad) != '' 
                     AND LOWER(a.nombre) NOT LIKE '%' || LOWER(TRIM(a.ciudad)) || '%'
                THEN a.nombre || ' ' || TRIM(a.ciudad)
                ELSE a.nombre
              END,
              'áéíóúàèìòùâêîôûäëïöüñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÑÇ',
              'aeiouaeiouaeiouaeiouaeiouaeiouaeiounccaeiou'
            ),
            '[^a-z0-9]+', '-', 'g'
          ),
          '^-+', '', 'g'
        ),
        '-+$', '', 'g'
      )
    ) as slug_nuevo
  FROM public.areas a
  INNER JOIN duplicados d ON a.nombre = d.nombre
  WHERE a.activo = true
    AND a.ciudad IS NOT NULL
    AND TRIM(a.ciudad) != ''
    AND LOWER(a.nombre) NOT LIKE '%' || LOWER(TRIM(a.ciudad)) || '%'
)
-- Mostrar qué se va a actualizar (EJECUTAR PRIMERO PARA REVISAR)
SELECT 
  id,
  nombre_actual,
  ciudad,
  nombre_nuevo,
  slug_actual,
  slug_nuevo
FROM areas_a_actualizar
ORDER BY nombre_actual, ciudad;

-- 2.2 APLICAR LAS CORRECCIONES (EJECUTAR DESPUÉS DE REVISAR)
-- Descomenta este bloque cuando estés seguro de los cambios

/*
WITH duplicados AS (
  SELECT nombre
  FROM public.areas
  WHERE activo = true
    AND nombre IS NOT NULL
  GROUP BY nombre
  HAVING COUNT(*) > 1
),
areas_a_actualizar AS (
  SELECT 
    a.id,
    CASE 
      WHEN a.ciudad IS NOT NULL 
           AND TRIM(a.ciudad) != '' 
           AND LOWER(a.nombre) NOT LIKE '%' || LOWER(TRIM(a.ciudad)) || '%'
      THEN a.nombre || ' ' || TRIM(a.ciudad)
      ELSE a.nombre
    END as nombre_nuevo,
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRANSLATE(
              CASE 
                WHEN a.ciudad IS NOT NULL 
                     AND TRIM(a.ciudad) != '' 
                     AND LOWER(a.nombre) NOT LIKE '%' || LOWER(TRIM(a.ciudad)) || '%'
                THEN a.nombre || ' ' || TRIM(a.ciudad)
                ELSE a.nombre
              END,
              'áéíóúàèìòùâêîôûäëïöüñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÑÇ',
              'aeiouaeiouaeiouaeiouaeiouaeiouaeiounccaeiou'
            ),
            '[^a-z0-9]+', '-', 'g'
          ),
          '^-+', '', 'g'
        ),
        '-+$', '', 'g'
      )
    ) as slug_nuevo
  FROM public.areas a
  INNER JOIN duplicados d ON a.nombre = d.nombre
  WHERE a.activo = true
    AND a.ciudad IS NOT NULL
    AND TRIM(a.ciudad) != ''
    AND LOWER(a.nombre) NOT LIKE '%' || LOWER(TRIM(a.ciudad)) || '%'
)
UPDATE public.areas
SET 
  nombre = u.nombre_nuevo,
  slug = u.slug_nuevo,
  updated_at = NOW()
FROM areas_a_actualizar u
WHERE public.areas.id = u.id;
*/


-- ============================================================================
-- PASO 3: VERIFICACIÓN POST-CORRECCIÓN
-- ============================================================================

-- 3.1 Verificar que no quedan nombres duplicados (o muy pocos)
SELECT 
  nombre,
  COUNT(*) as total_duplicados,
  STRING_AGG(ciudad || ' (' || COALESCE(pais, 'sin país') || ')', ', ') as ubicaciones
FROM public.areas
WHERE activo = true
  AND nombre IS NOT NULL
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC, nombre;

-- 3.2 Ver ejemplos de nombres actualizados
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  slug
FROM public.areas
WHERE activo = true
  AND (
    nombre ILIKE '%MOTORHOME PARKING%'
    OR nombre ILIKE '%Área%'
    OR nombre ILIKE '%Parking%'
    OR nombre ILIKE '%Camper%'
  )
ORDER BY nombre, pais, ciudad
LIMIT 50;


-- ============================================================================
-- CASOS ESPECIALES: Duplicados sin ciudad
-- ============================================================================

-- 4.1 Áreas duplicadas SIN ciudad disponible (requieren revisión manual)
SELECT 
  a.id,
  a.nombre,
  a.ciudad,
  a.provincia,
  a.pais,
  a.direccion,
  a.slug
FROM public.areas a
WHERE activo = true
  AND nombre IN (
    SELECT nombre
    FROM public.areas
    WHERE activo = true
    GROUP BY nombre
    HAVING COUNT(*) > 1
  )
  AND (ciudad IS NULL OR TRIM(ciudad) = '')
ORDER BY nombre, pais;


-- ============================================================================
-- NOTAS DE USO:
-- ============================================================================
-- 1. Ejecuta PASO 1 para ver qué áreas tienen nombres duplicados
-- 2. Ejecuta la primera query del PASO 2 para ver QUÉ se va a cambiar
-- 3. Si estás conforme, descomenta y ejecuta el UPDATE del PASO 2.2
-- 4. Ejecuta PASO 3 para verificar que todo está correcto
-- 5. Revisa PASO 4 para casos especiales que requieran revisión manual
-- ============================================================================

