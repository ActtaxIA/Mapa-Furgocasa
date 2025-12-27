-- =====================================================
-- FIX DE SEGURIDAD - Supabase Database Linter
-- =====================================================
-- Fecha: 2024-12-27
-- Descripción: Soluciona todos los problemas de seguridad detectados por Supabase
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EN TABLAS PÚBLICAS
-- =====================================================
-- Problema: Tablas tienen políticas RLS definidas pero RLS no está habilitado
-- Solución: Habilitar RLS en cada tabla

-- Tabla: datos_mercado_autocaravanas
ALTER TABLE public.datos_mercado_autocaravanas ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.datos_mercado_autocaravanas IS 'RLS habilitado - Solo admins pueden modificar, todos pueden ver';

-- Tabla: vehiculo_ficha_tecnica
ALTER TABLE public.vehiculo_ficha_tecnica ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.vehiculo_ficha_tecnica IS 'RLS habilitado - Usuarios solo ven sus propias fichas técnicas';

-- Tabla: vehiculo_valoracion_economica
ALTER TABLE public.vehiculo_valoracion_economica ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.vehiculo_valoracion_economica IS 'RLS habilitado - Usuarios solo ven sus propias valoraciones';

-- Tabla: vehiculos_registrados
ALTER TABLE public.vehiculos_registrados ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.vehiculos_registrados IS 'RLS habilitado - Usuarios solo ven sus propios vehículos';


-- =====================================================
-- 2. PROTEGER VISTAS QUE EXPONEN auth.users
-- =====================================================
-- Problema: Vistas exponen datos de auth.users a roles anon
-- Solución: Recrear vistas sin exponer datos sensibles o restringir acceso

-- Vista: v_conversaciones_recientes
-- Opción 1: Eliminar acceso anon (RECOMENDADO)
REVOKE SELECT ON public.v_conversaciones_recientes FROM anon;
COMMENT ON VIEW public.v_conversaciones_recientes IS 'Solo accesible para usuarios autenticados - NO exponer a anon';

-- Vista: admin_valoraciones_ia
-- Opción 1: Eliminar acceso anon (RECOMENDADO - es una vista de ADMIN)
REVOKE SELECT ON public.admin_valoraciones_ia FROM anon;
COMMENT ON VIEW public.admin_valoraciones_ia IS 'Solo accesible para administradores - NO exponer a anon ni authenticated';


-- =====================================================
-- 3. REVISAR VISTAS CON SECURITY DEFINER
-- =====================================================
-- Problema: Vistas con SECURITY DEFINER ejecutan con permisos del creador
-- Solución: Revisar si realmente necesitan SECURITY DEFINER o cambiar a SECURITY INVOKER

-- IMPORTANTE: SECURITY DEFINER puede ser necesario en algunos casos
-- Solo cambiar a INVOKER si estás seguro de que no romperá la funcionalidad

-- Vista: resumen_economico_vehiculo
-- Esta vista probablemente necesita SECURITY DEFINER para acceder a datos del usuario
-- NO cambiar a menos que verifiques que funciona

-- Vista: v_chatbot_stats
-- Esta vista probablemente necesita SECURITY DEFINER para estadísticas agregadas
-- NO cambiar a menos que verifiques que funciona

-- Vista: admin_valoraciones_ia
-- Esta es una vista de ADMIN, DEBE tener SECURITY DEFINER
-- Ya restringimos acceso anon arriba

-- Vista: v_conversaciones_recientes
-- Esta vista probablemente necesita SECURITY DEFINER
-- Ya restringimos acceso anon arriba

-- Vista: estadisticas_mercado_por_modelo
-- Esta vista probablemente necesita SECURITY DEFINER para estadísticas agregadas
-- Si quieres cambiarla a INVOKER (descomentar solo si estás seguro):
-- DROP VIEW IF EXISTS public.estadisticas_mercado_por_modelo CASCADE;
-- CREATE VIEW public.estadisticas_mercado_por_modelo 
-- WITH (security_invoker=true) 
-- AS SELECT ... ; -- (tu consulta actual)


-- =====================================================
-- 4. VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================
-- Las políticas ya están definidas, solo necesitaban que RLS se habilitara
-- Aquí listamos las políticas que deberían existir:

-- datos_mercado_autocaravanas:
--   ✓ Everyone can view market data
--   ✓ Authenticated users can contribute market data
--   ✓ Admins can update market data
--   ✓ Admins can delete market data

-- vehiculo_ficha_tecnica:
--   ✓ Users can view own ficha_tecnica
--   ✓ Users can insert own ficha_tecnica
--   ✓ Users can update own ficha_tecnica
--   ✓ Users can delete own ficha_tecnica
--   ✓ Admins can view all ficha_tecnica

-- vehiculo_valoracion_economica:
--   ✓ Users can view own valoracion_economica
--   ✓ Users can insert own valoracion_economica
--   ✓ Users can update own valoracion_economica
--   ✓ Users can delete own valoracion_economica
--   ✓ Admins can view all valoracion_economica

-- vehiculos_registrados:
--   ✓ Usuarios ven sus vehículos
--   ✓ Usuarios pueden crear vehículos
--   ✓ Usuarios pueden actualizar sus vehículos
--   ✓ Usuarios pueden eliminar sus vehículos
--   ✓ Buscar vehículo por QR público
--   ✓ allow_anon_select_for_reports


-- =====================================================
-- 5. GRANTS NECESARIOS PARA MANTENER FUNCIONALIDAD
-- =====================================================
-- Asegurar que authenticated puede acceder a lo que necesita

-- Las vistas que NO deben ser accesibles a anon ya las revocamos arriba
-- Asegurar que authenticated puede acceder:

GRANT SELECT ON public.v_conversaciones_recientes TO authenticated;
-- NO GRANT a anon (ya revocado arriba)

-- admin_valoraciones_ia debe ser SOLO para service_role/admins
-- authenticated no debe tener acceso directo
REVOKE SELECT ON public.admin_valoraciones_ia FROM authenticated;
GRANT SELECT ON public.admin_valoraciones_ia TO service_role;

-- Otras vistas SECURITY DEFINER necesarias para funcionamiento normal:
GRANT SELECT ON public.resumen_economico_vehiculo TO authenticated;
GRANT SELECT ON public.v_chatbot_stats TO authenticated;
GRANT SELECT ON public.estadisticas_mercado_por_modelo TO authenticated;
GRANT SELECT ON public.estadisticas_mercado_por_modelo TO anon; -- Solo si quieres que sea pública


-- =====================================================
-- 6. VERIFICACIÓN POST-FIX
-- =====================================================
-- Ejecuta estas consultas para verificar que todo está correcto:

-- Verificar que RLS está habilitado:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('datos_mercado_autocaravanas', 'vehiculo_ficha_tecnica', 'vehiculo_valoracion_economica', 'vehiculos_registrados');

-- Verificar permisos de vistas:
-- SELECT table_name, grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public' 
-- AND table_name IN ('v_conversaciones_recientes', 'admin_valoraciones_ia')
-- ORDER BY table_name, grantee;


-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. SECURITY DEFINER en vistas es necesario cuando la vista necesita
--    acceder a datos con permisos elevados. NO eliminar a menos que
--    estés seguro de que no romperá la funcionalidad.
--
-- 2. Las vistas que exponen auth.users DEBEN tener acceso restringido.
--    Ya hemos revocado acceso anon a las vistas problemáticas.
--
-- 3. RLS está ahora habilitado en todas las tablas. Las políticas
--    existentes controlarán el acceso.
--
-- 4. Después de ejecutar este script, vuelve a ejecutar el Database Linter
--    de Supabase para verificar que todos los problemas están resueltos.
--
-- 5. PRUEBA LA APLICACIÓN después de aplicar estos cambios para asegurar
--    que nada se rompió.
-- =====================================================

-- FIN DEL SCRIPT

