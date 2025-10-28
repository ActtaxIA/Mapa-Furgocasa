-- ===================================================================
-- ROLLBACK COMPLETO - RESTAURAR POLITICAS ORIGINALES
-- ===================================================================
-- Este script elimina TODAS las politicas y restaura las ORIGINALES
-- tal como estaban en el schema inicial
-- ===================================================================

-- PASO 1: Eliminar TODAS las politicas que pudieran existir
DROP POLICY IF EXISTS "Áreas públicas y admins ven todas" ON public.areas;
DROP POLICY IF EXISTS "Áreas activas son públicas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios y admins pueden actualizar áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios y admins pueden eliminar áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Admins pueden ver áreas inactivas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear áreas" ON public.areas;
DROP POLICY IF EXISTS "Admins pueden crear areas" ON public.areas;
DROP POLICY IF EXISTS "Creadores y admins pueden actualizar" ON public.areas;
DROP POLICY IF EXISTS "Creadores y admins pueden eliminar" ON public.areas;
DROP POLICY IF EXISTS "Areas activas visibles para todos" ON public.areas;
DROP POLICY IF EXISTS "Admins ven areas inactivas" ON public.areas;
DROP POLICY IF EXISTS "Ver areas activas" ON public.areas;
DROP POLICY IF EXISTS "Admin crear areas" ON public.areas;
DROP POLICY IF EXISTS "Admin crear" ON public.areas;
DROP POLICY IF EXISTS "Admin actualizar areas" ON public.areas;
DROP POLICY IF EXISTS "Admin editar" ON public.areas;
DROP POLICY IF EXISTS "Admin eliminar areas" ON public.areas;
DROP POLICY IF EXISTS "Admin borrar" ON public.areas;

-- ===================================================================
-- PASO 2: RESTAURAR POLITICAS ORIGINALES DEL SCHEMA
-- ===================================================================

-- Todos pueden ver areas activas (ORIGINAL)
CREATE POLICY "Áreas activas son públicas"
  ON public.areas FOR SELECT
  USING (activo = true);

-- Solo usuarios autenticados pueden crear areas (ORIGINAL)
CREATE POLICY "Usuarios autenticados pueden crear áreas"
  ON public.areas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador puede actualizar sus areas (ORIGINAL)
CREATE POLICY "Usuarios pueden actualizar sus áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador puede eliminar sus areas (ORIGINAL)
CREATE POLICY "Usuarios pueden eliminar sus áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ===================================================================
-- VERIFICACION
-- ===================================================================

SELECT 'Rollback completo - Politicas originales restauradas' as mensaje;

-- Mostrar politicas activas
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'areas'
ORDER BY cmd, policyname;

