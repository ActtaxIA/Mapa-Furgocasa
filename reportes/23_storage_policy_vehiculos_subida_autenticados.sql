-- ============================================================
-- Script 23: Políticas de Storage para Subida de Fotos de Vehículos
-- ============================================================
-- Versión: 2.1.0
-- Fecha: 2025-11-13
-- Descripción: Permite a usuarios autenticados subir fotos de sus vehículos
-- ============================================================

BEGIN;

-- ============================================================
-- 1. POLÍTICA: Subida de fotos de vehículos (autenticados)
-- ============================================================

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Usuarios pueden subir fotos de sus vehiculos" ON storage.objects;

-- Crear política de INSERT para usuarios autenticados
-- Permite subir a: vehiculos/{user_id}/*
CREATE POLICY "Usuarios pueden subir fotos de sus vehiculos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Usuarios pueden subir fotos de sus vehiculos" ON storage.objects IS 
'Permite a usuarios autenticados subir fotos en su carpeta personal: vehiculos/{user_id}/';

-- ============================================================
-- 2. POLÍTICA: Actualización de fotos de vehículos (autenticados)
-- ============================================================

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus fotos de vehiculos" ON storage.objects;

-- Crear política de UPDATE para usuarios autenticados
CREATE POLICY "Usuarios pueden actualizar sus fotos de vehiculos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Usuarios pueden actualizar sus fotos de vehiculos" ON storage.objects IS 
'Permite a usuarios autenticados actualizar fotos en su carpeta personal';

-- ============================================================
-- 3. POLÍTICA: Eliminación de fotos de vehículos (autenticados)
-- ============================================================

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus fotos de vehiculos" ON storage.objects;

-- Crear política de DELETE para usuarios autenticados
CREATE POLICY "Usuarios pueden eliminar sus fotos de vehiculos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Usuarios pueden eliminar sus fotos de vehiculos" ON storage.objects IS 
'Permite a usuarios autenticados eliminar fotos de su carpeta personal';

COMMIT;

-- ============================================================
-- VERIFICACIÓN: Mostrar todas las políticas del bucket vehiculos
-- ============================================================

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

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- Deberías ver las siguientes políticas:
--
-- 1. "Permitir lectura pública de fotos de reportes" (SELECT, anon/authenticated)
-- 2. "Permitir subida pública de fotos de reportes" (INSERT, anon/authenticated)
-- 3. "Usuarios pueden eliminar sus fotos de vehiculos" (DELETE, authenticated)
-- 4. "Usuarios pueden subir fotos de sus vehiculos" (INSERT, authenticated)
-- 5. "Usuarios pueden actualizar sus fotos de vehiculos" (UPDATE, authenticated)
-- 6. "Usuarios pueden ver fotos de vehiculos publicas" (SELECT, authenticated)
--
-- ============================================================

