-- =====================================================
-- ROW LEVEL SECURITY (RLS) - GESTIÓN DE VEHÍCULOS
-- =====================================================
-- Este script configura las políticas de seguridad para
-- que los usuarios solo puedan ver y modificar sus propios
-- datos de gestión de vehículos
-- =====================================================

-- ============================================
-- HABILITAR RLS en todas las tablas
-- ============================================

ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE averias ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_mejoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_kilometraje ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_ficha_tecnica ENABLE ROW LEVEL SECURITY;


-- ============================================
-- POLÍTICAS PARA: mantenimientos
-- ============================================

-- Permitir SELECT de propios mantenimientos
CREATE POLICY "Users can view own mantenimientos"
  ON mantenimientos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir INSERT de propios mantenimientos
CREATE POLICY "Users can insert own mantenimientos"
  ON mantenimientos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE de propios mantenimientos
CREATE POLICY "Users can update own mantenimientos"
  ON mantenimientos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE de propios mantenimientos
CREATE POLICY "Users can delete own mantenimientos"
  ON mantenimientos
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS PARA: averias
-- ============================================

-- Permitir SELECT de propias averías
CREATE POLICY "Users can view own averias"
  ON averias
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir INSERT de propias averías
CREATE POLICY "Users can insert own averias"
  ON averias
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE de propias averías
CREATE POLICY "Users can update own averias"
  ON averias
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE de propias averías
CREATE POLICY "Users can delete own averias"
  ON averias
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS PARA: vehiculo_documentos
-- ============================================

-- Permitir SELECT de propios documentos
CREATE POLICY "Users can view own documentos"
  ON vehiculo_documentos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir INSERT de propios documentos
CREATE POLICY "Users can insert own documentos"
  ON vehiculo_documentos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE de propios documentos
CREATE POLICY "Users can update own documentos"
  ON vehiculo_documentos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE de propios documentos
CREATE POLICY "Users can delete own documentos"
  ON vehiculo_documentos
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS PARA: vehiculo_mejoras
-- ============================================

-- Permitir SELECT de propias mejoras y mejoras públicas
CREATE POLICY "Users can view own mejoras and public mejoras"
  ON vehiculo_mejoras
  FOR SELECT
  USING (auth.uid() = user_id OR es_publica = true);

-- Permitir INSERT de propias mejoras
CREATE POLICY "Users can insert own mejoras"
  ON vehiculo_mejoras
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE de propias mejoras
CREATE POLICY "Users can update own mejoras"
  ON vehiculo_mejoras
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE de propias mejoras
CREATE POLICY "Users can delete own mejoras"
  ON vehiculo_mejoras
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS PARA: vehiculo_kilometraje
-- ============================================

-- Permitir SELECT de propio kilometraje
CREATE POLICY "Users can view own kilometraje"
  ON vehiculo_kilometraje
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir INSERT de propio kilometraje
CREATE POLICY "Users can insert own kilometraje"
  ON vehiculo_kilometraje
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE de propio kilometraje
CREATE POLICY "Users can update own kilometraje"
  ON vehiculo_kilometraje
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE de propio kilometraje
CREATE POLICY "Users can delete own kilometraje"
  ON vehiculo_kilometraje
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS PARA: vehiculo_ficha_tecnica
-- ============================================

-- Permitir SELECT de propia ficha técnica
CREATE POLICY "Users can view own ficha_tecnica"
  ON vehiculo_ficha_tecnica
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir INSERT de propia ficha técnica
CREATE POLICY "Users can insert own ficha_tecnica"
  ON vehiculo_ficha_tecnica
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE de propia ficha técnica
CREATE POLICY "Users can update own ficha_tecnica"
  ON vehiculo_ficha_tecnica
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE de propia ficha técnica
CREATE POLICY "Users can delete own ficha_tecnica"
  ON vehiculo_ficha_tecnica
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS PARA ADMINISTRADORES (OPCIONAL)
-- ============================================
-- Los administradores pueden ver todo (solo SELECT)

-- Función helper para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de admin para cada tabla
CREATE POLICY "Admins can view all mantenimientos"
  ON mantenimientos
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all averias"
  ON averias
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all documentos"
  ON vehiculo_documentos
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all mejoras"
  ON vehiculo_mejoras
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all kilometraje"
  ON vehiculo_kilometraje
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all ficha_tecnica"
  ON vehiculo_ficha_tecnica
  FOR SELECT
  USING (is_admin());


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS configurado correctamente para todas las tablas:';
  RAISE NOTICE '   - mantenimientos';
  RAISE NOTICE '   - averias';
  RAISE NOTICE '   - vehiculo_documentos';
  RAISE NOTICE '   - vehiculo_mejoras (incluye acceso público a mejoras compartidas)';
  RAISE NOTICE '   - vehiculo_kilometraje';
  RAISE NOTICE '   - vehiculo_ficha_tecnica';
  RAISE NOTICE '   - Políticas de admin habilitadas';
END $$;
