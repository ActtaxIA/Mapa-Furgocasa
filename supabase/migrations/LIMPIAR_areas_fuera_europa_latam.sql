-- ============================================
-- LIMPIEZA DE ÁREAS: ENFOCAR EN EUROPA Y LATAM
-- ============================================
-- Este script elimina áreas de países que NO están en:
-- - Europa
-- - Latinoamérica (LATAM)
--
-- PAÍSES A ELIMINAR:
-- - Estados Unidos (EEUU)
-- - Marruecos
-- - México (se considera más Norteamérica que LATAM en este contexto)
-- - Australia
-- - Nueva Zelanda
-- - Canadá
-- - Cualquier otro país fuera de Europa/LATAM
-- ============================================

-- PASO 1: Ver cuántas áreas se eliminarán por país
-- ============================================
SELECT 
  pais,
  COUNT(*) as total_areas
FROM areas
WHERE pais IN (
  'Estados Unidos',
  'EEUU',
  'USA',
  'United States',
  'Marruecos',
  'Morocco',
  'México',
  'Mexico',
  'Australia',
  'Nueva Zelanda',
  'New Zealand',
  'Canadá',
  'Canada'
)
GROUP BY pais
ORDER BY total_areas DESC;

-- PASO 2: Backup de las áreas que se van a eliminar (opcional)
-- ============================================
-- Descomenta esta sección si quieres guardar un backup antes de eliminar
/*
CREATE TABLE IF NOT EXISTS areas_backup_no_europa_latam AS
SELECT * FROM areas
WHERE pais IN (
  'Estados Unidos',
  'EEUU',
  'USA',
  'United States',
  'Marruecos',
  'Morocco',
  'México',
  'Mexico',
  'Australia',
  'Nueva Zelanda',
  'New Zealand',
  'Canadá',
  'Canada'
);

-- Verificar backup
SELECT pais, COUNT(*) FROM areas_backup_no_europa_latam GROUP BY pais;
*/

-- PASO 3: Eliminar áreas de países fuera de Europa/LATAM
-- ============================================
-- IMPORTANTE: Esta operación NO se puede deshacer fácilmente
-- Asegúrate de que quieres continuar antes de ejecutar

-- 3.1: Eliminar Estados Unidos y variantes
DELETE FROM areas
WHERE pais IN ('Estados Unidos', 'EEUU', 'USA', 'United States');

-- 3.2: Eliminar Marruecos
DELETE FROM areas
WHERE pais IN ('Marruecos', 'Morocco');

-- 3.3: Eliminar México
DELETE FROM areas
WHERE pais IN ('México', 'Mexico');

-- 3.4: Eliminar Australia
DELETE FROM areas
WHERE pais IN ('Australia');

-- 3.5: Eliminar Nueva Zelanda
DELETE FROM areas
WHERE pais IN ('Nueva Zelanda', 'New Zealand');

-- 3.6: Eliminar Canadá
DELETE FROM areas
WHERE pais IN ('Canadá', 'Canada');

-- PASO 4: Verificar qué países quedan en la BD
-- ============================================
SELECT 
  pais,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN activo = true THEN 1 END) as areas_activas,
  COUNT(CASE WHEN activo = false THEN 1 END) as areas_inactivas
FROM areas
GROUP BY pais
ORDER BY total_areas DESC;

-- PASO 5: Estadísticas finales por región
-- ============================================
SELECT 
  CASE 
    -- Europa Occidental
    WHEN pais IN ('España', 'Portugal', 'Francia', 'Italia', 'Alemania', 'Países Bajos', 'Bélgica', 'Luxemburgo', 'Suiza', 'Austria', 'Andorra', 'Mónaco', 'Liechtenstein', 'Reino Unido', 'Irlanda') 
      THEN 'Europa Occidental'
    
    -- Europa del Este
    WHEN pais IN ('Polonia', 'Chequia', 'Eslovaquia', 'Hungría', 'Rumania', 'Bulgaria', 'Croacia', 'Eslovenia', 'Serbia', 'Bosnia', 'Montenegro', 'Albania', 'Macedonia', 'Kosovo')
      THEN 'Europa del Este'
    
    -- Europa del Norte (Escandinavia)
    WHEN pais IN ('Noruega', 'Suecia', 'Dinamarca', 'Finlandia', 'Islandia', 'Estonia', 'Letonia', 'Lituania')
      THEN 'Europa del Norte'
    
    -- Europa del Sur
    WHEN pais IN ('Grecia', 'Chipre', 'Malta', 'San Marino', 'Vaticano')
      THEN 'Europa del Sur'
    
    -- Latinoamérica - Sur
    WHEN pais IN ('Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Brasil')
      THEN 'LATAM - Sudamérica'
    
    -- Latinoamérica - Andina
    WHEN pais IN ('Perú', 'Bolivia', 'Ecuador', 'Colombia', 'Venezuela')
      THEN 'LATAM - Región Andina'
    
    -- Latinoamérica - Centroamérica
    WHEN pais IN ('Costa Rica', 'Panamá', 'Nicaragua', 'Honduras', 'El Salvador', 'Guatemala', 'Belice')
      THEN 'LATAM - Centroamérica'
    
    -- Caribe
    WHEN pais IN ('Cuba', 'República Dominicana', 'Puerto Rico', 'Jamaica', 'Haití', 'Trinidad y Tobago')
      THEN 'LATAM - Caribe'
    
    ELSE 'Otros'
  END as region,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN activo = true THEN 1 END) as activas
FROM areas
GROUP BY region
ORDER BY total_areas DESC;

-- PASO 6: Top 10 países con más áreas
-- ============================================
SELECT 
  pais,
  COUNT(*) as total_areas,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM areas), 2) as porcentaje
FROM areas
GROUP BY pais
ORDER BY total_areas DESC
LIMIT 10;

-- ============================================
-- RESUMEN DE LA OPERACIÓN
-- ============================================
-- ✅ Áreas de Europa: MANTENIDAS
-- ✅ Áreas de LATAM (excepto México): MANTENIDAS
-- ❌ EEUU/USA: ELIMINADAS
-- ❌ Marruecos: ELIMINADAS
-- ❌ México: ELIMINADAS
-- ❌ Australia: ELIMINADAS
-- ❌ Nueva Zelanda: ELIMINADAS
-- ❌ Canadá: ELIMINADAS
--
-- PAÍSES LATAM INCLUIDOS:
-- - Argentina, Chile, Uruguay, Paraguay, Brasil
-- - Perú, Bolivia, Ecuador, Colombia, Venezuela
-- - Costa Rica, Panamá, Nicaragua, Honduras, El Salvador, Guatemala
-- - Cuba, República Dominicana, Puerto Rico, Jamaica
--
-- PAÍSES EUROPA INCLUIDOS:
-- Todos los países del continente europeo (45+ países)
-- ============================================

