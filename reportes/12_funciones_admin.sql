-- =====================================================
-- FUNCIONES PARA PANEL DE ADMINISTRACIÓN
-- =====================================================
-- Funciones específicas para análisis y reportes
-- del panel de administración
-- =====================================================

-- ============================================
-- Dashboard General - Métricas Clave
-- ============================================

CREATE OR REPLACE FUNCTION admin_dashboard_metricas()
RETURNS TABLE (
  total_vehiculos BIGINT,
  vehiculos_mes_actual BIGINT,
  valor_total_parque DECIMAL,
  total_reportes_accidentes BIGINT,
  reportes_pendientes BIGINT,
  datos_mercado_verificados BIGINT,
  datos_mercado_pendientes BIGINT,
  usuarios_con_vehiculos BIGINT,
  usuarios_compartiendo_datos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Total de vehículos activos
    (SELECT COUNT(*) FROM vehiculos_registrados WHERE activo = true),

    -- Vehículos registrados este mes
    (SELECT COUNT(*) FROM vehiculos_registrados
     WHERE activo = true
     AND created_at >= DATE_TRUNC('month', CURRENT_DATE)),

    -- Valor total del parque (suma de valores estimados)
    (SELECT COALESCE(SUM(valor_estimado_actual), 0)
     FROM vehiculo_valoracion_economica),

    -- Total de reportes de accidentes
    (SELECT COUNT(*) FROM reportes_accidentes),

    -- Reportes pendientes (no leídos)
    (SELECT COUNT(*) FROM reportes_accidentes WHERE leido = false),

    -- Datos de mercado verificados
    (SELECT COUNT(*) FROM datos_mercado_autocaravanas WHERE verificado = true),

    -- Datos pendientes de verificar
    (SELECT COUNT(*) FROM datos_mercado_autocaravanas
     WHERE verificado = false AND contribuido_por_usuario = true),

    -- Usuarios únicos con vehículos
    (SELECT COUNT(DISTINCT user_id) FROM vehiculos_registrados WHERE activo = true),

    -- Usuarios compartiendo datos
    (SELECT COUNT(DISTINCT user_id) FROM vehiculo_valoracion_economica
     WHERE compartir_datos_compra = true
        OR compartir_datos_venta = true
        OR compartir_datos_costes = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Análisis por Marca/Modelo
-- ============================================

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
    CASE
      WHEN COUNT(DISTINCT v.id) > 0 THEN ROUND(AVG(v."año"), 1)
      ELSE NULL
    END::DECIMAL as año_promedio,
    CASE
      WHEN COUNT(k.km_actual) > 0 THEN ROUND(AVG(k.km_actual), 0)
      ELSE NULL
    END::DECIMAL as km_promedio,
    CASE
      WHEN COUNT(ve.precio_compra) > 0 THEN ROUND(AVG(ve.precio_compra), 2)
      ELSE NULL
    END::DECIMAL as precio_compra_promedio,
    CASE
      WHEN COUNT(ve.valor_estimado_actual) > 0 THEN ROUND(AVG(ve.valor_estimado_actual), 2)
      ELSE NULL
    END::DECIMAL as valor_actual_promedio,
    ROUND(AVG(
      CASE
        WHEN ve.precio_compra > 0 AND ve.valor_estimado_actual IS NOT NULL
        THEN ((ve.precio_compra - ve.valor_estimado_actual) / ve.precio_compra * 100)
        ELSE NULL
      END
    ), 2)::DECIMAL as depreciacion_media,
    ROUND(AVG(
      CASE
        WHEN ve.total_mantenimientos IS NOT NULL AND v."año" IS NOT NULL
        THEN ve.total_mantenimientos / GREATEST(EXTRACT(YEAR FROM CURRENT_DATE) - v."año", 1)
        ELSE NULL
      END
    ), 2)::DECIMAL as coste_mantenimiento_anual,
    CASE
      WHEN COUNT(ve.total_averias) > 0 THEN ROUND(AVG(ve.total_averias), 2)
      ELSE 0
    END::DECIMAL as coste_averias_total,
    COUNT(DISTINCT r.id)::BIGINT as num_reportes_accidentes
  FROM vehiculos_registrados v
  LEFT JOIN vehiculo_valoracion_economica ve ON v.id = ve.vehiculo_id
  LEFT JOIN (
    SELECT vehiculo_id, MAX(kilometros) as km_actual
    FROM vehiculo_kilometraje
    GROUP BY vehiculo_id
  ) k ON v.id = k.vehiculo_id
  LEFT JOIN reportes_accidentes r ON v.id = r.vehiculo_afectado_id
  WHERE v.activo = true
  GROUP BY COALESCE(v.marca, 'Sin marca'), COALESCE(v.modelo, 'Sin modelo')
  HAVING COUNT(DISTINCT v.id) >= 1
  ORDER BY cantidad DESC, marca, modelo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Distribución de Vehículos por Rango de Precios
-- ============================================

CREATE OR REPLACE FUNCTION admin_distribucion_por_precio()
RETURNS TABLE (
  rango VARCHAR,
  cantidad BIGINT,
  porcentaje DECIMAL,
  valor_total DECIMAL,
  depreciacion_media DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH total AS (
    SELECT COUNT(*) as total_vehiculos
    FROM vehiculo_valoracion_economica
    WHERE precio_compra IS NOT NULL
  ),
  rangos AS (
    SELECT
      CASE
        WHEN precio_compra < 20000 THEN '0-20k'
        WHEN precio_compra < 40000 THEN '20k-40k'
        WHEN precio_compra < 60000 THEN '40k-60k'
        WHEN precio_compra < 80000 THEN '60k-80k'
        ELSE '80k+'
      END as rango,
      precio_compra,
      valor_estimado_actual,
      CASE
        WHEN precio_compra > 0 AND valor_estimado_actual IS NOT NULL
        THEN ((precio_compra - valor_estimado_actual) / precio_compra * 100)
        ELSE NULL
      END as depreciacion_porcentaje
    FROM vehiculo_valoracion_economica
    WHERE precio_compra IS NOT NULL
  )
  SELECT
    r.rango,
    COUNT(*)::BIGINT as cantidad,
    ROUND(COUNT(*)::DECIMAL / t.total_vehiculos * 100, 2) as porcentaje,
    ROUND(SUM(r.precio_compra), 2) as valor_total,
    ROUND(AVG(r.depreciacion_porcentaje), 2) as depreciacion_media
  FROM rangos r
  CROSS JOIN total t
  GROUP BY r.rango, t.total_vehiculos
  ORDER BY
    CASE r.rango
      WHEN '0-20k' THEN 1
      WHEN '20k-40k' THEN 2
      WHEN '40k-60k' THEN 3
      WHEN '60k-80k' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Análisis de Siniestralidad
-- ============================================

CREATE OR REPLACE FUNCTION admin_analisis_siniestralidad()
RETURNS TABLE (
  mes VARCHAR,
  total_reportes BIGINT,
  reportes_graves BIGINT,
  ciudades_mas_afectadas TEXT,
  marcas_mas_afectadas TEXT,
  tipo_dano_mas_comun TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH reportes_mes AS (
    SELECT
      TO_CHAR(fecha_accidente, 'YYYY-MM') as mes,
      tipo_dano,
      ubicacion_ciudad,
      v.marca
    FROM reportes_accidentes r
    JOIN vehiculos_registrados v ON r.vehiculo_id = v.id
    WHERE fecha_accidente >= CURRENT_DATE - INTERVAL '12 months'
  )
  SELECT
    rm.mes,
    COUNT(*)::BIGINT as total_reportes,
    COUNT(*) FILTER (WHERE rm.tipo_dano IN ('Choque', 'Rotura'))::BIGINT as reportes_graves,
    STRING_AGG(DISTINCT rm.ubicacion_ciudad, ', ' ORDER BY rm.ubicacion_ciudad) FILTER (WHERE rm.ubicacion_ciudad IS NOT NULL) as ciudades,
    STRING_AGG(DISTINCT rm.marca, ', ' ORDER BY rm.marca) FILTER (WHERE rm.marca IS NOT NULL) as marcas,
    MODE() WITHIN GROUP (ORDER BY rm.tipo_dano) as tipo_dano_mas_comun
  FROM reportes_mes rm
  GROUP BY rm.mes
  ORDER BY rm.mes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Top Modelos en el Mercado
-- ============================================

CREATE OR REPLACE FUNCTION admin_top_modelos_mercado(
  p_tipo_dato VARCHAR DEFAULT 'venta',
  p_limite INTEGER DEFAULT 10
)
RETURNS TABLE (
  marca VARCHAR,
  modelo VARCHAR,
  año INTEGER,
  num_transacciones BIGINT,
  precio_medio DECIMAL,
  precio_tendencia VARCHAR,
  ultimo_precio DECIMAL,
  fecha_ultima DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH precios AS (
    SELECT
      marca,
      modelo,
      año,
      precio,
      fecha_transaccion,
      LAG(precio) OVER (PARTITION BY marca, modelo, año ORDER BY fecha_transaccion) as precio_anterior
    FROM datos_mercado_autocaravanas
    WHERE tipo_dato = p_tipo_dato
      AND verificado = true
  )
  SELECT
    p.marca,
    p.modelo,
    p.año,
    COUNT(*)::BIGINT as num_transacciones,
    ROUND(AVG(p.precio), 2) as precio_medio,
    CASE
      WHEN AVG(p.precio) > AVG(p.precio_anterior) + 500 THEN 'Subiendo ↑'
      WHEN AVG(p.precio) < AVG(p.precio_anterior) - 500 THEN 'Bajando ↓'
      ELSE 'Estable →'
    END as precio_tendencia,
    MAX(p.precio) as ultimo_precio,
    MAX(p.fecha_transaccion) as fecha_ultima
  FROM precios p
  WHERE p.fecha_transaccion >= CURRENT_DATE - INTERVAL '6 months'
  GROUP BY p.marca, p.modelo, p.año
  HAVING COUNT(*) >= 2
  ORDER BY num_transacciones DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Análisis de Averías Recurrentes
-- ============================================

CREATE OR REPLACE FUNCTION admin_averias_recurrentes()
RETURNS TABLE (
  marca VARCHAR,
  modelo VARCHAR,
  categoria VARCHAR,
  num_averias BIGINT,
  severidad_media VARCHAR,
  coste_medio DECIMAL,
  porcentaje_vehiculos_afectados DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH total_vehiculos AS (
    SELECT marca, modelo, COUNT(*) as total
    FROM vehiculos_registrados
    WHERE activo = true
    GROUP BY marca, modelo
  )
  SELECT
    v.marca,
    v.modelo,
    a.categoria,
    COUNT(*)::BIGINT as num_averias,
    MODE() WITHIN GROUP (ORDER BY a.severidad) as severidad_media,
    ROUND(AVG(a.coste_total), 2) as coste_medio,
    ROUND((COUNT(DISTINCT a.vehiculo_id)::DECIMAL / tv.total * 100), 2) as porcentaje_vehiculos_afectados
  FROM averias a
  JOIN vehiculos_registrados v ON a.vehiculo_id = v.id
  JOIN total_vehiculos tv ON v.marca = tv.marca AND v.modelo = tv.modelo
  WHERE v.activo = true
    AND a.categoria IS NOT NULL
  GROUP BY v.marca, v.modelo, a.categoria, tv.total
  HAVING COUNT(*) >= 3
  ORDER BY num_averias DESC, porcentaje_vehiculos_afectados DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Mejoras Más Populares
-- ============================================

CREATE OR REPLACE FUNCTION admin_mejoras_populares(
  p_limite INTEGER DEFAULT 20
)
RETURNS TABLE (
  categoria VARCHAR,
  titulo VARCHAR,
  num_instalaciones BIGINT,
  coste_medio DECIMAL,
  satisfaccion_media DECIMAL,
  porcentaje_recomendacion DECIMAL,
  num_likes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.categoria,
    m.titulo,
    COUNT(*)::BIGINT as num_instalaciones,
    ROUND(AVG(m.coste_total), 2) as coste_medio,
    ROUND(AVG(m.satisfaccion), 2) as satisfaccion_media,
    ROUND(COUNT(*) FILTER (WHERE m.lo_volveria_hacer = true)::DECIMAL / COUNT(*) * 100, 2) as porcentaje_recomendacion,
    SUM(m.likes)::BIGINT as num_likes
  FROM vehiculo_mejoras m
  WHERE m.es_publica = true
    AND m.categoria IS NOT NULL
  GROUP BY m.categoria, m.titulo
  HAVING COUNT(*) >= 2
  ORDER BY num_instalaciones DESC, satisfaccion_media DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Consumo Real vs Oficial
-- ============================================

CREATE OR REPLACE FUNCTION admin_consumo_real_vs_oficial()
RETURNS TABLE (
  marca VARCHAR,
  modelo VARCHAR,
  consumo_oficial DECIMAL,
  consumo_real_medio DECIMAL,
  diferencia_porcentaje DECIMAL,
  num_mediciones BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.marca,
    v.modelo,
    ft.consumo_mixto_oficial,
    ROUND(AVG(k.consumo_medio), 2) as consumo_real_medio,
    ROUND(
      CASE
        WHEN ft.consumo_mixto_oficial > 0
        THEN ((AVG(k.consumo_medio) - ft.consumo_mixto_oficial) / ft.consumo_mixto_oficial * 100)
        ELSE NULL
      END,
      2
    ) as diferencia_porcentaje,
    COUNT(k.id)::BIGINT as num_mediciones
  FROM vehiculos_registrados v
  JOIN vehiculo_ficha_tecnica ft ON v.id = ft.vehiculo_id
  JOIN vehiculo_kilometraje k ON v.id = k.vehiculo_id
  WHERE v.activo = true
    AND ft.consumo_mixto_oficial IS NOT NULL
    AND k.consumo_medio IS NOT NULL
    AND k.consumo_medio BETWEEN 4 AND 25  -- Filtrar valores absurdos
  GROUP BY v.marca, v.modelo, ft.consumo_mixto_oficial
  HAVING COUNT(k.id) >= 5
  ORDER BY num_mediciones DESC, v.marca, v.modelo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Usuarios Top Contribuyentes
-- ============================================

CREATE OR REPLACE FUNCTION admin_usuarios_top_contribuyentes(
  p_limite INTEGER DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  nombre_completo VARCHAR,
  num_vehiculos BIGINT,
  num_registros_mantenimiento BIGINT,
  num_registros_kilometraje BIGINT,
  datos_compartidos BOOLEAN,
  ultimo_registro DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.user_id,
    u.email,
    u.user_metadata->>'full_name' as nombre_completo,
    COUNT(DISTINCT v.id)::BIGINT as num_vehiculos,
    COUNT(DISTINCT m.id)::BIGINT as num_registros_mantenimiento,
    COUNT(DISTINCT k.id)::BIGINT as num_registros_kilometraje,
    BOOL_OR(ve.compartir_datos_compra OR ve.compartir_datos_venta OR ve.compartir_datos_costes) as datos_compartidos,
    MAX(GREATEST(
      COALESCE(m.created_at::date, '1900-01-01'::date),
      COALESCE(k.created_at::date, '1900-01-01'::date)
    )) as ultimo_registro
  FROM vehiculos_registrados v
  JOIN auth.users u ON v.user_id = u.id
  LEFT JOIN mantenimientos m ON v.id = m.vehiculo_id
  LEFT JOIN vehiculo_kilometraje k ON v.id = k.vehiculo_id
  LEFT JOIN vehiculo_valoracion_economica ve ON v.id = ve.vehiculo_id
  WHERE v.activo = true
  GROUP BY v.user_id, u.email, u.user_metadata
  ORDER BY
    (COUNT(DISTINCT m.id) + COUNT(DISTINCT k.id)) DESC,
    num_vehiculos DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funciones de administración creadas correctamente:';
  RAISE NOTICE '   - admin_dashboard_metricas()';
  RAISE NOTICE '   - admin_analisis_por_marca_modelo()';
  RAISE NOTICE '   - admin_distribucion_por_precio()';
  RAISE NOTICE '   - admin_analisis_siniestralidad()';
  RAISE NOTICE '   - admin_top_modelos_mercado()';
  RAISE NOTICE '   - admin_averias_recurrentes()';
  RAISE NOTICE '   - admin_mejoras_populares()';
  RAISE NOTICE '   - admin_consumo_real_vs_oficial()';
  RAISE NOTICE '   - admin_usuarios_top_contribuyentes()';
END $$;
