-- ===================================================================
-- SISTEMA DE ALERTAS DE ACCIDENTES - FUNCIONES AUXILIARES
-- ===================================================================
-- Ejecutar en: Supabase SQL Editor
-- Descripción: Funciones útiles para consultas y estadísticas
-- Orden: 4/4
-- IMPORTANTE: Ejecutar DESPUÉS de 03_configurar_rls.sql
-- ===================================================================

-- ===================================================================
-- FUNCIÓN: Obtener estadísticas de vehículo
-- ===================================================================

CREATE OR REPLACE FUNCTION public.estadisticas_vehiculo(vehiculo_uuid UUID)
RETURNS TABLE (
  total_reportes BIGINT,
  reportes_pendientes BIGINT,
  reportes_cerrados BIGINT,
  ultimo_reporte TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_reportes,
    COUNT(*) FILTER (WHERE cerrado = false)::BIGINT as reportes_pendientes,
    COUNT(*) FILTER (WHERE cerrado = true)::BIGINT as reportes_cerrados,
    MAX(fecha_accidente) as ultimo_reporte
  FROM public.reportes_accidentes
  WHERE vehiculo_afectado_id = vehiculo_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.estadisticas_vehiculo(UUID) IS 'Obtiene estadísticas de reportes para un vehículo específico';

-- ===================================================================
-- FUNCIÓN: Obtener reportes no leídos de un usuario
-- ===================================================================

CREATE OR REPLACE FUNCTION public.contar_reportes_no_leidos(usuario_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total
  FROM public.reportes_accidentes r
  INNER JOIN public.vehiculos_registrados v ON r.vehiculo_afectado_id = v.id
  WHERE v.user_id = usuario_uuid AND r.leido = false;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.contar_reportes_no_leidos(UUID) IS 'Cuenta los reportes no leídos de todos los vehículos de un usuario';

-- ===================================================================
-- FUNCIÓN: Buscar vehículo por QR (para página pública)
-- ===================================================================

CREATE OR REPLACE FUNCTION public.buscar_vehiculo_por_qr(qr_id VARCHAR)
RETURNS TABLE (
  vehiculo_id UUID,
  matricula VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  color VARCHAR,
  foto_url TEXT,
  existe BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id as vehiculo_id,
    v.matricula,
    v.marca,
    v.modelo,
    v.color,
    v.foto_url,
    true as existe
  FROM public.vehiculos_registrados v
  WHERE v.qr_code_id = qr_id AND v.activo = true
  LIMIT 1;

  -- Si no encuentra nada, retornar fila con existe = false
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      NULL::UUID as vehiculo_id,
      NULL::VARCHAR as matricula,
      NULL::VARCHAR as marca,
      NULL::VARCHAR as modelo,
      NULL::VARCHAR as color,
      NULL::TEXT as foto_url,
      false as existe;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.buscar_vehiculo_por_qr(VARCHAR) IS 'Busca un vehículo por su QR ID para la página pública de reportes';

-- ===================================================================
-- FUNCIÓN: Obtener todos los reportes de un usuario
-- ===================================================================

CREATE OR REPLACE FUNCTION public.obtener_reportes_usuario(usuario_uuid UUID)
RETURNS TABLE (
  reporte_id UUID,
  vehiculo_id UUID,
  vehiculo_matricula VARCHAR,
  vehiculo_marca VARCHAR,
  vehiculo_modelo VARCHAR,
  matricula_tercero VARCHAR,
  testigo_nombre VARCHAR,
  testigo_email VARCHAR,
  testigo_telefono VARCHAR,
  descripcion TEXT,
  tipo_dano TEXT,
  ubicacion_lat DECIMAL,
  ubicacion_lng DECIMAL,
  ubicacion_direccion TEXT,
  fotos_urls TEXT[],
  fecha_accidente TIMESTAMPTZ,
  leido BOOLEAN,
  cerrado BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as reporte_id,
    v.id as vehiculo_id,
    v.matricula as vehiculo_matricula,
    v.marca as vehiculo_marca,
    v.modelo as vehiculo_modelo,
    r.matricula_tercero,
    r.testigo_nombre,
    r.testigo_email,
    r.testigo_telefono,
    r.descripcion,
    r.tipo_dano,
    r.ubicacion_lat,
    r.ubicacion_lng,
    r.ubicacion_direccion,
    r.fotos_urls,
    r.fecha_accidente,
    r.leido,
    r.cerrado,
    r.created_at
  FROM public.reportes_accidentes r
  INNER JOIN public.vehiculos_registrados v ON r.vehiculo_afectado_id = v.id
  WHERE v.user_id = usuario_uuid
  ORDER BY r.fecha_accidente DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_reportes_usuario(UUID) IS 'Obtiene todos los reportes de todos los vehículos de un usuario con información completa';

-- ===================================================================
-- FUNCIÓN: Marcar reporte como leído
-- ===================================================================

CREATE OR REPLACE FUNCTION public.marcar_reporte_leido(reporte_uuid UUID, usuario_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  es_propietario BOOLEAN;
BEGIN
  -- Verificar que el usuario es el propietario del vehículo
  SELECT EXISTS(
    SELECT 1
    FROM public.reportes_accidentes r
    INNER JOIN public.vehiculos_registrados v ON r.vehiculo_afectado_id = v.id
    WHERE r.id = reporte_uuid AND v.user_id = usuario_uuid
  ) INTO es_propietario;

  IF es_propietario THEN
    UPDATE public.reportes_accidentes
    SET leido = true
    WHERE id = reporte_uuid;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.marcar_reporte_leido(UUID, UUID) IS 'Marca un reporte como leído si el usuario es el propietario del vehículo';

-- ===================================================================
-- FUNCIÓN: Cerrar reporte (marcar como resuelto)
-- ===================================================================

CREATE OR REPLACE FUNCTION public.cerrar_reporte(
  reporte_uuid UUID,
  usuario_uuid UUID,
  notas TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  es_propietario BOOLEAN;
BEGIN
  -- Verificar que el usuario es el propietario del vehículo
  SELECT EXISTS(
    SELECT 1
    FROM public.reportes_accidentes r
    INNER JOIN public.vehiculos_registrados v ON r.vehiculo_afectado_id = v.id
    WHERE r.id = reporte_uuid AND v.user_id = usuario_uuid
  ) INTO es_propietario;

  IF es_propietario THEN
    UPDATE public.reportes_accidentes
    SET
      cerrado = true,
      leido = true, -- También marcarlo como leído
      notas_propietario = COALESCE(notas, notas_propietario)
    WHERE id = reporte_uuid;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cerrar_reporte(UUID, UUID, TEXT) IS 'Marca un reporte como cerrado/resuelto si el usuario es el propietario';

-- ===================================================================
-- FUNCIÓN: Generar QR ID único
-- ===================================================================

CREATE OR REPLACE FUNCTION public.generar_qr_id()
RETURNS VARCHAR AS $$
DECLARE
  nuevo_qr_id VARCHAR(50);
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar ID único: qr-{8 caracteres aleatorios}
    nuevo_qr_id := 'qr-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12);

    -- Verificar si ya existe
    SELECT EXISTS(
      SELECT 1 FROM public.vehiculos_registrados
      WHERE qr_code_id = nuevo_qr_id
    ) INTO existe;

    -- Si no existe, salir del loop
    EXIT WHEN NOT existe;
  END LOOP;

  RETURN nuevo_qr_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generar_qr_id() IS 'Genera un QR ID único para un vehículo nuevo';

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================

SELECT 'Funciones auxiliares creadas correctamente!' as mensaje;

-- ===================================================================
-- TESTS OPCIONALES (descomentar para probar)
-- ===================================================================

/*
-- Test 1: Generar QR ID único
SELECT public.generar_qr_id();
SELECT public.generar_qr_id();
SELECT public.generar_qr_id();

-- Test 2: Buscar vehículo por QR (debería retornar existe = false)
SELECT * FROM public.buscar_vehiculo_por_qr('qr-test-123');

-- Test 3: Contar reportes no leídos (debería retornar 0 si no hay datos)
-- Reemplazar 'TU-USER-UUID' con un UUID real de tu tabla auth.users
SELECT public.contar_reportes_no_leidos('TU-USER-UUID');
*/
