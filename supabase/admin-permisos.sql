-- ===================================================================
-- PERMISOS DE ADMIN - Solo editar y borrar
-- ===================================================================
-- NO se toca la visibilidad de areas (sigue igual)
-- Solo se añaden permisos de admin para editar y borrar TODAS las areas
-- ===================================================================

-- Eliminar las politicas restrictivas de UPDATE y DELETE
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus áreas" ON public.areas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus áreas" ON public.areas;

-- Nueva politica UPDATE: El creador O el admin pueden actualizar
CREATE POLICY "Usuarios pueden actualizar sus áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Nueva politica DELETE: El creador O el admin pueden eliminar
CREATE POLICY "Usuarios pueden eliminar sus áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Verificacion
SELECT 'Permisos de admin añadidos para editar y borrar' as mensaje;

-- Mostrar politicas (deberian ser 4: SELECT, INSERT, UPDATE, DELETE)
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'areas'
ORDER BY cmd;

