-- ============================================================================
-- Script: Mapear CCAA de España y Regiones de Francia (COMPLETO)
-- Descripción: Ahora que los países están correctos, mapear regiones
-- Fecha: 2025-10-29
-- ============================================================================

-- ============================================================================
-- PASO 1: LIMPIAR comunidad_autonoma de España y Francia
-- ============================================================================

UPDATE areas 
SET comunidad_autonoma = NULL 
WHERE pais IN ('España', 'Francia') AND activo = true;

-- ============================================================================
-- PASO 2: MAPEAR CCAA DE ESPAÑA (sin códigos postales franceses)
-- ============================================================================

-- Andalucía
UPDATE areas SET comunidad_autonoma = 'Andalucía', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Almeria', 'Almería', 'Cadiz', 'Cádiz', 'Cordoba', 'Córdoba', 'Granada', 'Huelva', 'Jaen', 'Jaén', 'Malaga', 'Málaga', 'Sevilla');

-- Aragón
UPDATE areas SET comunidad_autonoma = 'Aragón', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Huesca', 'Teruel', 'Zaragoza');

-- Asturias
UPDATE areas SET comunidad_autonoma = 'Asturias', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Asturias', 'Principado de Asturias');

-- Islas Baleares
UPDATE areas SET comunidad_autonoma = 'Islas Baleares', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Baleares', 'Islas Baleares', 'Illes Balears');

-- Canarias
UPDATE areas SET comunidad_autonoma = 'Canarias', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Las Palmas', 'Santa Cruz de Tenerife', 'Tenerife');

-- Cantabria
UPDATE areas SET comunidad_autonoma = 'Cantabria', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Cantabria';

-- Castilla y León
UPDATE areas SET comunidad_autonoma = 'Castilla y León', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Avila', 'Ávila', 'Burgos', 'Leon', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora');

-- Castilla-La Mancha
UPDATE areas SET comunidad_autonoma = 'Castilla-La Mancha', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo');

-- Cataluña
UPDATE areas SET comunidad_autonoma = 'Cataluña', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Barcelona', 'Girona', 'Gerona', 'Lerida', 'Lérida', 'Lleida', 'Tarragona');

-- Comunidad Valenciana
UPDATE areas SET comunidad_autonoma = 'Comunidad Valenciana', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Alicante', 'Castellon', 'Castellón', 'Valencia');

-- Extremadura
UPDATE areas SET comunidad_autonoma = 'Extremadura', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Badajoz', 'Caceres', 'Cáceres');

-- Galicia
UPDATE areas SET comunidad_autonoma = 'Galicia', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('La Coruña', 'A Coruña', 'Lugo', 'Ourense', 'Orense', 'Pontevedra');

-- Comunidad de Madrid
UPDATE areas SET comunidad_autonoma = 'Comunidad de Madrid', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Madrid';

-- Región de Murcia
UPDATE areas SET comunidad_autonoma = 'Región de Murcia', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Murcia';

-- Navarra
UPDATE areas SET comunidad_autonoma = 'Navarra', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Navarra';

-- País Vasco
UPDATE areas SET comunidad_autonoma = 'País Vasco', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Alava', 'Álava', 'Araba', 'Guipuzcoa', 'Guipúzcoa', 'Gipuzkoa', 'Vizcaya', 'Bizkaia');

-- La Rioja
UPDATE areas SET comunidad_autonoma = 'La Rioja', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'La Rioja';

-- ============================================================================
-- PASO 3: MAPEAR REGIONES DE FRANCIA (por código postal)
-- ============================================================================

-- Bretagne (Bretaña) - CP: 22xxx, 29xxx, 35xxx, 56xxx
UPDATE areas SET comunidad_autonoma = 'Bretagne', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '22%' OR provincia LIKE '29%' OR provincia LIKE '35%' OR provincia LIKE '56%');

-- Normandie - CP: 14xxx, 27xxx, 50xxx, 61xxx, 76xxx
UPDATE areas SET comunidad_autonoma = 'Normandie', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '14%' OR provincia LIKE '27%' OR provincia LIKE '50%' OR provincia LIKE '61%' OR provincia LIKE '76%');

-- Pays de la Loire - CP: 44xxx, 49xxx, 53xxx, 72xxx, 85xxx
UPDATE areas SET comunidad_autonoma = 'Pays de la Loire', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '44%' OR provincia LIKE '49%' OR provincia LIKE '53%' OR provincia LIKE '72%' OR provincia LIKE '85%');

-- Nouvelle-Aquitaine - CP: 16xxx, 17xxx, 19xxx, 23xxx, 24xxx, 33xxx, 40xxx, 47xxx, 64xxx, 79xxx, 86xxx, 87xxx
UPDATE areas SET comunidad_autonoma = 'Nouvelle-Aquitaine', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '16%' OR provincia LIKE '17%' OR provincia LIKE '19%' OR provincia LIKE '23%' OR provincia LIKE '24%' OR provincia LIKE '33%' OR provincia LIKE '40%' OR provincia LIKE '47%' OR provincia LIKE '64%' OR provincia LIKE '79%' OR provincia LIKE '86%' OR provincia LIKE '87%');

-- Occitanie - CP: 09xxx, 11xxx, 12xxx, 30xxx, 31xxx, 32xxx, 34xxx, 46xxx, 48xxx, 65xxx, 66xxx, 81xxx, 82xxx
UPDATE areas SET comunidad_autonoma = 'Occitanie', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '09%' OR provincia LIKE '11%' OR provincia LIKE '12%' OR provincia LIKE '30%' OR provincia LIKE '31%' OR provincia LIKE '32%' OR provincia LIKE '34%' OR provincia LIKE '46%' OR provincia LIKE '48%' OR provincia LIKE '65%' OR provincia LIKE '66%' OR provincia LIKE '81%' OR provincia LIKE '82%');

-- Provence-Alpes-Côte d'Azur (PACA) - CP: 04xxx, 05xxx, 06xxx, 13xxx, 83xxx, 84xxx
UPDATE areas SET comunidad_autonoma = 'Provence-Alpes-Côte d''Azur', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '04%' OR provincia LIKE '05%' OR provincia LIKE '06%' OR provincia LIKE '13%' OR provincia LIKE '83%' OR provincia LIKE '84%');

-- Auvergne-Rhône-Alpes - CP: 01xxx, 03xxx, 07xxx, 15xxx, 26xxx, 38xxx, 42xxx, 43xxx, 63xxx, 69xxx, 73xxx, 74xxx
UPDATE areas SET comunidad_autonoma = 'Auvergne-Rhône-Alpes', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '01%' OR provincia LIKE '03%' OR provincia LIKE '07%' OR provincia LIKE '15%' OR provincia LIKE '26%' OR provincia LIKE '38%' OR provincia LIKE '42%' OR provincia LIKE '43%' OR provincia LIKE '63%' OR provincia LIKE '69%' OR provincia LIKE '73%' OR provincia LIKE '74%');

-- Centre-Val de Loire - CP: 18xxx, 28xxx, 36xxx, 37xxx, 41xxx, 45xxx
UPDATE areas SET comunidad_autonoma = 'Centre-Val de Loire', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '18%' OR provincia LIKE '28%' OR provincia LIKE '36%' OR provincia LIKE '37%' OR provincia LIKE '41%' OR provincia LIKE '45%');

-- Bourgogne-Franche-Comté - CP: 21xxx, 25xxx, 39xxx, 58xxx, 70xxx, 71xxx, 89xxx, 90xxx
UPDATE areas SET comunidad_autonoma = 'Bourgogne-Franche-Comté', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '21%' OR provincia LIKE '25%' OR provincia LIKE '39%' OR provincia LIKE '58%' OR provincia LIKE '70%' OR provincia LIKE '71%' OR provincia LIKE '89%' OR provincia LIKE '90%');

-- Grand Est - CP: 08xxx, 10xxx, 51xxx, 52xxx, 54xxx, 55xxx, 57xxx, 67xxx, 68xxx, 88xxx
UPDATE areas SET comunidad_autonoma = 'Grand Est', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '08%' OR provincia LIKE '10%' OR provincia LIKE '51%' OR provincia LIKE '52%' OR provincia LIKE '54%' OR provincia LIKE '55%' OR provincia LIKE '57%' OR provincia LIKE '67%' OR provincia LIKE '68%' OR provincia LIKE '88%');

-- Hauts-de-France - CP: 02xxx, 59xxx, 60xxx, 62xxx, 80xxx
UPDATE areas SET comunidad_autonoma = 'Hauts-de-France', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '02%' OR provincia LIKE '59%' OR provincia LIKE '60%' OR provincia LIKE '62%' OR provincia LIKE '80%');

-- Île-de-France (París) - CP: 75xxx, 77xxx, 78xxx, 91xxx, 92xxx, 93xxx, 94xxx, 95xxx
UPDATE areas SET comunidad_autonoma = 'Île-de-France', updated_at = NOW()
WHERE pais = 'Francia' AND (provincia LIKE '75%' OR provincia LIKE '77%' OR provincia LIKE '78%' OR provincia LIKE '91%' OR provincia LIKE '92%' OR provincia LIKE '93%' OR provincia LIKE '94%' OR provincia LIKE '95%');

-- Corse (Córcega) - CP: 20xxx
UPDATE areas SET comunidad_autonoma = 'Corse', updated_at = NOW()
WHERE pais = 'Francia' AND provincia LIKE '20%';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Resumen España
SELECT 
  'España' as pais,
  COUNT(DISTINCT comunidad_autonoma) as ccaa_unicas,
  COUNT(DISTINCT provincia) as provincias_unicas,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN comunidad_autonoma IS NOT NULL THEN 1 END) as con_ccaa,
  COUNT(CASE WHEN comunidad_autonoma IS NULL THEN 1 END) as sin_ccaa
FROM areas
WHERE pais = 'España' AND activo = true;

-- Resumen Francia
SELECT 
  'Francia' as pais,
  COUNT(DISTINCT comunidad_autonoma) as regiones_unicas,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN comunidad_autonoma IS NOT NULL THEN 1 END) as con_region,
  COUNT(CASE WHEN comunidad_autonoma IS NULL THEN 1 END) as sin_region
FROM areas
WHERE pais = 'Francia' AND activo = true;

-- Ver CCAA de España
SELECT DISTINCT comunidad_autonoma
FROM areas
WHERE pais = 'España' AND activo = true AND comunidad_autonoma IS NOT NULL
ORDER BY comunidad_autonoma;

-- Ver Regiones de Francia  
SELECT DISTINCT comunidad_autonoma
FROM areas
WHERE pais = 'Francia' AND activo = true AND comunidad_autonoma IS NOT NULL
ORDER BY comunidad_autonoma;

