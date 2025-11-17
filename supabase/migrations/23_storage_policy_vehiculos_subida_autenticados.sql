-- ===================================================================
-- STORAGE POLICIES: Fotos de Vehículos (Usuarios Autenticados)
-- ===================================================================
-- Políticas para permitir subida de fotos de vehículos
-- IMPORTANTE: Este script debe ejecutarse en el SQL Editor de Supabase
-- ===================================================================

BEGIN;

-- Eliminar políticas anteriores si existen (por si se ejecuta múltiples veces)
DROP POLICY IF EXISTS "Usuarios pueden subir fotos de vehiculos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar fotos de vehiculos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar fotos de vehiculos" ON storage.objects;

-- ===================================================================
-- POLÍTICA 1: Permitir SUBIDA de fotos de vehículos (autenticados)
-- ===================================================================
-- Permite a usuarios autenticados subir fotos a la carpeta vehiculos/
-- del bucket vehiculos (igual que reportes pero solo authenticated)
CREATE POLICY "Usuarios pueden subir fotos de vehiculos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = 'vehiculos'
);

-- ===================================================================
-- POLÍTICA 2: Permitir ACTUALIZACIÓN de fotos de vehículos
-- ===================================================================
CREATE POLICY "Usuarios pueden actualizar fotos de vehiculos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = 'vehiculos'
)
WITH CHECK (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = 'vehiculos'
);

-- ===================================================================
-- POLÍTICA 3: Permitir ELIMINACIÓN de fotos de vehículos
-- ===================================================================
CREATE POLICY "Usuarios pueden eliminar fotos de vehiculos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = 'vehiculos'
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
  AND policyname LIKE '%vehiculos%'
ORDER BY policyname;

-- ===================================================================
-- RESULTADO ESPERADO:
-- ===================================================================
-- Deberías ver las siguientes políticas para el bucket vehiculos:
--
-- REPORTES (anon + authenticated):
-- 1. "Permitir lectura pública de fotos de reportes" (SELECT)
-- 2. "Permitir subida pública de fotos de reportes" (INSERT)
--
-- VEHÍCULOS (solo authenticated):
-- 3. "Usuarios pueden eliminar fotos de vehiculos" (DELETE)
-- 4. "Usuarios pueden subir fotos de vehiculos" (INSERT)
-- 5. "Usuarios pueden actualizar fotos de vehiculos" (UPDATE)
-- 6. "Usuarios pueden ver fotos de vehiculos publicas" (SELECT) - ya existe
--
-- ===================================================================
