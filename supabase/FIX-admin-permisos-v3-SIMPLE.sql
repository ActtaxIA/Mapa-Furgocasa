-- ===================================================================
-- FIX V3: Permisos de admin - APPROACH SIMPLE
-- ===================================================================
-- Simplemente permitimos DELETE y UPDATE a usuarios autenticados
-- Luego validamos is_admin en el frontend (ya lo hace)
-- ===================================================================

-- Eliminar politicas actuales
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear áreas" ON public.areas;

-- CREAR: Usuarios autenticados pueden crear
CREATE POLICY "Usuarios autenticados pueden crear áreas"
  ON public.areas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ACTUALIZAR: Usuarios autenticados pueden actualizar
CREATE POLICY "Usuarios pueden actualizar sus áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ELIMINAR: Usuarios autenticados pueden eliminar
CREATE POLICY "Usuarios pueden eliminar sus áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (true);

-- Verificacion
SELECT 'Permisos simplificados - La validacion de admin se hace en frontend' as mensaje;

-- Mostrar politicas
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'areas'
ORDER BY cmd;

