-- ===================================================================
-- FIX DEFINITIVO: RLS para reportes públicos
-- ===================================================================
-- Este script SOLUCIONA el problema de RLS de forma definitiva
-- ===================================================================

-- PASO 1: Eliminar TODAS las políticas de INSERT (incluyendo la que vamos a crear)
DROP POLICY IF EXISTS "Permitir crear reportes públicos" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Anon can insert reports" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Authenticated can insert reports" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "Public can insert reports" ON public.reportes_accidentes;
DROP POLICY IF EXISTS "allow_public_insert_reports" ON public.reportes_accidentes;

-- PASO 2: Crear UNA política simple que funcione
-- Usar 'public' que incluye TODOS los roles (anon, authenticated, service_role)
CREATE POLICY "allow_public_insert_reports"
  ON public.reportes_accidentes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- PASO 3: Verificar que se creó
SELECT
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'reportes_accidentes'
AND cmd = 'INSERT';

-- RESULTADO ESPERADO:
-- policyname: "allow_public_insert_reports"
-- roles: {public}
-- cmd: INSERT
-- with_check: true
