-- =====================================================
-- Admin RLS Policies para Analytics Dashboard
-- Permite a administradores ver todos los registros
-- =====================================================

-- 1. Política para vehiculos_registrados
CREATE POLICY "admin_view_all_vehiculos"
ON vehiculos_registrados
FOR SELECT
TO authenticated
USING (
  (SELECT (raw_user_meta_data->>'is_admin')::boolean
   FROM auth.users
   WHERE id = auth.uid()) = true
);

-- 2. Política para vehiculo_valoracion_economica
CREATE POLICY "admin_view_all_valoraciones"
ON vehiculo_valoracion_economica
FOR SELECT
TO authenticated
USING (
  (SELECT (raw_user_meta_data->>'is_admin')::boolean
   FROM auth.users
   WHERE id = auth.uid()) = true
);

-- 3. Política para vehiculo_ficha_tecnica
CREATE POLICY "admin_view_all_fichas"
ON vehiculo_ficha_tecnica
FOR SELECT
TO authenticated
USING (
  (SELECT (raw_user_meta_data->>'is_admin')::boolean
   FROM auth.users
   WHERE id = auth.uid()) = true
);

-- 4. Política para datos_mercado_autocaravanas
CREATE POLICY "admin_view_all_mercado"
ON datos_mercado_autocaravanas
FOR SELECT
TO authenticated
USING (
  (SELECT (raw_user_meta_data->>'is_admin')::boolean
   FROM auth.users
   WHERE id = auth.uid()) = true
);

-- 5. Política para valoracion_ia_informes
CREATE POLICY "admin_view_all_ia_informes"
ON valoracion_ia_informes
FOR SELECT
TO authenticated
USING (
  (SELECT (raw_user_meta_data->>'is_admin')::boolean
   FROM auth.users
   WHERE id = auth.uid()) = true
);

-- ✅ COMPLETADO
