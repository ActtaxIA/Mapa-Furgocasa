-- ===================================================================
-- ARREGLAR POLÍTICAS RLS PARA PRODUCCIÓN
-- ===================================================================
-- Este script arregla los permisos de RLS que pueden estar
-- bloqueando las APIs en producción
-- ===================================================================

-- 1. VERIFICAR POLÍTICAS ACTUALES DE ia_config
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'ia_config';

-- 2. PERMITIR ACCESO DE SERVICE_ROLE A ia_config
-- Las APIs usan SUPABASE_SERVICE_ROLE_KEY, así que necesitan acceso completo

DROP POLICY IF EXISTS "Service role puede leer ia_config" ON public.ia_config;
DROP POLICY IF EXISTS "Service role puede actualizar ia_config" ON public.ia_config;

-- Política para permitir lectura con service_role
CREATE POLICY "Service role puede leer ia_config"
  ON public.ia_config FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir actualización con service_role  
CREATE POLICY "Service role puede actualizar ia_config"
  ON public.ia_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. VERIFICAR POLÍTICAS DE areas (por si acaso)
-- Las APIs de IA necesitan leer áreas

DROP POLICY IF EXISTS "Todos pueden ver areas activas" ON public.areas;

CREATE POLICY "Todos pueden ver areas activas"
  ON public.areas FOR SELECT
  USING (activo = true OR auth.role() = 'service_role');

-- Política para permitir actualización desde las APIs de admin
DROP POLICY IF EXISTS "Service role puede actualizar areas" ON public.areas;

CREATE POLICY "Service role puede actualizar areas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. VERIFICAR QUE LAS TABLAS TENGAN RLS HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('areas', 'ia_config')
ORDER BY tablename;

-- 5. VERIFICAR PERMISOS DE ROLES
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('areas', 'ia_config')
ORDER BY table_name, grantee;

-- ===================================================================
-- NOTA IMPORTANTE:
-- ===================================================================
-- Las APIs usan createClient con SUPABASE_SERVICE_ROLE_KEY
-- Esta key tiene role 'service_role' que bypasea RLS normalmente
-- 
-- Si esto no funciona, el problema puede ser que las políticas
-- están siendo muy estrictas con usuarios autenticados
-- ===================================================================

