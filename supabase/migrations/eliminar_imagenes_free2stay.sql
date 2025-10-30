-- Script para eliminar imágenes de free2stay.eu que Norton detecta como phishing
-- Ejecutar este script en Supabase SQL Editor

-- 1. PRIMERO: Ver qué áreas tienen imágenes de free2stay
SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  fotos_urls
FROM areas
WHERE 
  foto_principal LIKE '%free2stay%' 
  OR fotos_urls::text LIKE '%free2stay%';

-- 2. LIMPIEZA: Eliminar foto_principal si contiene free2stay
UPDATE areas
SET 
  foto_principal = NULL,
  updated_at = NOW()
WHERE foto_principal LIKE '%free2stay%';

-- 3. LIMPIEZA: Eliminar URLs de free2stay del array fotos_urls
-- Esto elimina las URLs que contienen 'free2stay' del array de texto
UPDATE areas
SET 
  fotos_urls = (
    SELECT array_agg(elem)
    FROM unnest(fotos_urls) AS elem
    WHERE elem NOT LIKE '%free2stay%'
  ),
  updated_at = NOW()
WHERE array_to_string(fotos_urls, ',') LIKE '%free2stay%';

-- 4. Si el array quedó vacío después de limpiar, establecer como array vacío
UPDATE areas
SET fotos_urls = ARRAY[]::text[]
WHERE fotos_urls IS NOT NULL 
  AND array_length(fotos_urls, 1) IS NULL;

-- 5. VERIFICACIÓN: Mostrar áreas afectadas después de la limpieza
SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  fotos_urls,
  updated_at
FROM areas
WHERE 
  updated_at > NOW() - INTERVAL '5 minutes'
ORDER BY updated_at DESC;

-- 6. RESUMEN: Contar áreas afectadas
SELECT 
  COUNT(*) as total_areas_limpiadas
FROM areas
WHERE updated_at > NOW() - INTERVAL '5 minutes';

