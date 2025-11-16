-- =====================================================
-- FIX: Políticas RLS para DELETE en valoracion_ia_informes
-- =====================================================
-- Permite a los usuarios eliminar sus propias valoraciones IA
-- =====================================================

-- 1. Verificar si existe política de DELETE y eliminarla si existe
DROP POLICY IF EXISTS "Users can delete their own AI valuations" ON valoracion_ia_informes;
DROP POLICY IF EXISTS "Users can delete own valuations" ON valoracion_ia_informes;

-- 2. Crear nueva política de DELETE
CREATE POLICY "Users can delete their own AI valuations"
ON valoracion_ia_informes
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

-- 3. Verificar que RLS esté habilitado
ALTER TABLE valoracion_ia_informes ENABLE ROW LEVEL SECURITY;

-- 4. Verificar políticas existentes (SELECT, INSERT, UPDATE)
-- Si no existen, crearlas

DO $$
BEGIN
  -- Política SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'valoracion_ia_informes' 
    AND policyname = 'Users can view their own AI valuations'
  ) THEN
    CREATE POLICY "Users can view their own AI valuations"
    ON valoracion_ia_informes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- Política INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'valoracion_ia_informes' 
    AND policyname = 'Users can insert their own AI valuations'
  ) THEN
    CREATE POLICY "Users can insert their own AI valuations"
    ON valoracion_ia_informes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Política UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'valoracion_ia_informes' 
    AND policyname = 'Users can update their own AI valuations'
  ) THEN
    CREATE POLICY "Users can update their own AI valuations"
    ON valoracion_ia_informes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

