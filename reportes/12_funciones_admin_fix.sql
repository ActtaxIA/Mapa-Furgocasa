-- =====================================================
-- FIX: Función admin_analisis_por_marca_modelo
-- =====================================================
-- Esta función corrige el problema de vehículos que no aparecen
-- cuando marca o modelo son NULL
-- =====================================================

CREATE OR REPLACE FUNCTION admin_analisis_por_marca_modelo()
RETURNS TABLE (
  marca VARCHAR,
  modelo VARCHAR,
  cantidad BIGINT,
  año_promedio DECIMAL,
  km_promedio DECIMAL,
  precio_compra_promedio DECIMAL,
  valor_actual_promedio DECIMAL,
  depreciacion_media DECIMAL,
  coste_mantenimiento_anual DECIMAL,
  coste_averias_total DECIMAL,
  num_reportes_accidentes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(v.marca, 'Sin marca')::VARCHAR as marca,
    COALESCE(v.modelo, 'Sin modelo')::VARCHAR as modelo,
    COUNT(DISTINCT v.id)::BIGINT as cantidad,
    ROUND(AVG(v.año), 1) as año_promedio,
    ROUND(AVG(k.km_actual), 0) as km_promedio,
    ROUND(AVG(ve.precio_compra), 2) as precio_compra_promedio,
    ROUND(AVG(ve.valor_estimado_actual), 2) as valor_actual_promedio,
    ROUND(AVG(
      CASE
        WHEN ve.precio_compra > 0 AND ve.valor_estimado_actual IS NOT NULL
        THEN ((ve.precio_compra - ve.valor_estimado_actual) / ve.precio_compra * 100)
        ELSE NULL
      END
    ), 2) as depreciacion_media,
    ROUND(AVG(
      CASE
        WHEN ve.total_mantenimientos IS NOT NULL AND v.año IS NOT NULL
        THEN ve.total_mantenimientos / GREATEST(EXTRACT(YEAR FROM CURRENT_DATE) - v.año, 1)
        ELSE NULL
      END
    ), 2) as coste_mantenimiento_anual,
    ROUND(AVG(ve.total_averias), 2) as coste_averias_total,
    COUNT(DISTINCT r.id)::BIGINT as num_reportes_accidentes
  FROM vehiculos_registrados v
  LEFT JOIN vehiculo_valoracion_economica ve ON v.id = ve.vehiculo_id
  LEFT JOIN (
    SELECT vehiculo_id, MAX(kilometros) as km_actual
    FROM vehiculo_kilometraje
    GROUP BY vehiculo_id
  ) k ON v.id = k.vehiculo_id
  LEFT JOIN reportes_accidentes r ON v.id = r.vehiculo_id
  WHERE v.activo = true
  GROUP BY COALESCE(v.marca, 'Sin marca'), COALESCE(v.modelo, 'Sin modelo')
  HAVING COUNT(DISTINCT v.id) >= 1
  ORDER BY cantidad DESC, marca, modelo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Función admin_analisis_por_marca_modelo actualizada correctamente';
  RAISE NOTICE '   - Ahora maneja correctamente valores NULL en marca y modelo';
  RAISE NOTICE '   - Los vehículos aparecerán incluso si no tienen marca/modelo definidos';
END $$;

