-- ===================================================================
-- STORAGE POLICIES: Lectura Pública de Fotos de Vehículos
-- ===================================================================
-- Permite que cualquier usuario autenticado pueda VER las fotos
-- de los vehículos de otros usuarios (necesario para ver reportes)
-- ===================================================================

BEGIN;

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Usuarios pueden ver fotos de vehiculos publicas" ON storage.objects;

-- ===================================================================
-- POLÍTICA: Lectura pública de fotos de vehículos
-- ===================================================================
-- Permite a usuarios autenticados ver fotos del bucket vehiculos
-- SOLO LECTURA - no pueden modificar ni borrar
CREATE POLICY "Usuarios pueden ver fotos de vehiculos publicas"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vehiculos'
);

-- ===================================================================
-- NOTA: Las políticas de INSERT/UPDATE/DELETE ya existen
-- y permiten que cada usuario solo modifique sus propias fotos
-- Esta política SOLO añade lectura pública
-- ===================================================================

COMMIT;

-- ===================================================================
-- VERIFICACIÓN: Comprobar que la política se creó correctamente
-- ===================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND bucket_id = 'vehiculos'
ORDER BY policyname;

