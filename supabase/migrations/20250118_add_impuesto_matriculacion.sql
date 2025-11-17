-- =====================================================
-- Añadir campos de Impuesto de Matriculación
-- =====================================================
-- Fecha: 18 de enero de 2025
-- Descripción: Añade campos para registrar si el precio de compra
--              incluye o no el impuesto de matriculación, permitiendo
--              normalizar precios entre empresas de alquiler (exentas)
--              y particulares para valoraciones más precisas.
-- =====================================================

-- 1. Campo para indicar origen/tipo de comprador
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS origen_compra VARCHAR(50);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.origen_compra IS
'Tipo de comprador original: particular, empresa_alquiler, empresa_otros, discapacidad, familia_numerosa, exento_otro';

-- 2. Campo boolean: ¿El precio de compra incluye impuesto de matriculación?
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS precio_incluye_impuesto_matriculacion BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.vehiculo_valoracion_economica.precio_incluye_impuesto_matriculacion IS
'TRUE si el precio_compra ya incluye el impuesto de matriculación (compra como particular). FALSE si es precio sin impuesto (empresa alquiler, exento, etc.)';

-- 3. Campo para el importe real del impuesto de matriculación (si se conoce)
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS importe_impuesto_matriculacion NUMERIC(10,2);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.importe_impuesto_matriculacion IS
'Importe real del impuesto de matriculación pagado (si se conoce). NULL si no se pagó o se desconoce.';

-- 4. Campo para el impuesto estimado (calculado automáticamente)
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS impuesto_matriculacion_estimado NUMERIC(10,2);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.impuesto_matriculacion_estimado IS
'Impuesto de matriculación estimado que habría pagado un particular (calculado automáticamente por tipo de vehículo/emisiones)';

-- 5. Campo calculado: PVP base normalizado (precio equivalente para particular)
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS pvp_base_particular NUMERIC(10,2);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.pvp_base_particular IS
'Precio normalizado equivalente que habría pagado un particular (con impuesto de matriculación incluido). Campo calculado automáticamente.';

-- 6. Motivo de exención (opcional, para análisis)
ALTER TABLE public.vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS motivo_exencion_impuesto VARCHAR(100);

COMMENT ON COLUMN public.vehiculo_valoracion_economica.motivo_exencion_impuesto IS
'Motivo de la exención del impuesto de matriculación, si aplica. Ej: "alquiler_sin_conductor", "discapacidad_33%", "familia_numerosa", etc.';

-- =====================================================
-- FUNCIÓN: Calcular impuesto de matriculación estimado
-- =====================================================
-- Calcula el impuesto basándose en el precio de compra y tipo de vehículo
-- Por defecto usa 14,75% para autocaravanas (tipo más común)

CREATE OR REPLACE FUNCTION calcular_impuesto_matriculacion_estimado(
  precio_base NUMERIC,
  tipo_vehiculo VARCHAR DEFAULT 'autocaravana',
  emisiones_co2 INTEGER DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  tipo_impuesto NUMERIC := 14.75; -- Tipo por defecto para autocaravanas
BEGIN
  -- Validaciones
  IF precio_base IS NULL OR precio_base <= 0 THEN
    RETURN 0;
  END IF;

  -- Ajustar tipo según emisiones si se conocen (para turismos)
  IF emisiones_co2 IS NOT NULL AND tipo_vehiculo = 'turismo' THEN
    IF emisiones_co2 < 120 THEN
      tipo_impuesto := 0;
    ELSIF emisiones_co2 < 160 THEN
      tipo_impuesto := 4.75;
    ELSIF emisiones_co2 < 200 THEN
      tipo_impuesto := 9.75;
    ELSE
      tipo_impuesto := 14.75;
    END IF;
  END IF;

  -- Autocaravanas casi siempre tipo máximo (>200 g/km CO2)
  IF tipo_vehiculo IN ('autocaravana', 'camper', 'furgoneta_camper') THEN
    tipo_impuesto := 14.75;
  END IF;

  -- Calcular impuesto
  RETURN ROUND(precio_base * tipo_impuesto / 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_impuesto_matriculacion_estimado IS
'Calcula el impuesto de matriculación estimado según el precio base y tipo de vehículo. Autocaravanas: 14,75% por defecto.';

-- =====================================================
-- FUNCIÓN: Calcular PVP base particular (normalizado)
-- =====================================================
-- Calcula el precio equivalente que habría pagado un particular
-- sumando el impuesto de matriculación si no está incluido

CREATE OR REPLACE FUNCTION calcular_pvp_base_particular(
  precio_compra NUMERIC,
  incluye_impuesto BOOLEAN,
  importe_impuesto_real NUMERIC DEFAULT NULL,
  impuesto_estimado NUMERIC DEFAULT NULL
) RETURNS NUMERIC AS $$
BEGIN
  -- Si el precio ya incluye el impuesto, devolver tal cual
  IF incluye_impuesto THEN
    RETURN precio_compra;
  END IF;

  -- Si no incluye impuesto, sumar el impuesto
  -- Prioridad: importe real > estimado > calcular 14,75%
  IF importe_impuesto_real IS NOT NULL AND importe_impuesto_real > 0 THEN
    RETURN precio_compra + importe_impuesto_real;
  ELSIF impuesto_estimado IS NOT NULL AND impuesto_estimado > 0 THEN
    RETURN precio_compra + impuesto_estimado;
  ELSE
    -- Fallback: calcular 14,75% por defecto
    RETURN precio_compra + ROUND(precio_compra * 14.75 / 100, 2);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_pvp_base_particular IS
'Calcula el PVP normalizado (precio equivalente para particular con impuesto incluido). Si el precio no incluye impuesto, lo suma automáticamente.';

-- =====================================================
-- TRIGGER: Actualizar automáticamente pvp_base_particular
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_actualizar_pvp_base_particular()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo calcular si hay precio de compra
  IF NEW.precio_compra IS NOT NULL AND NEW.precio_compra > 0 THEN

    -- Calcular impuesto estimado si no está incluido
    IF NOT COALESCE(NEW.precio_incluye_impuesto_matriculacion, true) THEN
      NEW.impuesto_matriculacion_estimado := calcular_impuesto_matriculacion_estimado(
        NEW.precio_compra,
        COALESCE(NEW.tipo_vehiculo, 'autocaravana'),
        NULL -- emisiones CO2 (por implementar si se añade campo)
      );
    ELSE
      NEW.impuesto_matriculacion_estimado := NULL;
    END IF;

    -- Calcular PVP base particular normalizado
    NEW.pvp_base_particular := calcular_pvp_base_particular(
      NEW.precio_compra,
      COALESCE(NEW.precio_incluye_impuesto_matriculacion, true),
      NEW.importe_impuesto_matriculacion,
      NEW.impuesto_matriculacion_estimado
    );
  ELSE
    NEW.pvp_base_particular := NULL;
    NEW.impuesto_matriculacion_estimado := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS trigger_pvp_base_particular ON vehiculo_valoracion_economica;

CREATE TRIGGER trigger_pvp_base_particular
  BEFORE INSERT OR UPDATE OF precio_compra, precio_incluye_impuesto_matriculacion,
                            importe_impuesto_matriculacion
  ON vehiculo_valoracion_economica
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_pvp_base_particular();

-- =====================================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- =====================================================
-- Establecer valores por defecto para registros existentes

-- Por defecto, asumir que todos los registros existentes son de particulares
-- (precio incluye impuesto de matriculación)
UPDATE vehiculo_valoracion_economica
SET
  origen_compra = 'particular',
  precio_incluye_impuesto_matriculacion = true,
  pvp_base_particular = precio_compra
WHERE precio_compra IS NOT NULL
  AND pvp_base_particular IS NULL;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehiculo_valoracion_economica'
  AND column_name IN (
    'origen_compra',
    'precio_incluye_impuesto_matriculacion',
    'importe_impuesto_matriculacion',
    'impuesto_matriculacion_estimado',
    'pvp_base_particular',
    'motivo_exencion_impuesto'
  )
ORDER BY column_name;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN:
-- =====================================================
-- 1. Todos los campos son opcionales (NULL permitido) excepto precio_incluye_impuesto_matriculacion (default true)
-- 2. El trigger calcula automáticamente pvp_base_particular al insertar/actualizar
-- 3. Si precio_incluye_impuesto_matriculacion = false, se suma el impuesto (real o estimado)
-- 4. Para empresas de alquiler: marcar precio_incluye_impuesto_matriculacion = false
-- 5. La función de valoración IA debe usar siempre pvp_base_particular, no precio_compra
-- 6. Valores sugeridos para origen_compra:
--    - 'particular': compra normal particular
--    - 'empresa_alquiler': empresa de alquiler (exenta)
--    - 'empresa_otros': otra empresa
--    - 'discapacidad': persona con discapacidad (exenta)
--    - 'familia_numerosa': familia numerosa (bonificación 50%)
--    - 'exento_otro': otra exención
-- =====================================================
