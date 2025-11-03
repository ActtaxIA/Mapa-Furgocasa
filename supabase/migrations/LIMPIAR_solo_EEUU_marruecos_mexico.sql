-- ============================================
-- LIMPIEZA ESPECÍFICA: EEUU, MARRUECOS Y MÉXICO
-- ============================================
-- Script enfocado para eliminar SOLO estos 3 países:
-- 1. Estados Unidos (todas las variantes)
-- 2. Marruecos (todas las variantes)
-- 3. México (todas las variantes)
--
-- Mantiene TODO lo demás (Europa + resto LATAM)
-- ============================================

-- PASO 1: Vista previa - Ver cuántas áreas se eliminarán
-- ============================================
SELECT 
  '=== VISTA PREVIA DE ELIMINACIÓN ===' as mensaje;

SELECT 
  pais,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN activo = true THEN 1 END) as activas,
  COUNT(CASE WHEN activo = false THEN 1 END) as inactivas
FROM areas
WHERE LOWER(pais) IN (
  'estados unidos',
  'eeuu',
  'usa',
  'united states',
  'marruecos',
  'morocco',
  'méxico',
  'mexico'
)
GROUP BY pais
ORDER BY total_areas DESC;

-- PASO 2: Ver ejemplos de áreas que se eliminarán
-- ============================================
SELECT 
  '=== EJEMPLOS DE ÁREAS A ELIMINAR ===' as mensaje;

SELECT 
  pais,
  nombre,
  ciudad,
  provincia,
  activo
FROM areas
WHERE LOWER(pais) IN (
  'estados unidos',
  'eeuu',
  'usa',
  'united states',
  'marruecos',
  'morocco',
  'méxico',
  'mexico'
)
ORDER BY pais, nombre
LIMIT 20;

-- PASO 3: Crear tabla de backup (RECOMENDADO)
-- ============================================
-- Guarda una copia de las áreas que vas a eliminar
-- por si acaso necesitas recuperarlas después

DROP TABLE IF EXISTS areas_backup_eeuu_marruecos_mexico;

CREATE TABLE areas_backup_eeuu_marruecos_mexico AS
SELECT 
  *,
  NOW() as fecha_backup
FROM areas
WHERE LOWER(pais) IN (
  'estados unidos',
  'eeuu',
  'usa',
  'united states',
  'marruecos',
  'morocco',
  'méxico',
  'mexico'
);

-- Verificar que el backup se creó correctamente
SELECT 
  '=== BACKUP CREADO ===' as mensaje;

SELECT 
  pais,
  COUNT(*) as areas_respaldadas
FROM areas_backup_eeuu_marruecos_mexico
GROUP BY pais
ORDER BY areas_respaldadas DESC;

-- PASO 4: ELIMINAR áreas de EEUU
-- ============================================
DELETE FROM areas
WHERE LOWER(pais) IN (
  'estados unidos',
  'eeuu',
  'usa',
  'united states'
);

-- PASO 5: ELIMINAR áreas de Marruecos
-- ============================================
DELETE FROM areas
WHERE LOWER(pais) IN (
  'marruecos',
  'morocco'
);

-- PASO 6: ELIMINAR áreas de México
-- ============================================
DELETE FROM areas
WHERE LOWER(pais) IN (
  'méxico',
  'mexico'
);

-- PASO 7: Verificar que se eliminaron correctamente
-- ============================================
SELECT 
  '=== VERIFICACIÓN POST-ELIMINACIÓN ===' as mensaje;

-- Verificar que ya no existen
SELECT 
  COUNT(*) as areas_restantes_de_paises_eliminados
FROM areas
WHERE LOWER(pais) IN (
  'estados unidos',
  'eeuu',
  'usa',
  'united states',
  'marruecos',
  'morocco',
  'méxico',
  'mexico'
);
-- Debería devolver 0

-- PASO 8: Ver todos los países que quedan
-- ============================================
SELECT 
  '=== PAÍSES RESTANTES EN LA BASE DE DATOS ===' as mensaje;

SELECT 
  pais,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN activo = true THEN 1 END) as activas,
  COUNT(CASE WHEN activo = false THEN 1 END) as inactivas
FROM areas
WHERE pais IS NOT NULL
GROUP BY pais
ORDER BY total_areas DESC;

-- PASO 9: Resumen por continente/región
-- ============================================
SELECT 
  '=== DISTRIBUCIÓN POR REGIÓN ===' as mensaje;

SELECT 
  CASE 
    -- Europa
    WHEN pais IN ('España', 'Portugal', 'Francia', 'Italia', 'Alemania', 'Países Bajos', 
                  'Bélgica', 'Luxemburgo', 'Suiza', 'Austria', 'Andorra', 'Reino Unido', 
                  'Irlanda', 'Noruega', 'Suecia', 'Dinamarca', 'Finlandia', 'Islandia',
                  'Polonia', 'Chequia', 'Eslovaquia', 'Hungría', 'Rumania', 'Bulgaria',
                  'Croacia', 'Eslovenia', 'Grecia', 'Estonia', 'Letonia', 'Lituania')
      THEN '🇪🇺 EUROPA'
    
    -- Latinoamérica
    WHEN pais IN ('Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Brasil', 'Perú', 'Bolivia',
                  'Ecuador', 'Colombia', 'Venezuela', 'Costa Rica', 'Panamá', 'Nicaragua',
                  'Honduras', 'El Salvador', 'Guatemala', 'Cuba', 'República Dominicana',
                  'Puerto Rico', 'Jamaica')
      THEN '🌎 LATINOAMÉRICA'
    
    -- Oceanía
    WHEN pais IN ('Australia', 'Nueva Zelanda')
      THEN '🌏 OCEANÍA'
    
    ELSE '❓ OTROS'
  END as region,
  COUNT(*) as total_areas,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM areas), 2) as porcentaje
FROM areas
GROUP BY region
ORDER BY total_areas DESC;

-- PASO 10: Top 15 países con más áreas
-- ============================================
SELECT 
  '=== TOP 15 PAÍSES ===' as mensaje;

SELECT 
  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as ranking,
  pais,
  COUNT(*) as total_areas,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM areas), 2) as porcentaje_total
FROM areas
WHERE pais IS NOT NULL
GROUP BY pais
ORDER BY total_areas DESC
LIMIT 15;

-- ============================================
-- NOTAS DE RECUPERACIÓN
-- ============================================
-- Si necesitas RESTAURAR las áreas eliminadas:
/*
INSERT INTO areas 
SELECT 
  id, nombre, slug, descripcion, latitud, longitud, direccion,
  codigo_postal, ciudad, provincia, comunidad, pais, telefono,
  email, website, google_maps_url, google_place_id, google_rating,
  servicios, tipo_area, precio_noche, precio_24h, plazas_totales,
  plazas_camper, acceso_24h, barrera_altura, fotos, valoracion_media,
  total_valoraciones, activo, destacado, verificado, fecha_ultima_verificacion,
  created_at, updated_at, temporada_apertura, temporada_cierre,
  observaciones, horario_apertura, horario_cierre
FROM areas_backup_eeuu_marruecos_mexico;
*/

-- Para eliminar el backup después (cuando estés seguro):
-- DROP TABLE areas_backup_eeuu_marruecos_mexico;

-- ============================================
-- ✅ OPERACIÓN COMPLETADA
-- ============================================
-- Áreas eliminadas de:
-- ❌ Estados Unidos / EEUU / USA
-- ❌ Marruecos / Morocco
-- ❌ México / Mexico
--
-- ✅ Backup guardado en: areas_backup_eeuu_marruecos_mexico
-- ✅ Áreas de Europa: MANTENIDAS
-- ✅ Áreas de LATAM (excepto México): MANTENIDAS
-- ============================================

