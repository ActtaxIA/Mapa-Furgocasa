-- =====================================================
-- FIX: Corregir políticas RLS de valoracion_ia_informes
-- Problema: Políticas intentan acceder a tabla 'users' inexistente
-- Solución: Eliminar todas las políticas y crear solo las básicas
-- =====================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES (por si acaso hay alguna problemática)
-- IMPORTANTE: Eliminar la política "Admins can view all valoraciones" que intenta acceder a auth.users
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Users can view own valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Los usuarios pueden crear valoraciones de sus vehículos" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Usuarios pueden crear valoraciones de sus vehículos" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Users can insert own valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Los admins pueden ver todas las valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Admins pueden ver todas las valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Admins can view all valoraciones" ON valoracion_ia_informes; -- ⚠️ ESTA ES LA PROBLEMÁTICA
DROP POLICY IF EXISTS "Cualquiera puede ver valoraciones" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "policy_valoracion_select_own" ON valoracion_ia_informes; -- Eliminar duplicados
DROP POLICY IF EXISTS "policy_valoracion_insert_own" ON valoracion_ia_informes; -- Eliminar duplicados

-- 2. CREAR SOLO POLÍTICAS SIMPLES QUE NO ACCEDAN A OTRAS TABLAS
-- Política para SELECT: usuarios solo ven sus propias valoraciones
CREATE POLICY "policy_valoracion_select_own"
  ON valoracion_ia_informes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT: usuarios solo pueden crear valoraciones para sus vehículos
CREATE POLICY "policy_valoracion_insert_own"
  ON valoracion_ia_informes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
-- (Esto es solo informativo, no afecta el funcionamiento)
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
WHERE tablename = 'valoracion_ia_informes';

-- ✅ COMPLETADO
