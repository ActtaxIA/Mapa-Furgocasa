-- =====================================================
-- TRIGGERS Y FUNCIONES - VALORACIÓN ECONÓMICA
-- =====================================================

-- ============================================
-- Trigger: Actualizar updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_valoracion_economica_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_valoracion_updated_at ON vehiculo_valoracion_economica;
CREATE TRIGGER trigger_update_valoracion_updated_at
  BEFORE UPDATE ON vehiculo_valoracion_economica
  FOR EACH ROW
  EXECUTE FUNCTION update_valoracion_economica_updated_at();


-- ============================================
-- Función: Calcular inversión total
-- ============================================
-- Suma automática de todos los gastos del vehículo

CREATE OR REPLACE FUNCTION calcular_inversion_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Sumar todos los costes
  NEW.inversion_total = COALESCE(NEW.precio_compra, 0) +
                        COALESCE(NEW.total_mantenimientos, 0) +
                        COALESCE(NEW.total_averias, 0) +
                        COALESCE(NEW.total_mejoras, 0) +
                        COALESCE(NEW.total_seguros, 0) +
                        COALESCE(NEW.total_impuestos, 0) +
                        COALESCE(NEW.total_otros_gastos, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_inversion ON vehiculo_valoracion_economica;
CREATE TRIGGER trigger_calcular_inversion
  BEFORE INSERT OR UPDATE ON vehiculo_valoracion_economica
  FOR EACH ROW
  EXECUTE FUNCTION calcular_inversion_total();


-- ============================================
-- Función: Calcular ganancia/pérdida en venta
-- ============================================

CREATE OR REPLACE FUNCTION calcular_ganancia_perdida()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se marca como vendido y hay precio de venta, calcular ganancia
  IF NEW.vendido = true AND NEW.precio_venta_final IS NOT NULL THEN
    NEW.ganancia_perdida = NEW.precio_venta_final - COALESCE(NEW.inversion_total, 0);

    -- Si no tiene fecha de venta, ponerla automáticamente
    IF NEW.fecha_venta IS NULL THEN
      NEW.fecha_venta = CURRENT_DATE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_ganancia ON vehiculo_valoracion_economica;
CREATE TRIGGER trigger_calcular_ganancia
  BEFORE INSERT OR UPDATE ON vehiculo_valoracion_economica
  FOR EACH ROW
  EXECUTE FUNCTION calcular_ganancia_perdida();


-- ============================================
-- Función: Actualizar totales cuando hay nuevo gasto
-- ============================================
-- Se ejecuta cuando se inserta/actualiza un mantenimiento, avería, mejora o gasto adicional

-- Para MANTENIMIENTOS
CREATE OR REPLACE FUNCTION actualizar_total_mantenimientos()
RETURNS TRIGGER AS $$
DECLARE
  total_actual DECIMAL(12,2);
BEGIN
  -- Calcular el total de mantenimientos de este vehículo
  SELECT COALESCE(SUM(coste), 0) INTO total_actual
  FROM mantenimientos
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id)
    AND coste IS NOT NULL;

  -- Actualizar en la tabla de valoración económica
  UPDATE vehiculo_valoracion_economica
  SET total_mantenimientos = total_actual
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_total_mantenimientos_insert ON mantenimientos;
CREATE TRIGGER trigger_actualizar_total_mantenimientos_insert
  AFTER INSERT OR UPDATE OR DELETE ON mantenimientos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_total_mantenimientos();


-- Para AVERÍAS
CREATE OR REPLACE FUNCTION actualizar_total_averias()
RETURNS TRIGGER AS $$
DECLARE
  total_actual DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(coste_total), 0) INTO total_actual
  FROM averias
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id)
    AND coste_total IS NOT NULL;

  UPDATE vehiculo_valoracion_economica
  SET total_averias = total_actual
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_total_averias_insert ON averias;
CREATE TRIGGER trigger_actualizar_total_averias_insert
  AFTER INSERT OR UPDATE OR DELETE ON averias
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_total_averias();


-- Para MEJORAS
CREATE OR REPLACE FUNCTION actualizar_total_mejoras()
RETURNS TRIGGER AS $$
DECLARE
  total_actual DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(coste_total), 0) INTO total_actual
  FROM vehiculo_mejoras
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id)
    AND coste_total IS NOT NULL;

  UPDATE vehiculo_valoracion_economica
  SET total_mejoras = total_actual
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_total_mejoras_insert ON vehiculo_mejoras;
CREATE TRIGGER trigger_actualizar_total_mejoras_insert
  AFTER INSERT OR UPDATE OR DELETE ON vehiculo_mejoras
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_total_mejoras();


-- Para GASTOS ADICIONALES (Seguros, Impuestos, Otros)
CREATE OR REPLACE FUNCTION actualizar_totales_gastos_adicionales()
RETURNS TRIGGER AS $$
DECLARE
  total_seguros DECIMAL(12,2);
  total_impuestos DECIMAL(12,2);
  total_otros DECIMAL(12,2);
BEGIN
  -- Calcular totales por categoría
  SELECT
    COALESCE(SUM(CASE WHEN categoria = 'Seguro' THEN importe ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN categoria = 'Impuestos' THEN importe ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN categoria NOT IN ('Seguro', 'Impuestos') THEN importe ELSE 0 END), 0)
  INTO total_seguros, total_impuestos, total_otros
  FROM gastos_adicionales
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id);

  -- Actualizar en la tabla de valoración económica
  UPDATE vehiculo_valoracion_economica
  SET
    total_seguros = total_seguros,
    total_impuestos = total_impuestos,
    total_otros_gastos = total_otros
  WHERE vehiculo_id = COALESCE(NEW.vehiculo_id, OLD.vehiculo_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_gastos_adicionales ON gastos_adicionales;
CREATE TRIGGER trigger_actualizar_gastos_adicionales
  AFTER INSERT OR UPDATE OR DELETE ON gastos_adicionales
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_totales_gastos_adicionales();


-- ============================================
-- Función: Crear valoración económica automáticamente
-- ============================================
-- Cuando se registra un vehículo, crear su entrada de valoración económica

CREATE OR REPLACE FUNCTION crear_valoracion_economica_inicial()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear si no existe ya
  INSERT INTO vehiculo_valoracion_economica (vehiculo_id, user_id)
  VALUES (NEW.id, NEW.user_id)
  ON CONFLICT (vehiculo_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_crear_valoracion_inicial ON vehiculos_registrados;
CREATE TRIGGER trigger_crear_valoracion_inicial
  AFTER INSERT ON vehiculos_registrados
  FOR EACH ROW
  EXECUTE FUNCTION crear_valoracion_economica_inicial();


-- ============================================
-- Función: Contribuir datos al mercado
-- ============================================
-- Cuando un usuario marca datos como públicos, copiarlos a la tabla de mercado

CREATE OR REPLACE FUNCTION contribuir_datos_mercado()
RETURNS TRIGGER AS $$
DECLARE
  vehiculo RECORD;
  ficha RECORD;
BEGIN
  -- Solo proceder si algún campo de compartir cambió a true
  IF (NEW.compartir_datos_compra = true AND OLD.compartir_datos_compra = false) OR
     (NEW.compartir_datos_venta = true AND OLD.compartir_datos_venta = false) THEN

    -- Obtener datos del vehículo
    SELECT * INTO vehiculo
    FROM vehiculos_registrados
    WHERE id = NEW.vehiculo_id;

    -- Obtener ficha técnica si existe
    SELECT * INTO ficha
    FROM vehiculo_ficha_tecnica
    WHERE vehiculo_id = NEW.vehiculo_id;

    -- Contribuir datos de COMPRA
    IF NEW.compartir_datos_compra = true AND NEW.precio_compra IS NOT NULL THEN
      INSERT INTO datos_mercado_autocaravanas (
        marca, modelo, año,
        homologacion, largo_cm, plazas_dormir, tipo_combustible,
        tipo_dato, precio, fecha_transaccion, kilometros,
        tiene_placa_solar, tiene_calefaccion, tipo_calefaccion,
        capacidad_agua_litros,
        origen, pais, contribuido_por_usuario, vehiculo_id_original
      ) VALUES (
        COALESCE(vehiculo.marca, 'Desconocido'),
        COALESCE(vehiculo.modelo, 'Desconocido'),
        vehiculo.año,
        ficha.homologacion, ficha.largo_cm, ficha.plazas_dormir, ficha.tipo_combustible,
        'compra', NEW.precio_compra, NEW.fecha_compra, NEW.kilometros_compra,
        ficha.placa_solar, ficha.calefaccion, ficha.tipo_calefaccion,
        ficha.deposito_agua_limpia_litros,
        'Usuario app', 'España', true, NEW.vehiculo_id
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Contribuir datos de VENTA
    IF NEW.compartir_datos_venta = true AND NEW.vendido = true AND NEW.precio_venta_final IS NOT NULL THEN
      -- Obtener kilometraje final
      DECLARE
        km_final INTEGER;
      BEGIN
        SELECT kilometros INTO km_final
        FROM vehiculo_kilometraje
        WHERE vehiculo_id = NEW.vehiculo_id
        ORDER BY fecha DESC
        LIMIT 1;

        INSERT INTO datos_mercado_autocaravanas (
          marca, modelo, año,
          homologacion, largo_cm, plazas_dormir, tipo_combustible,
          tipo_dato, precio, fecha_transaccion, kilometros,
          tiene_placa_solar, tiene_calefaccion, tipo_calefaccion,
          capacidad_agua_litros,
          origen, pais, contribuido_por_usuario, vehiculo_id_original
        ) VALUES (
          COALESCE(vehiculo.marca, 'Desconocido'),
          COALESCE(vehiculo.modelo, 'Desconocido'),
          vehiculo.año,
          ficha.homologacion, ficha.largo_cm, ficha.plazas_dormir, ficha.tipo_combustible,
          'venta', NEW.precio_venta_final, NEW.fecha_venta, km_final,
          ficha.placa_solar, ficha.calefaccion, ficha.tipo_calefaccion,
          ficha.deposito_agua_limpia_litros,
          'Usuario app', 'España', true, NEW.vehiculo_id
        )
        ON CONFLICT DO NOTHING;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contribuir_mercado ON vehiculo_valoracion_economica;
CREATE TRIGGER trigger_contribuir_mercado
  AFTER UPDATE ON vehiculo_valoracion_economica
  FOR EACH ROW
  EXECUTE FUNCTION contribuir_datos_mercado();


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Triggers de valoración económica creados correctamente:';
  RAISE NOTICE '   - Actualización de timestamps';
  RAISE NOTICE '   - Cálculo de inversión total';
  RAISE NOTICE '   - Cálculo de ganancia/pérdida';
  RAISE NOTICE '   - Actualización automática de totales de gastos';
  RAISE NOTICE '   - Creación automática de valoración económica';
  RAISE NOTICE '   - Contribución automática a datos de mercado';
END $$;
