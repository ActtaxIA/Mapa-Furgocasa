-- ============================================================================
-- SCRIPT PARA CORREGIR ÁREAS DE FRANCIA
-- ============================================================================
-- Este script detecta y corrige áreas francesas que están mal etiquetadas
-- como España usando múltiples criterios: departamento, ciudad, dirección, código postal
-- ============================================================================

-- PASO 1: Ver qué se va a corregir (EJECUTAR PRIMERO PARA REVISAR)
-- ============================================================================

-- 1.1 Áreas con DEPARTAMENTOS franceses (cerca de la frontera con España)
SELECT 
  'Por Departamento/Provincia' as criterio,
  COUNT(*) as total,
  provincia
FROM areas
WHERE activo = true
  AND pais != 'Francia'
  AND provincia IN (
    -- Departamentos franceses frontera con España
    'Pyrénées-Orientales', 'Pirineos Orientales', 'Pyrénées Orientales',
    'Aude', 'Ariège', 'Haute-Garonne', 'Hautes-Pyrénées',
    'Pyrénées-Atlantiques', 'Pirineos Atlánticos', 'Pyrénées Atlantiques',
    'Landes', 'Gironde', 'Nouvelle-Aquitaine',
    'Occitanie', 'Occitania',
    -- Otras regiones francesas populares
    'Provence-Alpes-Côte d''Azur', 'PACA', 'Alpes-Maritimes',
    'Var', 'Bouches-du-Rhône', 'Vaucluse', 'Alpes-de-Haute-Provence',
    'Bretagne', 'Bretaña', 'Finistère', 'Morbihan', 'Côtes-d''Armor', 'Ille-et-Vilaine',
    'Normandie', 'Normandía', 'Calvados', 'Manche', 'Seine-Maritime',
    'Pays de la Loire', 'Loire-Atlantique', 'Vendée', 'Maine-et-Loire',
    'Nouvelle-Aquitaine', 'Charente-Maritime', 'Dordogne', 'Lot-et-Garonne',
    'Auvergne-Rhône-Alpes', 'Rhône', 'Savoie', 'Haute-Savoie', 'Isère',
    'Bourgogne-Franche-Comté', 'Grand Est', 'Île-de-France', 'Paris',
    'Centre-Val de Loire', 'Hauts-de-France', 'Corse', 'Córcega'
  )
GROUP BY provincia
ORDER BY total DESC;

-- 1.2 Áreas con DIRECCIÓN que contiene "France" o "Francia"
SELECT 
  'Por Dirección' as criterio,
  COUNT(*) as total
FROM areas
WHERE activo = true
  AND pais != 'Francia'
  AND (
    direccion ILIKE '%France%' OR
    direccion ILIKE '%Francia%' OR
    direccion ILIKE '%, FR%' OR
    direccion ILIKE '%French%'
  );

-- 1.3 Áreas con CÓDIGO POSTAL francés (formato: 5 dígitos)
-- Códigos postales franceses cerca de España: 64xxx, 65xxx, 66xxx, 09xxx, 11xxx
SELECT 
  'Por Código Postal' as criterio,
  COUNT(*) as total
FROM areas
WHERE activo = true
  AND pais != 'Francia'
  AND (
    codigo_postal ~ '^64\d{3}$' OR  -- Pyrénées-Atlantiques
    codigo_postal ~ '^65\d{3}$' OR  -- Hautes-Pyrénées
    codigo_postal ~ '^66\d{3}$' OR  -- Pyrénées-Orientales
    codigo_postal ~ '^09\d{3}$' OR  -- Ariège
    codigo_postal ~ '^11\d{3}$' OR  -- Aude
    codigo_postal ~ '^31\d{3}$' OR  -- Haute-Garonne
    codigo_postal ~ '^40\d{3}$' OR  -- Landes
    codigo_postal ~ '^33\d{3}$' OR  -- Gironde
    -- Otros códigos franceses comunes
    codigo_postal ~ '^0[1-9]\d{3}$' OR
    codigo_postal ~ '^[1-9]\d{4}$'
  );

-- 1.4 Áreas con CIUDADES francesas conocidas
SELECT 
  'Por Ciudad' as criterio,
  COUNT(*) as total,
  ciudad
FROM areas
WHERE activo = true
  AND pais != 'Francia'
  AND ciudad IN (
    -- Frontera con España
    'Perpignan', 'Perpiñán', 'Céret', 'Argelès-sur-Mer', 'Collioure',
    'Banyuls-sur-Mer', 'Port-Vendres', 'Canet-en-Roussillon',
    'Narbonne', 'Carcassonne', 'Foix', 'Toulouse', 'Tarbes',
    'Pau', 'Bayonne', 'Biarritz', 'Saint-Jean-de-Luz', 'Hendaye',
    'Dax', 'Mont-de-Marsan', 'Bordeaux', 'Arcachon',
    -- Costa Azul / Sur de Francia
    'Nice', 'Niza', 'Cannes', 'Antibes', 'Menton', 'Monaco', 'Mónaco',
    'Saint-Tropez', 'Toulon', 'Marseille', 'Marsella', 'Aix-en-Provence',
    'Avignon', 'Aviñón', 'Montpellier', 'Nîmes', 'Arles',
    -- Bretaña
    'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo', 'Rennes',
    'Nantes', 'La Rochelle', 'Royan', 'Saintes',
    -- Normandía
    'Rouen', 'Le Havre', 'Caen', 'Cherbourg', 'Deauville', 'Honfleur',
    -- Valle del Loira
    'Tours', 'Orléans', 'Angers', 'Le Mans', 'Blois',
    -- Alpes
    'Grenoble', 'Annecy', 'Chambéry', 'Chamonix', 'Megève',
    -- París y alrededores
    'Paris', 'París', 'Versailles', 'Versalles', 'Fontainebleau',
    -- Alsacia y Este
    'Strasbourg', 'Estrasburgo', 'Mulhouse', 'Colmar', 'Nancy', 'Metz',
    -- Borgoña
    'Dijon', 'Beaune', 'Lyon', 'Villefranche-sur-Saône',
    -- Córcega
    'Ajaccio', 'Bastia', 'Calvi', 'Porto-Vecchio', 'Bonifacio'
  )
GROUP BY ciudad
ORDER BY total DESC;


-- ============================================================================
-- PASO 2: APLICAR LAS CORRECCIONES (EJECUTAR DESPUÉS DE REVISAR)
-- ============================================================================

-- 2.1 Corregir por DEPARTAMENTO/PROVINCIA
UPDATE areas
SET pais = 'Francia'
WHERE activo = true
  AND pais != 'Francia'
  AND provincia IN (
    -- Departamentos franceses frontera con España
    'Pyrénées-Orientales', 'Pirineos Orientales', 'Pyrénées Orientales',
    'Aude', 'Ariège', 'Haute-Garonne', 'Hautes-Pyrénées',
    'Pyrénées-Atlantiques', 'Pirineos Atlánticos', 'Pyrénées Atlantiques',
    'Landes', 'Gironde', 'Nouvelle-Aquitaine',
    'Occitanie', 'Occitania',
    -- Otras regiones francesas populares
    'Provence-Alpes-Côte d''Azur', 'PACA', 'Alpes-Maritimes',
    'Var', 'Bouches-du-Rhône', 'Vaucluse', 'Alpes-de-Haute-Provence',
    'Bretagne', 'Bretaña', 'Finistère', 'Morbihan', 'Côtes-d''Armor', 'Ille-et-Vilaine',
    'Normandie', 'Normandía', 'Calvados', 'Manche', 'Seine-Maritime',
    'Pays de la Loire', 'Loire-Atlantique', 'Vendée', 'Maine-et-Loire',
    'Nouvelle-Aquitaine', 'Charente-Maritime', 'Dordogne', 'Lot-et-Garonne',
    'Auvergne-Rhône-Alpes', 'Rhône', 'Savoie', 'Haute-Savoie', 'Isère',
    'Bourgogne-Franche-Comté', 'Grand Est', 'Île-de-France', 'Paris',
    'Centre-Val de Loire', 'Hauts-de-France', 'Corse', 'Córcega'
  );

-- 2.2 Corregir por DIRECCIÓN que contiene "France" o "Francia"
UPDATE areas
SET pais = 'Francia'
WHERE activo = true
  AND pais != 'Francia'
  AND (
    direccion ILIKE '%France%' OR
    direccion ILIKE '%Francia%' OR
    direccion ILIKE '%, FR%' OR
    direccion ILIKE '%French%'
  );

-- 2.3 Corregir por CÓDIGO POSTAL francés
UPDATE areas
SET pais = 'Francia'
WHERE activo = true
  AND pais != 'Francia'
  AND (
    codigo_postal ~ '^64\d{3}$' OR  -- Pyrénées-Atlantiques
    codigo_postal ~ '^65\d{3}$' OR  -- Hautes-Pyrénées
    codigo_postal ~ '^66\d{3}$' OR  -- Pyrénées-Orientales
    codigo_postal ~ '^09\d{3}$' OR  -- Ariège
    codigo_postal ~ '^11\d{3}$' OR  -- Aude
    codigo_postal ~ '^31\d{3}$' OR  -- Haute-Garonne
    codigo_postal ~ '^40\d{3}$' OR  -- Landes
    codigo_postal ~ '^33\d{3}$' OR  -- Gironde
    -- Otros códigos franceses comunes
    codigo_postal ~ '^0[1-9]\d{3}$' OR
    codigo_postal ~ '^[1-9]\d{4}$'
  );

-- 2.4 Corregir por CIUDADES francesas
UPDATE areas
SET pais = 'Francia'
WHERE activo = true
  AND pais != 'Francia'
  AND ciudad IN (
    -- Frontera con España
    'Perpignan', 'Perpiñán', 'Céret', 'Argelès-sur-Mer', 'Collioure',
    'Banyuls-sur-Mer', 'Port-Vendres', 'Canet-en-Roussillon',
    'Narbonne', 'Carcassonne', 'Foix', 'Toulouse', 'Tarbes',
    'Pau', 'Bayonne', 'Biarritz', 'Saint-Jean-de-Luz', 'Hendaye',
    'Dax', 'Mont-de-Marsan', 'Bordeaux', 'Arcachon',
    -- Costa Azul / Sur de Francia
    'Nice', 'Niza', 'Cannes', 'Antibes', 'Menton', 'Monaco', 'Mónaco',
    'Saint-Tropez', 'Toulon', 'Marseille', 'Marsella', 'Aix-en-Provence',
    'Avignon', 'Aviñón', 'Montpellier', 'Nîmes', 'Arles',
    -- Bretaña
    'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo', 'Rennes',
    'Nantes', 'La Rochelle', 'Royan', 'Saintes',
    -- Normandía
    'Rouen', 'Le Havre', 'Caen', 'Cherbourg', 'Deauville', 'Honfleur',
    -- Valle del Loira
    'Tours', 'Orléans', 'Angers', 'Le Mans', 'Blois',
    -- Alpes
    'Grenoble', 'Annecy', 'Chambéry', 'Chamonix', 'Megève',
    -- París y alrededores
    'Paris', 'París', 'Versailles', 'Versalles', 'Fontainebleau',
    -- Alsacia y Este
    'Strasbourg', 'Estrasburgo', 'Mulhouse', 'Colmar', 'Nancy', 'Metz',
    -- Borgoña
    'Dijon', 'Beaune', 'Lyon', 'Villefranche-sur-Saône',
    -- Córcega
    'Ajaccio', 'Bastia', 'Calvi', 'Porto-Vecchio', 'Bonifacio'
  );


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

-- 3.2 Ver algunas áreas de Francia para confirmar
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  codigo_postal,
  LEFT(direccion, 60) as direccion_corta
FROM areas
WHERE activo = true
  AND pais = 'Francia'
ORDER BY nombre
LIMIT 30;

-- 3.3 Verificar si quedan áreas francesas mal etiquetadas
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  codigo_postal,
  direccion
FROM areas
WHERE activo = true
  AND pais != 'Francia'
  AND (
    direccion ILIKE '%France%' OR
    direccion ILIKE '%Francia%' OR
    provincia IN (
      'Pyrénées-Orientales', 'Pyrénées-Atlantiques', 
      'Occitanie', 'Nouvelle-Aquitaine', 'PACA',
      'Bretagne', 'Normandie'
    ) OR
    ciudad IN (
      'Perpignan', 'Bayonne', 'Biarritz', 'Toulouse', 
      'Bordeaux', 'Nice', 'Marseille', 'Paris'
    )
  )
LIMIT 50;


-- ============================================================================
-- OPCIONAL: Ver áreas que podrían necesitar revisión manual
-- ============================================================================

-- Áreas con datos sospechosos
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
    -- Ciudades que suenan francesas pero no están en Francia
    (ciudad ILIKE '%-sur-%' AND pais != 'Francia')
    OR
    -- Direcciones con palabras francesas
    (direccion ILIKE '%Rue%' AND pais != 'Francia')
    OR
    (direccion ILIKE '%Avenue%' AND pais != 'Francia')
    OR
    -- Códigos postales de 5 dígitos que no son España
    (codigo_postal ~ '^\d{5}$' AND pais = 'España')
  )
ORDER BY nombre
LIMIT 50;

