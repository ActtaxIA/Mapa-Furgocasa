-- ============================================
-- FIX: Políticas RLS para chatbot_config
-- ============================================
-- Permite que admins lean y editen la configuración del chatbot
-- desde /admin/configuracion

-- 1. Habilitar RLS en la tabla (si no está habilitado)
ALTER TABLE chatbot_config ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Admins can read chatbot_config" ON chatbot_config;
DROP POLICY IF EXISTS "Admins can update chatbot_config" ON chatbot_config;
DROP POLICY IF EXISTS "Public can read active chatbot config" ON chatbot_config;

-- 3. POLÍTICA: Admins pueden leer toda la configuración
CREATE POLICY "Admins can read chatbot_config"
ON chatbot_config
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  )
);

-- 4. POLÍTICA: Admins pueden actualizar la configuración
CREATE POLICY "Admins can update chatbot_config"
ON chatbot_config
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  )
);

-- 5. POLÍTICA: El API puede leer la configuración activa (para el chatbot)
CREATE POLICY "Public can read active chatbot config"
ON chatbot_config
FOR SELECT
USING (activo = true);

-- 6. Verificación
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'chatbot_config'
ORDER BY policyname;

