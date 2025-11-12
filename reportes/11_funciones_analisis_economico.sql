-- =====================================================
-- FUNCIONES DE ANÁLISIS ECONÓMICO Y VALORACIONES
-- =====================================================
-- Funciones auxiliares para análisis de costes,
-- valoraciones automáticas, y estadísticas de mercado
-- =====================================================

-- ============================================
-- Función: Obtener resumen económico completo de un vehículo
-- ============================================

CREATE OR REPLACE FUNCTION obtener_resumen_economico_vehiculo(
  p_vehiculo_id UUID
)
RETURNS TABLE (
  -- Datos básicos
  vehiculo_id UUID,
  matricula VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  año INTEGER,

  -- Compra
  precio_compra DECIMAL,
  fecha_compra DATE,
  km_compra INTEGER,

  -- Costes acumulados
  total_mantenimientos DECIMAL,
  total_averias DECIMAL,
  total_mejoras DECIMAL,
  total_seguros DECIMAL,
  total_impuestos DECIMAL,
  total_otros_gastos DECIMAL,
  inversion_total DECIMAL,

  -- Kilometraje
  km_actual INTEGER,
  km_recorridos INTEGER,
  coste_por_km DECIMAL,

  -- Valoración
  valor_estimado_actual DECIMAL,
  depreciacion_total DECIMAL,
  depreciacion_porcentaje DECIMAL,

  -- Venta
  en_venta BOOLEAN,
  precio_venta_deseado DECIMAL,
  vendido BOOLEAN,
  precio_venta_final DECIMAL,
  ganancia_perdida DECIMAL,
  roi_porcentaje DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.*
  FROM resumen_economico_vehiculo r
  WHERE r.vehiculo_id = p_vehiculo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Función: Valoración automática por IA/algoritmo
-- ============================================
-- Estima el valor actual basándose en datos de mercado

CREATE OR REPLACE FUNCTION calcular_valoracion_automatica(
  p_vehiculo_id UUID
)
RETURNS TABLE (
  valor_estimado DECIMAL,
  confianza VARCHAR,
  num_comparables INTEGER,
  precio_mercado_medio DECIMAL,
  ajuste_kilometraje DECIMAL,
  ajuste_estado DECIMAL,
  ajuste_equipamiento DECIMAL,
  metodo VARCHAR
) AS $$
DECLARE
  v_vehiculo RECORD;
  v_ficha RECORD;
  v_km_actual INTEGER;
  v_años_uso INTEGER;
  v_precio_base DECIMAL;
  v_factor_km DECIMAL := 1.0;
  v_factor_años DECIMAL := 1.0;
  v_factor_estado DECIMAL := 1.0;
  v_num_comparables INTEGER;
BEGIN
  -- Obtener datos del vehículo
  SELECT * INTO v_vehiculo
  FROM vehiculos_registrados
  WHERE id = p_vehiculo_id;

  SELECT * INTO v_ficha
  FROM vehiculo_ficha_tecnica
  WHERE vehiculo_id = p_vehiculo_id;

  -- Obtener km actual
  SELECT kilometros INTO v_km_actual
  FROM vehiculo_kilometraje
  WHERE vehiculo_id = p_vehiculo_id
  ORDER BY fecha DESC
  LIMIT 1;

  -- Calcular años de uso
  v_años_uso := EXTRACT(YEAR FROM CURRENT_DATE) - v_vehiculo.año;

  -- Buscar precios de mercado similares
  SELECT
    AVG(precio),
    COUNT(*)
  INTO v_precio_base, v_num_comparables
  FROM datos_mercado_autocaravanas
  WHERE marca = v_vehiculo.marca
    AND modelo = v_vehiculo.modelo
    AND año BETWEEN (v_vehiculo.año - 2) AND (v_vehiculo.año + 2)
    AND tipo_dato IN ('venta', 'venta_anuncio')
    AND fecha_transaccion >= CURRENT_DATE - INTERVAL '2 years';

  -- Si no hay datos suficientes, usar aproximación genérica
  IF v_num_comparables < 3 OR v_precio_base IS NULL THEN
    -- Depreciación estándar del 15% anual los primeros 5 años, 10% después
    SELECT precio_compra INTO v_precio_base
    FROM vehiculo_valoracion_economica
    WHERE vehiculo_id = p_vehiculo_id;

    IF v_precio_base IS NOT NULL THEN
      IF v_años_uso <= 5 THEN
        v_factor_años := POWER(0.85, v_años_uso);
      ELSE
        v_factor_años := POWER(0.85, 5) * POWER(0.90, v_años_uso - 5);
      END IF;
    END IF;
  END IF;

  -- Ajuste por kilometraje (comparado con media de 15000 km/año)
  IF v_km_actual IS NOT NULL THEN
    DECLARE
      km_esperados INTEGER := v_años_uso * 15000;
      diferencia_km INTEGER := v_km_actual - km_esperados;
    BEGIN
      IF diferencia_km > 0 THEN
        -- Penalizar por exceso de km (0.5% por cada 10000 km extra)
        v_factor_km := 1 - (diferencia_km::DECIMAL / 10000 * 0.005);
        v_factor_km := GREATEST(v_factor_km, 0.6); -- Máximo 40% de penalización
      ELSE
        -- Bonificar por bajo kilometraje (0.3% por cada 10000 km menos)
        v_factor_km := 1 + (ABS(diferencia_km)::DECIMAL / 10000 * 0.003);
        v_factor_km := LEAST(v_factor_km, 1.2); -- Máximo 20% de bonificación
      END IF;
    END;
  END IF;

  -- Ajuste por estado (basado en historial de averías graves)
  DECLARE
    num_averias_graves INTEGER;
  BEGIN
    SELECT COUNT(*) INTO num_averias_graves
    FROM averias
    WHERE vehiculo_id = p_vehiculo_id
      AND severidad IN ('alta', 'critica');

    IF num_averias_graves > 0 THEN
      v_factor_estado := 1 - (num_averias_graves * 0.05); -- 5% por avería grave
      v_factor_estado := GREATEST(v_factor_estado, 0.7); -- Máximo 30% de penalización
    END IF;
  END;

  -- Calcular valor estimado
  DECLARE
    v_valor_estimado DECIMAL;
    v_confianza VARCHAR;
  BEGIN
    v_valor_estimado := v_precio_base * v_factor_años * v_factor_km * v_factor_estado;

    -- Determinar nivel de confianza
    IF v_num_comparables >= 10 THEN
      v_confianza := 'Alta';
    ELSIF v_num_comparables >= 3 THEN
      v_confianza := 'Media';
    ELSE
      v_confianza := 'Baja';
    END IF;

    RETURN QUERY
    SELECT
      v_valor_estimado,
      v_confianza,
      v_num_comparables,
      v_precio_base,
      (1 - v_factor_km) * v_precio_base * v_factor_años * v_factor_estado as ajuste_km,
      (1 - v_factor_estado) * v_precio_base * v_factor_años * v_factor_km as ajuste_estado,
      0::DECIMAL as ajuste_equipamiento, -- Futuro: calcular según mejoras
      'Algoritmo Furgocasa v1.0'::VARCHAR;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Función: Comparar con el mercado
-- ============================================

CREATE OR REPLACE FUNCTION comparar_con_mercado(
  p_marca VARCHAR,
  p_modelo VARCHAR,
  p_año INTEGER,
  p_kilometros INTEGER DEFAULT NULL
)
RETURNS TABLE (
  tipo_dato VARCHAR,
  num_registros BIGINT,
  precio_medio DECIMAL,
  precio_minimo DECIMAL,
  precio_maximo DECIMAL,
  precio_mediano DECIMAL,
  km_medio DECIMAL,
  ultima_actualizacion DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.tipo_dato,
    COUNT(*) as num_registros,
    ROUND(AVG(d.precio), 2) as precio_medio,
    MIN(d.precio) as precio_minimo,
    MAX(d.precio) as precio_maximo,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY d.precio) as precio_mediano,
    ROUND(AVG(d.kilometros), 0) as km_medio,
    MAX(d.fecha_transaccion) as ultima_actualizacion
  FROM datos_mercado_autocaravanas d
  WHERE d.marca = p_marca
    AND d.modelo = p_modelo
    AND d.año BETWEEN (p_año - 2) AND (p_año + 2)
    AND d.verificado = true
  GROUP BY d.tipo_dato
  HAVING COUNT(*) >= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Función: Análisis de gastos por periodo
-- ============================================

CREATE OR REPLACE FUNCTION analisis_gastos_periodo(
  p_vehiculo_id UUID,
  p_fecha_inicio DATE,
  p_fecha_fin DATE
)
RETURNS TABLE (
  categoria VARCHAR,
  num_gastos BIGINT,
  importe_total DECIMAL,
  importe_medio DECIMAL,
  porcentaje_del_total DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH gastos_totales AS (
    -- Mantenimientos
    SELECT
      'Mantenimiento'::VARCHAR as categoria,
      fecha,
      COALESCE(coste, 0) as importe
    FROM mantenimientos
    WHERE vehiculo_id = p_vehiculo_id
      AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin

    UNION ALL

    -- Averías
    SELECT
      'Averías'::VARCHAR,
      fecha_averia,
      COALESCE(coste_total, 0)
    FROM averias
    WHERE vehiculo_id = p_vehiculo_id
      AND fecha_averia BETWEEN p_fecha_inicio AND p_fecha_fin

    UNION ALL

    -- Mejoras
    SELECT
      'Mejoras'::VARCHAR,
      fecha,
      COALESCE(coste_total, 0)
    FROM vehiculo_mejoras
    WHERE vehiculo_id = p_vehiculo_id
      AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin

    UNION ALL

    -- Gastos adicionales
    SELECT
      categoria,
      fecha,
      importe
    FROM gastos_adicionales
    WHERE vehiculo_id = p_vehiculo_id
      AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin
  ),
  totales AS (
    SELECT SUM(importe) as gran_total
    FROM gastos_totales
  )
  SELECT
    g.categoria,
    COUNT(*)::BIGINT as num_gastos,
    ROUND(SUM(g.importe), 2) as importe_total,
    ROUND(AVG(g.importe), 2) as importe_medio,
    ROUND((SUM(g.importe) / t.gran_total * 100), 2) as porcentaje_del_total
  FROM gastos_totales g
  CROSS JOIN totales t
  WHERE t.gran_total > 0
  GROUP BY g.categoria, t.gran_total
  ORDER BY importe_total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Función: Proyección de costes futuros
-- ============================================

CREATE OR REPLACE FUNCTION proyeccion_costes_anuales(
  p_vehiculo_id UUID
)
RETURNS TABLE (
  categoria VARCHAR,
  coste_anual_estimado DECIMAL,
  basado_en VARCHAR
) AS $$
DECLARE
  v_años_datos INTEGER;
  v_coste_anual_mantenimiento DECIMAL;
  v_coste_anual_averias DECIMAL;
BEGIN
  -- Calcular años con datos
  SELECT
    EXTRACT(YEAR FROM MAX(fecha)) - EXTRACT(YEAR FROM MIN(fecha)) + 1
  INTO v_años_datos
  FROM mantenimientos
  WHERE vehiculo_id = p_vehiculo_id;

  IF v_años_datos IS NULL OR v_años_datos < 1 THEN
    v_años_datos := 1;
  END IF;

  -- Mantenimiento anual promedio
  SELECT
    COALESCE(SUM(coste) / v_años_datos, 0)
  INTO v_coste_anual_mantenimiento
  FROM mantenimientos
  WHERE vehiculo_id = p_vehiculo_id;

  -- Averías anuales promedio
  SELECT
    COALESCE(SUM(coste_total) / v_años_datos, 0)
  INTO v_coste_anual_averias
  FROM averias
  WHERE vehiculo_id = p_vehiculo_id;

  RETURN QUERY
  SELECT 'Mantenimiento'::VARCHAR, v_coste_anual_mantenimiento,
         ('Promedio últimos ' || v_años_datos || ' años')::VARCHAR
  UNION ALL
  SELECT 'Averías'::VARCHAR, v_coste_anual_averias,
         ('Promedio últimos ' || v_años_datos || ' años')::VARCHAR
  UNION ALL
  -- Seguros (último gasto anual)
  SELECT 'Seguro'::VARCHAR,
         COALESCE((
           SELECT SUM(importe)
           FROM gastos_adicionales
           WHERE vehiculo_id = p_vehiculo_id
             AND categoria = 'Seguro'
             AND fecha >= CURRENT_DATE - INTERVAL '1 year'
         ), 0),
         'Últimos 12 meses'::VARCHAR
  UNION ALL
  -- Impuestos (último gasto anual)
  SELECT 'Impuestos'::VARCHAR,
         COALESCE((
           SELECT SUM(importe)
           FROM gastos_adicionales
           WHERE vehiculo_id = p_vehiculo_id
             AND categoria = 'Impuestos'
             AND fecha >= CURRENT_DATE - INTERVAL '1 year'
         ), 0),
         'Últimos 12 meses'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Función: Estadísticas de consumo
-- ============================================

CREATE OR REPLACE FUNCTION estadisticas_consumo_combustible(
  p_vehiculo_id UUID,
  p_ultimos_meses INTEGER DEFAULT 12
)
RETURNS TABLE (
  num_repostajes BIGINT,
  litros_totales DECIMAL,
  coste_total DECIMAL,
  precio_medio_litro DECIMAL,
  consumo_medio_l_100km DECIMAL,
  consumo_minimo DECIMAL,
  consumo_maximo DECIMAL,
  km_recorridos INTEGER,
  coste_por_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH repostajes AS (
    SELECT *
    FROM vehiculo_kilometraje
    WHERE vehiculo_id = p_vehiculo_id
      AND combustible_litros IS NOT NULL
      AND combustible_litros > 0
      AND fecha >= CURRENT_DATE - (p_ultimos_meses || ' months')::INTERVAL
  )
  SELECT
    COUNT(*)::BIGINT as num_repostajes,
    ROUND(SUM(combustible_litros), 2) as litros_totales,
    ROUND(SUM(coste_combustible), 2) as coste_total,
    ROUND(AVG(precio_litro), 3) as precio_medio_litro,
    ROUND(AVG(consumo_medio), 2) as consumo_medio_l_100km,
    ROUND(MIN(consumo_medio), 2) as consumo_minimo,
    ROUND(MAX(consumo_medio), 2) as consumo_maximo,
    (MAX(kilometros) - MIN(kilometros))::INTEGER as km_recorridos,
    CASE
      WHEN (MAX(kilometros) - MIN(kilometros)) > 0
      THEN ROUND(SUM(coste_combustible) / (MAX(kilometros) - MIN(kilometros)), 4)
      ELSE NULL
    END as coste_por_km
  FROM repostajes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funciones de análisis económico creadas correctamente:';
  RAISE NOTICE '   - obtener_resumen_economico_vehiculo()';
  RAISE NOTICE '   - calcular_valoracion_automatica()';
  RAISE NOTICE '   - comparar_con_mercado()';
  RAISE NOTICE '   - analisis_gastos_periodo()';
  RAISE NOTICE '   - proyeccion_costes_anuales()';
  RAISE NOTICE '   - estadisticas_consumo_combustible()';
END $$;
