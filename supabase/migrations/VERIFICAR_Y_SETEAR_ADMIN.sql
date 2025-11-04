-- ============================================
-- VERIFICAR Y CONFIGURAR USUARIO ADMIN
-- ============================================

-- 1. Ver tu usuario actual y verificar si es admin
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'is_admin' as is_admin_value,
  created_at
FROM auth.users
WHERE email = 'info@furgocasa.com';

-- 2. Si no eres admin, ejecuta esto para hacerte admin:
-- (Descomenta estas líneas después de verificar arriba)

/*
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"is_admin": "true"}'::jsonb
    ELSE raw_user_meta_data || '{"is_admin": "true"}'::jsonb
  END
WHERE email = 'info@furgocasa.com';
*/

-- 3. Verificación final
SELECT 
  email,
  raw_user_meta_data->>'is_admin' as es_admin,
  CASE 
    WHEN raw_user_meta_data->>'is_admin' = 'true' THEN '✅ Es admin'
    ELSE '❌ NO es admin'
  END as estado
FROM auth.users
WHERE email = 'info@furgocasa.com';

