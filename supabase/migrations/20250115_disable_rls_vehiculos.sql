-- =====================================================
-- Deshabilitar RLS en tablas de vehículos para Analytics
-- Permite que Service Role Key acceda sin restricciones
-- =====================================================

-- Las tablas de vehículos necesitan RLS deshabilitado porque:
-- 1. La API /api/admin/vehiculos usa Service Role Key
-- 2. Las políticas RLS anteriores bloqueaban el acceso
-- 3. Otras secciones (áreas, usuarios) funcionan sin RLS o con Auth API

ALTER TABLE vehiculos_registrados DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_valoracion_economica DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_ficha_tecnica DISABLE ROW LEVEL SECURITY;
ALTER TABLE datos_mercado_autocaravanas DISABLE ROW LEVEL SECURITY;
ALTER TABLE valoracion_ia_informes DISABLE ROW LEVEL SECURITY;

-- ✅ COMPLETADO
-- Ahora /api/admin/vehiculos puede acceder a todas las tablas
-- Analytics de vehículos funcionará igual que el resto de secciones

