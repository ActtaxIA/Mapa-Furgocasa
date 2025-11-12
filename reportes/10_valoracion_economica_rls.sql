-- =====================================================
-- ROW LEVEL SECURITY - VALORACIÓN ECONÓMICA
-- =====================================================

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE vehiculo_valoracion_economica ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_mercado_autocaravanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precios_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_adicionales ENABLE ROW LEVEL SECURITY;


-- ============================================
-- POLÍTICAS: vehiculo_valoracion_economica
-- ============================================

-- SELECT: Solo propios datos
CREATE POLICY "Users can view own valoracion_economica"
  ON vehiculo_valoracion_economica
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Solo para propios vehículos
CREATE POLICY "Users can insert own valoracion_economica"
  ON vehiculo_valoracion_economica
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo propios datos
CREATE POLICY "Users can update own valoracion_economica"
  ON vehiculo_valoracion_economica
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Solo propios datos
CREATE POLICY "Users can delete own valoracion_economica"
  ON vehiculo_valoracion_economica
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS: datos_mercado_autocaravanas
-- ============================================

-- SELECT: TODOS pueden ver (datos anónimos para valoraciones)
CREATE POLICY "Everyone can view market data"
  ON datos_mercado_autocaravanas
  FOR SELECT
  USING (true); -- Datos públicos y anónimos

-- INSERT: Solo usuarios autenticados (contribución anónima)
CREATE POLICY "Authenticated users can contribute market data"
  ON datos_mercado_autocaravanas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Solo admins (para verificar datos)
CREATE POLICY "Admins can update market data"
  ON datos_mercado_autocaravanas
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: Solo admins (para eliminar datos erróneos)
CREATE POLICY "Admins can delete market data"
  ON datos_mercado_autocaravanas
  FOR DELETE
  USING (is_admin());


-- ============================================
-- POLÍTICAS: historico_precios_usuario
-- ============================================

-- SELECT: Solo propios datos
CREATE POLICY "Users can view own historico_precios"
  ON historico_precios_usuario
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Solo para propios vehículos
CREATE POLICY "Users can insert own historico_precios"
  ON historico_precios_usuario
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo propios datos
CREATE POLICY "Users can update own historico_precios"
  ON historico_precios_usuario
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Solo propios datos
CREATE POLICY "Users can delete own historico_precios"
  ON historico_precios_usuario
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS: gastos_adicionales
-- ============================================

-- SELECT: Solo propios datos
CREATE POLICY "Users can view own gastos_adicionales"
  ON gastos_adicionales
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Solo para propios vehículos
CREATE POLICY "Users can insert own gastos_adicionales"
  ON gastos_adicionales
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo propios datos
CREATE POLICY "Users can update own gastos_adicionales"
  ON gastos_adicionales
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Solo propios datos
CREATE POLICY "Users can delete own gastos_adicionales"
  ON gastos_adicionales
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- POLÍTICAS DE ADMIN (todas las tablas)
-- ============================================

CREATE POLICY "Admins can view all valoracion_economica"
  ON vehiculo_valoracion_economica
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all historico_precios"
  ON historico_precios_usuario
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all gastos_adicionales"
  ON gastos_adicionales
  FOR SELECT
  USING (is_admin());


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS de valoración económica configurado correctamente:';
  RAISE NOTICE '   - vehiculo_valoracion_economica (privado)';
  RAISE NOTICE '   - datos_mercado_autocaravanas (público para SELECT, anónimo)';
  RAISE NOTICE '   - historico_precios_usuario (privado)';
  RAISE NOTICE '   - gastos_adicionales (privado)';
  RAISE NOTICE '   - Políticas de admin habilitadas';
END $$;
