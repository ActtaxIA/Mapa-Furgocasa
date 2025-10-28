-- ===================================================================
-- FIX V2: Permisos de admin SIN consultar auth.users
-- ===================================================================
-- Usamos el JWT directamente en lugar de consultar auth.users
-- ===================================================================

-- Eliminar politicas actuales
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear áreas" ON public.areas;

-- CREAR: Solo admins (usando JWT directamente)
CREATE POLICY "Usuarios autenticados pueden crear áreas"
  ON public.areas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    OR
    (auth.jwt()->>'is_admin')::boolean = true
  );

-- ACTUALIZAR: Creador O admin (usando JWT directamente)
CREATE POLICY "Usuarios pueden actualizar sus áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    (auth.jwt()->>'is_admin')::boolean = true
  )
  WITH CHECK (
    auth.uid() = created_by
    OR
    (auth.jwt()->>'is_admin')::boolean = true
  );

-- ELIMINAR: Creador O admin (usando JWT directamente)
CREATE POLICY "Usuarios pueden eliminar sus áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    (auth.jwt()->>'is_admin')::boolean = true
  );

-- Verificacion
SELECT 'Permisos de admin configurados con JWT' as mensaje;

-- Mostrar politicas
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'areas'
ORDER BY cmd;

