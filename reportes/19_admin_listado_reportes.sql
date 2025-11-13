-- ===================================================================
-- FUNCIÓN ADMIN: LISTADO COMPLETO DE REPORTES DE ACCIDENTES
-- ===================================================================
-- Descripción: Devuelve todos los reportes con información completa
--              para el panel de administración
-- Uso: SELECT * FROM admin_listado_reportes_accidentes()
-- ===================================================================

CREATE OR REPLACE FUNCTION public.admin_listado_reportes_accidentes()
RETURNS TABLE (
  id UUID,
  vehiculo_matricula VARCHAR,
  vehiculo_marca VARCHAR,
  vehiculo_modelo VARCHAR,
  propietario_nombre VARCHAR,
  propietario_email VARCHAR,
  testigo_nombre VARCHAR,
  testigo_email VARCHAR,
  testigo_telefono VARCHAR,
  fecha_accidente TIMESTAMPTZ,
  ubicacion_lat DECIMAL,
  ubicacion_lng DECIMAL,
  ubicacion_descripcion TEXT,
  descripcion TEXT,
  tipo_dano TEXT,
  leido BOOLEAN,
  cerrado BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    v.matricula as vehiculo_matricula,
    v.marca as vehiculo_marca,
    v.modelo as vehiculo_modelo,
    COALESCE(u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'full_name', u.email) as propietario_nombre,
    u.email as propietario_email,
    r.testigo_nombre,
    r.testigo_email,
    r.testigo_telefono,
    r.fecha_accidente,
    r.ubicacion_lat,
    r.ubicacion_lng,
    r.ubicacion_descripcion,
    r.descripcion,
    r.tipo_dano,
    r.leido,
    r.cerrado,
    r.created_at
  FROM public.reportes_accidentes r
  INNER JOIN public.vehiculos_registrados v ON r.vehiculo_afectado_id = v.id
  INNER JOIN auth.users u ON v.user_id = u.id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.admin_listado_reportes_accidentes() IS 'Devuelve todos los reportes de accidentes con información completa para el panel de administración';

-- ===================================================================
-- PERMISOS
-- ===================================================================
-- Solo administradores pueden ejecutar esta función
-- (se controla a nivel de aplicación verificando user_metadata.is_admin)
-- ===================================================================

