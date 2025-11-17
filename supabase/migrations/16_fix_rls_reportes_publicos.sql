-- ===================================================================
-- FIX: Permitir reportes públicos - Arreglar RLS
-- ===================================================================
-- PROBLEMA: Row Level Security bloquea inserts de usuarios anónimos
-- ERROR: new row violates row-level security policy (42501)
-- SOLUCIÓN: Recrear política que permite INSERT público
-- ===================================================================
-- FECHA: 2025-11-13
-- VERSIÓN: 1.0
-- ===================================================================

-- ===================================================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES (si hay conflicto)
-- ===================================================================

DROP POLICY IF EXISTS "Permitir crear reportes públicos" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Permitir crear reportes" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Crear reportes públicos" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "anon can insert reportes" ON public.reportes_accidentes;

-- ===================================================================
-- 2. CREAR POLÍTICA CORRECTA
-- ===================================================================

-- CRÍTICO: Esta política permite que CUALQUIERA (anon o authenticated)
-- pueda crear reportes sin restricciones
CREATE POLICY "Permitir crear reportes públicos"
  ON public.reportes_accidentes 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ===================================================================
-- 3. VERIFICAR QUE RLS ESTÉ HABILITADO
-- ===================================================================

ALTER TABLE public.reportes_accidentes ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 4. VERIFICACIÓN
-- ===================================================================

-- Ver todas las políticas de la tabla
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
WHERE tablename = 'reportes_accidentes'
ORDER BY policyname;

-- ===================================================================
-- RESULTADO ESPERADO:
-- ===================================================================
-- Debe aparecer la política "Permitir crear reportes públicos"
-- con:
-- - cmd: INSERT
-- - roles: {anon, authenticated}  
-- - with_check: true
-- ===================================================================

RAISE NOTICE '✅ Política RLS corregida - reportes públicos permitidos';
RAISE NOTICE '⚠️  Verifica que aparezca la política en el resultado de arriba';

