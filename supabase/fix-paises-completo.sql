-- ============================================================================
-- SCRIPT COMPLETO PARA CORREGIR PAÍSES EN ÁREAS
-- ============================================================================
-- Este script detecta y corrige áreas que están mal etiquetadas por país
-- usando múltiples criterios: provincia, ciudad, dirección, código postal
-- ============================================================================

-- PASO 1: Ver qué se va a corregir (EJECUTAR PRIMERO PARA REVISAR)
-- ============================================================================

-- 1.1 Áreas con PROVINCIA portuguesa
SELECT 
  'Por Provincia' as criterio,
  COUNT(*) as total,
  provincia
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND provincia IN (
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
    'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
    'Viana do Castelo', 'Vila Real', 'Viseu',
    'Açores', 'Madeira', 'Região Autónoma dos Açores', 
    'Região Autónoma da Madeira', 'Distrito de Faro',
    'Distrito de Lisboa', 'Distrito do Porto', 'Algarve'
  )
GROUP BY provincia
ORDER BY total DESC;

-- 1.2 Áreas con DIRECCIÓN que contiene "Portugal"
SELECT 
  'Por Dirección' as criterio,
  COUNT(*) as total
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND (
    direccion ILIKE '%Portugal%' OR
    direccion ILIKE '%, PT%' OR
    direccion ILIKE '%Portuguese%'
  );

-- 1.3 Áreas con CÓDIGO POSTAL portugués (formato: XXXX-XXX)
SELECT 
  'Por Código Postal' as criterio,
  COUNT(*) as total
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND codigo_postal ~ '^\d{4}-\d{3}$';

-- 1.4 Áreas con CIUDADES portuguesas conocidas
SELECT 
  'Por Ciudad' as criterio,
  COUNT(*) as total,
  ciudad
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND ciudad IN (
    'Lisboa', 'Porto', 'Faro', 'Coimbra', 'Braga', 'Setúbal',
    'Funchal', 'Évora', 'Aveiro', 'Leiria', 'Viseu', 'Guarda',
    'Beja', 'Bragança', 'Portalegre', 'Santarém', 'Viana do Castelo',
    'Vila Real', 'Ponta Delgada', 'Portimão', 'Albufeira', 'Lagos',
    'Cascais', 'Sintra', 'Matosinhos', 'Gondomar', 'Almada', 'Seixal',
    'Oeiras', 'Amadora', 'Braga', 'Queluz', 'Odivelas', 'Loures',
    'Vila Nova de Gaia', 'Guimarães', 'Espinho', 'Póvoa de Varzim',
    'Vila do Conde', 'Figueira da Foz', 'Torres Vedras', 'Caldas da Rainha',
    'Nazaré', 'Peniche', 'Óbidos', 'Ericeira', 'Mafra', 'Sesimbra',
    'Comporta', 'Sines', 'Vila Nova de Milfontes', 'Tavira', 'Olhão',
    'Sagres', 'Castro Marim', 'Vila Real de Santo António'
  )
GROUP BY cidade
ORDER BY total DESC;


-- ============================================================================
-- PASO 2: APLICAR LAS CORRECCIONES (EJECUTAR DESPUÉS DE REVISAR)
-- ============================================================================

-- 2.1 Corregir por PROVINCIA
UPDATE areas
SET pais = 'Portugal'
WHERE activo = true
  AND pais != 'Portugal'
  AND provincia IN (
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
    'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
    'Viana do Castelo', 'Vila Real', 'Viseu',
    'Açores', 'Madeira', 'Região Autónoma dos Açores', 
    'Região Autónoma da Madeira', 'Distrito de Faro',
    'Distrito de Lisboa', 'Distrito do Porto', 'Algarve'
  );

-- 2.2 Corregir por DIRECCIÓN que contiene "Portugal"
UPDATE areas
SET pais = 'Portugal'
WHERE activo = true
  AND pais != 'Portugal'
  AND (
    direccion ILIKE '%Portugal%' OR
    direccion ILIKE '%, PT%' OR
    direccion ILIKE '%Portuguese%'
  );

-- 2.3 Corregir por CÓDIGO POSTAL portugués
UPDATE areas
SET pais = 'Portugal'
WHERE activo = true
  AND pais != 'Portugal'
  AND codigo_postal ~ '^\d{4}-\d{3}$';

-- 2.4 Corregir por CIUDADES portuguesas
UPDATE areas
SET pais = 'Portugal'
WHERE activo = true
  AND pais != 'Portugal'
  AND ciudad IN (
    'Lisboa', 'Porto', 'Faro', 'Coimbra', 'Braga', 'Setúbal',
    'Funchal', 'Évora', 'Aveiro', 'Leiria', 'Viseu', 'Guarda',
    'Beja', 'Bragança', 'Portalegre', 'Santarém', 'Viana do Castelo',
    'Vila Real', 'Ponta Delgada', 'Portimão', 'Albufeira', 'Lagos',
    'Cascais', 'Sintra', 'Matosinhos', 'Gondomar', 'Almada', 'Seixal',
    'Oeiras', 'Amadora', 'Braga', 'Queluz', 'Odivelas', 'Loures',
    'Vila Nova de Gaia', 'Guimarães', 'Espinho', 'Póvoa de Varzim',
    'Vila do Conde', 'Figueira da Foz', 'Torres Vedras', 'Caldas da Rainha',
    'Nazaré', 'Peniche', 'Óbidos', 'Ericeira', 'Mafra', 'Sesimbra',
    'Comporta', 'Sines', 'Vila Nova de Milfontes', 'Tavira', 'Olhão',
    'Sagres', 'Castro Marim', 'Vila Real de Santo António'
  );

-- 2.5 Corregir ANDORRA por código postal (AD)
UPDATE areas
SET pais = 'Andorra'
WHERE activo = true
  AND pais != 'Andorra'
  AND (
    codigo_postal ILIKE 'AD%' OR
    direccion ILIKE '%Andorra%'
  );

-- 2.6 Limpiar espacios extra en todos los países
UPDATE areas
SET pais = TRIM(pais)
WHERE LENGTH(pais) != LENGTH(TRIM(pais));


-- ============================================================================
-- PASO 3: VERIFICAR LOS RESULTADOS
-- ============================================================================

-- 3.1 Resumen final por país
SELECT 
  pais,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN activo = true THEN 1 END) as activas,
  COUNT(CASE WHEN activo = false THEN 1 END) as inactivas
FROM areas
GROUP BY pais
ORDER BY total_areas DESC;

-- 3.2 Ver algunas áreas de Portugal para confirmar
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  codigo_postal,
  LEFT(direccion, 50) as direccion_corta
FROM areas
WHERE activo = true
  AND pais = 'Portugal'
ORDER BY nombre
LIMIT 20;

-- 3.3 Verificar si quedan áreas portuguesas mal etiquetadas
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  codigo_postal,
  direccion
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND (
    direccion ILIKE '%Portugal%' OR
    provincia IN (
      'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
      'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
      'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
      'Viana do Castelo', 'Vila Real', 'Viseu',
      'Açores', 'Madeira', 'Algarve'
    )
  )
LIMIT 50;


-- ============================================================================
-- OPCIONAL: Ver áreas que podrían necesitar revisión manual
-- ============================================================================

-- Áreas con datos incompletos o sospechosos
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  codigo_postal,
  direccion
FROM areas
WHERE activo = true
  AND (
    -- Sin provincia pero con país España (podrían ser Portugal)
    (provincia IS NULL AND pais = 'España' AND direccion ILIKE '%Portugal%')
    OR
    -- Ciudades que podrían estar mal escritas
    (ciudad ILIKE '%Port%' AND pais != 'Portugal')
    OR
    -- Direcciones sospechosas
    (direccion ILIKE '%PT%' AND pais != 'Portugal')
  )
ORDER BY nombre;

