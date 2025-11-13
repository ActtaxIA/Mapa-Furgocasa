-- ===================================================================
-- DIAGNÓSTICO Y LIMPIEZA COMPLETA DE RLS - reportes_accidentes
-- ===================================================================
-- PROBLEMA: Usuarios anónimos no pueden insertar reportes
-- CAUSA: Puede haber múltiples políticas conflictivas
-- ===================================================================

-- ===================================================================
-- PASO 1: VER TODAS LAS POLÍTICAS ACTUALES
-- ===================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive, -- PERMISSIVE o RESTRICTIVE
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reportes_accidentes'
ORDER BY cmd, policyname;

-- ===================================================================
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS DE INSERT
-- ===================================================================

-- Eliminar cualquier política que pueda estar bloqueando
DROP POLICY IF EXISTS "Permitir crear reportes públicos" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Permitir crear reportes" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Crear reportes públicos" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "anon can insert reportes" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Usuarios pueden crear reportes" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Public can insert reportes" ON public.reportes_accidentes;

-- ===================================================================
-- PASO 3: DESACTIVAR TEMPORALMENTE RLS (para diagnóstico)
-- ===================================================================

-- IMPORTANTE: Esto es TEMPORAL solo para verificar que el resto funciona
ALTER TABLE public.reportes_accidentes DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '⚠️  RLS DESACTIVADO TEMPORALMENTE para pruebas';
RAISE NOTICE '✅ Intenta crear un reporte ahora';
RAISE NOTICE '📝 Si funciona, el problema era definitivamente RLS';
RAISE NOTICE '';
RAISE NOTICE 'Después de confirmar, ejecuta la PARTE 2 de este script';

-- ===================================================================
-- PARTE 2: REACTIVAR RLS CON POLÍTICAS CORRECTAS
-- ===================================================================
-- EJECUTAR ESTO DESPUÉS DE CONFIRMAR QUE FUNCIONA SIN RLS

/*
-- Reactivar RLS
ALTER TABLE public.reportes_accidentes ENABLE ROW LEVEL SECURITY;

-- Crear SOLO las políticas necesarias

-- 1. INSERT: Cualquiera puede crear reportes (PÚBLICO)
CREATE POLICY "Public can insert reports"
  ON public.reportes_accidentes
  FOR INSERT
  TO public  -- IMPORTANTE: 'public' incluye anon y authenticated
  WITH CHECK (true);

-- 2. SELECT: Solo propietarios ven sus reportes
CREATE POLICY "Owners can view their reports"
  ON public.reportes_accidentes
  FOR SELECT
  TO authenticated
  USING (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  );

-- 3. UPDATE: Solo propietarios actualizan sus reportes
CREATE POLICY "Owners can update their reports"
  ON public.reportes_accidentes
  FOR UPDATE
  TO authenticated
  USING (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  );

-- 4. DELETE: Solo propietarios eliminan sus reportes
CREATE POLICY "Owners can delete their reports"
  ON public.reportes_accidentes
  FOR DELETE
  TO authenticated
  USING (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  );

-- Verificar políticas finales
SELECT
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'reportes_accidentes'
ORDER BY cmd;

RAISE NOTICE '✅ RLS reactivado con políticas correctas';
*/
