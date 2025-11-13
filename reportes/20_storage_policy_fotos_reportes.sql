-- ===================================================================
-- STORAGE POLICIES: Fotos de Reportes de Accidentes
-- ===================================================================
-- Políticas para permitir subida pública de fotos en reportes
-- IMPORTANTE: Este script debe ejecutarse en el SQL Editor de Supabase
-- ===================================================================

BEGIN;

-- Eliminar políticas anteriores si existen (por si se ejecuta múltiples veces)
DROP POLICY IF EXISTS "Permitir subida pública de fotos de reportes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de fotos de reportes" ON storage.objects;

-- ===================================================================
-- POLÍTICA 1: Permitir SUBIDA pública de fotos de reportes
-- ===================================================================
-- Permite a testigos anónimos (anon) y usuarios autenticados (authenticated)
-- subir fotos a la carpeta reportes/ del bucket vehiculos
CREATE POLICY "Permitir subida pública de fotos de reportes"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'vehiculos' 
  AND (storage.foldername(name))[1] = 'reportes'
);

-- ===================================================================
-- POLÍTICA 2: Permitir LECTURA pública de fotos de reportes
-- ===================================================================
-- Permite a cualquier usuario (anon, authenticated) leer/ver fotos
-- de la carpeta reportes/ para que los propietarios puedan verlas
CREATE POLICY "Permitir lectura pública de fotos de reportes"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = 'reportes'
);

COMMIT;

-- ===================================================================
-- VERIFICACIÓN: Comprobar que las políticas se crearon correctamente
-- ===================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%reportes%'
ORDER BY policyname;

