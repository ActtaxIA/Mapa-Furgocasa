-- ===================================================================
-- POLÍTICAS RLS ADMIN: visitas y user_interactions
-- ===================================================================
-- Permite a usuarios admin ver TODAS las visitas e interacciones
-- para el dashboard de analytics
-- ===================================================================

-- ===================================================================
-- TABLA: visitas
-- ===================================================================

-- Política admin para SELECT en visitas
CREATE POLICY "Admin puede ver todas las visitas"
  ON public.visitas FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ===================================================================
-- TABLA: user_interactions
-- ===================================================================

-- Política admin para SELECT en user_interactions
CREATE POLICY "Admin puede ver todas las interacciones"
  ON public.user_interactions FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ===================================================================
-- NOTAS:
-- ===================================================================
-- - Estas políticas se suman a las existentes (no las reemplazan)
-- - Los usuarios normales siguen viendo solo sus datos
-- - Los admin ven TODOS los datos de todos los usuarios
-- - Se verifica el role en raw_user_meta_data
-- ===================================================================
