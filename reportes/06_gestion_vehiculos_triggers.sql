-- =====================================================
-- TRIGGERS Y FUNCIONES PARA GESTIÓN DE VEHÍCULOS
-- =====================================================
-- Este script crea triggers automáticos y funciones
-- auxiliares para el sistema de gestión de vehículos
-- =====================================================

-- ============================================
-- FUNCIÓN: Actualizar timestamp updated_at
-- ============================================

-- Trigger para mantenimientos
CREATE OR REPLACE FUNCTION update_mantenimientos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mantenimientos_updated_at ON mantenimientos;
CREATE TRIGGER trigger_update_mantenimientos_updated_at
  BEFORE UPDATE ON mantenimientos
  FOR EACH ROW
  EXECUTE FUNCTION update_mantenimientos_updated_at();

-- Trigger para averías
CREATE OR REPLACE FUNCTION update_averias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_averias_updated_at ON averias;
CREATE TRIGGER trigger_update_averias_updated_at
  BEFORE UPDATE ON averias
  FOR EACH ROW
  EXECUTE FUNCTION update_averias_updated_at();

-- Trigger para documentos
CREATE OR REPLACE FUNCTION update_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_documentos_updated_at ON vehiculo_documentos;
CREATE TRIGGER trigger_update_documentos_updated_at
  BEFORE UPDATE ON vehiculo_documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_documentos_updated_at();

-- Trigger para mejoras
CREATE OR REPLACE FUNCTION update_mejoras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mejoras_updated_at ON vehiculo_mejoras;
CREATE TRIGGER trigger_update_mejoras_updated_at
  BEFORE UPDATE ON vehiculo_mejoras
  FOR EACH ROW
  EXECUTE FUNCTION update_mejoras_updated_at();

-- Trigger para ficha técnica
CREATE OR REPLACE FUNCTION update_ficha_tecnica_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ficha_tecnica_updated_at ON vehiculo_ficha_tecnica;
CREATE TRIGGER trigger_update_ficha_tecnica_updated_at
  BEFORE UPDATE ON vehiculo_ficha_tecnica
  FOR EACH ROW
  EXECUTE FUNCTION update_ficha_tecnica_updated_at();


-- ============================================
-- FUNCIÓN: Calcular coste total de averías
-- ============================================

CREATE OR REPLACE FUNCTION calcular_coste_total_averia()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular coste total sumando diagnóstico + reparación
  NEW.coste_total = COALESCE(NEW.coste_diagnostico, 0) + COALESCE(NEW.coste_reparacion, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_coste_averia ON averias;
CREATE TRIGGER trigger_calcular_coste_averia
  BEFORE INSERT OR UPDATE ON averias
  FOR EACH ROW
  EXECUTE FUNCTION calcular_coste_total_averia();


-- ============================================
-- FUNCIÓN: Calcular coste total de mejoras
-- ============================================

CREATE OR REPLACE FUNCTION calcular_coste_total_mejora()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular coste total sumando materiales + mano de obra
  NEW.coste_total = COALESCE(NEW.coste_materiales, 0) + COALESCE(NEW.coste_mano_obra, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_coste_mejora ON vehiculo_mejoras;
CREATE TRIGGER trigger_calcular_coste_mejora
  BEFORE INSERT OR UPDATE ON vehiculo_mejoras
  FOR EACH ROW
  EXECUTE FUNCTION calcular_coste_total_mejora();


-- ============================================
-- FUNCIÓN: Calcular precio por litro
-- ============================================

CREATE OR REPLACE FUNCTION calcular_precio_litro_combustible()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular precio por litro si hay combustible y coste
  IF NEW.combustible_litros IS NOT NULL AND NEW.combustible_litros > 0 
     AND NEW.coste_combustible IS NOT NULL AND NEW.coste_combustible > 0 THEN
    NEW.precio_litro = NEW.coste_combustible / NEW.combustible_litros;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_precio_litro ON vehiculo_kilometraje;
CREATE TRIGGER trigger_calcular_precio_litro
  BEFORE INSERT OR UPDATE ON vehiculo_kilometraje
  FOR EACH ROW
  EXECUTE FUNCTION calcular_precio_litro_combustible();


-- ============================================
-- FUNCIÓN: Calcular consumo medio
-- ============================================

CREATE OR REPLACE FUNCTION calcular_consumo_medio()
RETURNS TRIGGER AS $$
DECLARE
  ultimo_repostaje RECORD;
  km_recorridos INTEGER;
BEGIN
  -- Solo calcular si es un repostaje completo
  IF NEW.combustible_litros IS NOT NULL AND NEW.combustible_litros > 0 THEN
    
    -- Buscar el último repostaje del mismo vehículo
    SELECT * INTO ultimo_repostaje
    FROM vehiculo_kilometraje
    WHERE vehiculo_id = NEW.vehiculo_id
      AND combustible_litros IS NOT NULL
      AND id != NEW.id
      AND fecha < NEW.fecha
    ORDER BY fecha DESC, created_at DESC
    LIMIT 1;
    
    -- Si hay un repostaje anterior, calcular consumo
    IF ultimo_repostaje.id IS NOT NULL THEN
      km_recorridos = NEW.kilometros - ultimo_repostaje.kilometros;
      
      IF km_recorridos > 0 THEN
        NEW.km_desde_ultimo_repostaje = km_recorridos;
        -- Consumo en litros/100km
        NEW.consumo_medio = (NEW.combustible_litros * 100.0) / km_recorridos;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_consumo ON vehiculo_kilometraje;
CREATE TRIGGER trigger_calcular_consumo
  BEFORE INSERT OR UPDATE ON vehiculo_kilometraje
  FOR EACH ROW
  EXECUTE FUNCTION calcular_consumo_medio();


-- ============================================
-- FUNCIÓN: Calcular carga útil automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION calcular_carga_util()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular carga útil si hay MMA y Tara
  IF NEW.mma_kg IS NOT NULL AND NEW.tara_kg IS NOT NULL THEN
    NEW.carga_util_kg = NEW.mma_kg - NEW.tara_kg;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_carga_util ON vehiculo_ficha_tecnica;
CREATE TRIGGER trigger_calcular_carga_util
  BEFORE INSERT OR UPDATE ON vehiculo_ficha_tecnica
  FOR EACH ROW
  EXECUTE FUNCTION calcular_carga_util();


-- ============================================
-- FUNCIÓN: Verificar propiedad del vehículo
-- ============================================
-- Asegura que el user_id coincide con el propietario del vehículo

CREATE OR REPLACE FUNCTION verificar_propiedad_vehiculo()
RETURNS TRIGGER AS $$
DECLARE
  propietario_id UUID;
BEGIN
  -- Obtener el propietario del vehículo
  SELECT user_id INTO propietario_id
  FROM vehiculos_registrados
  WHERE id = NEW.vehiculo_id;
  
  -- Verificar que el user_id coincide
  IF NEW.user_id != propietario_id THEN
    RAISE EXCEPTION 'El usuario no es propietario del vehículo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas relacionadas
DROP TRIGGER IF EXISTS trigger_verificar_propiedad_mantenimiento ON mantenimientos;
CREATE TRIGGER trigger_verificar_propiedad_mantenimiento
  BEFORE INSERT OR UPDATE ON mantenimientos
  FOR EACH ROW
  EXECUTE FUNCTION verificar_propiedad_vehiculo();

DROP TRIGGER IF EXISTS trigger_verificar_propiedad_averia ON averias;
CREATE TRIGGER trigger_verificar_propiedad_averia
  BEFORE INSERT OR UPDATE ON averias
  FOR EACH ROW
  EXECUTE FUNCTION verificar_propiedad_vehiculo();

DROP TRIGGER IF EXISTS trigger_verificar_propiedad_documento ON vehiculo_documentos;
CREATE TRIGGER trigger_verificar_propiedad_documento
  BEFORE INSERT OR UPDATE ON vehiculo_documentos
  FOR EACH ROW
  EXECUTE FUNCTION verificar_propiedad_vehiculo();

DROP TRIGGER IF EXISTS trigger_verificar_propiedad_mejora ON vehiculo_mejoras;
CREATE TRIGGER trigger_verificar_propiedad_mejora
  BEFORE INSERT OR UPDATE ON vehiculo_mejoras
  FOR EACH ROW
  EXECUTE FUNCTION verificar_propiedad_vehiculo();

DROP TRIGGER IF EXISTS trigger_verificar_propiedad_kilometraje ON vehiculo_kilometraje;
CREATE TRIGGER trigger_verificar_propiedad_kilometraje
  BEFORE INSERT OR UPDATE ON vehiculo_kilometraje
  FOR EACH ROW
  EXECUTE FUNCTION verificar_propiedad_vehiculo();

DROP TRIGGER IF EXISTS trigger_verificar_propiedad_ficha ON vehiculo_ficha_tecnica;
CREATE TRIGGER trigger_verificar_propiedad_ficha
  BEFORE INSERT OR UPDATE ON vehiculo_ficha_tecnica
  FOR EACH ROW
  EXECUTE FUNCTION verificar_propiedad_vehiculo();


-- ============================================
-- FUNCIÓN: Actualizar fecha de resolución de averías
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_fecha_resolucion_averia()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estado cambia a 'resuelto' y no tiene fecha de resolución, ponerla
  IF NEW.estado = 'resuelto' AND NEW.fecha_resolucion IS NULL THEN
    NEW.fecha_resolucion = CURRENT_DATE;
  END IF;
  
  -- Si el estado cambia a 'en_reparacion' y no tiene fecha de inicio, ponerla
  IF NEW.estado = 'en_reparacion' AND NEW.fecha_inicio_reparacion IS NULL THEN
    NEW.fecha_inicio_reparacion = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_fecha_resolucion ON averias;
CREATE TRIGGER trigger_actualizar_fecha_resolucion
  BEFORE INSERT OR UPDATE ON averias
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_resolucion_averia();


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Triggers y funciones creados correctamente:';
  RAISE NOTICE '   - Update timestamps automáticos';
  RAISE NOTICE '   - Cálculo de costes totales';
  RAISE NOTICE '   - Cálculo de consumo de combustible';
  RAISE NOTICE '   - Cálculo de carga útil';
  RAISE NOTICE '   - Verificación de propiedad';
  RAISE NOTICE '   - Actualización de fechas de averías';
END $$;

