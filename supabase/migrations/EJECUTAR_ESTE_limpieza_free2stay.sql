-- ============================================
-- SCRIPT DE LIMPIEZA: ELIMINAR FREE2STAY.EU
-- ============================================
-- Norton detecta este dominio como phishing
-- Este script elimina todas las referencias de forma segura
-- ============================================

-- PASO 1: Ver cuántas áreas están afectadas
DO $$
DECLARE
  total_foto_principal INTEGER;
  total_fotos_urls INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_foto_principal FROM areas WHERE foto_principal LIKE '%free2stay%';
  SELECT COUNT(*) INTO total_fotos_urls FROM areas WHERE array_to_string(fotos_urls, ',') LIKE '%free2stay%';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'ÁREAS AFECTADAS:';
  RAISE NOTICE '  - Con foto_principal de free2stay: %', total_foto_principal;
  RAISE NOTICE '  - Con imágenes en fotos_urls de free2stay: %', total_fotos_urls;
  RAISE NOTICE '============================================';
END $$;

-- PASO 2: Crear backup temporal (por seguridad)
DROP TABLE IF EXISTS temp_backup_free2stay;

CREATE TEMP TABLE temp_backup_free2stay AS
SELECT 
  id,
  nombre,
  foto_principal,
  fotos_urls,
  updated_at
FROM areas
WHERE 
  foto_principal LIKE '%free2stay%' 
  OR array_to_string(fotos_urls, ',') LIKE '%free2stay%';

-- Mostrar backup creado
SELECT 
  id,
  nombre,
  foto_principal,
  array_length(fotos_urls, 1) as num_fotos
FROM temp_backup_free2stay;

-- PASO 3-5: EJECUTAR LIMPIEZA
DO $$
DECLARE
  rows_foto_principal INTEGER;
  rows_fotos_urls INTEGER;
  rows_vacios INTEGER;
BEGIN
  -- PASO 3: Eliminar foto_principal
  UPDATE areas
  SET 
    foto_principal = NULL,
    updated_at = NOW()
  WHERE foto_principal LIKE '%free2stay%';
  
  GET DIAGNOSTICS rows_foto_principal = ROW_COUNT;
  RAISE NOTICE '✓ Fotos principales limpiadas: % filas', rows_foto_principal;

  -- PASO 4: Filtrar fotos_urls
  UPDATE areas
  SET 
    fotos_urls = (
      SELECT array_agg(elem)
      FROM unnest(fotos_urls) AS elem
      WHERE elem NOT LIKE '%free2stay%'
    ),
    updated_at = NOW()
  WHERE array_to_string(fotos_urls, ',') LIKE '%free2stay%';
  
  GET DIAGNOSTICS rows_fotos_urls = ROW_COUNT;
  RAISE NOTICE '✓ Arrays de fotos limpiados: % filas', rows_fotos_urls;

  -- PASO 5: Limpiar arrays vacíos
  UPDATE areas
  SET fotos_urls = NULL
  WHERE fotos_urls IS NOT NULL 
    AND (array_length(fotos_urls, 1) IS NULL OR array_length(fotos_urls, 1) = 0);
  
  GET DIAGNOSTICS rows_vacios = ROW_COUNT;
  RAISE NOTICE '✓ Arrays vacíos limpiados: % filas', rows_vacios;
END $$;

-- PASO 6: VERIFICACIÓN FINAL
DO $$
DECLARE
  quedan_referencias INTEGER;
BEGIN
  SELECT COUNT(*) INTO quedan_referencias 
  FROM areas 
  WHERE foto_principal LIKE '%free2stay%' 
     OR array_to_string(fotos_urls, ',') LIKE '%free2stay%';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'VERIFICACIÓN FINAL:';
  IF quedan_referencias = 0 THEN
    RAISE NOTICE '  ✅ LIMPIEZA EXITOSA - No quedan referencias a free2stay';
  ELSE
    RAISE WARNING '  ⚠️ AÚN QUEDAN % referencias a free2stay', quedan_referencias;
  END IF;
  RAISE NOTICE '============================================';
END $$;

-- PASO 7: Mostrar áreas que quedaron sin imágenes
SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  array_length(fotos_urls, 1) as num_fotos_restantes,
  'SIN IMÁGENES - Considerar re-enriquecer' as estado
FROM areas
WHERE 
  updated_at > NOW() - INTERVAL '5 minutes'
  AND foto_principal IS NULL
  AND (fotos_urls IS NULL OR array_length(fotos_urls, 1) IS NULL OR array_length(fotos_urls, 1) = 0);

-- RESUMEN FINAL
SELECT 
  COUNT(*) as areas_limpiadas,
  COUNT(CASE WHEN foto_principal IS NULL THEN 1 END) as sin_foto_principal,
  COUNT(CASE WHEN fotos_urls IS NULL OR array_length(fotos_urls, 1) IS NULL THEN 1 END) as sin_galeria
FROM areas
WHERE updated_at > NOW() - INTERVAL '5 minutes';

