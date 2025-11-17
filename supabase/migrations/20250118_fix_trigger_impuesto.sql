-- =====================================================
-- FIX: Trigger impuesto matriculación sin campo tipo_vehiculo
-- =====================================================
-- Fecha: 18 de enero de 2025
-- El trigger estaba intentando acceder a NEW.tipo_vehiculo
-- pero ese campo no existe en vehiculo_valoracion_economica
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_actualizar_pvp_base_particular()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo calcular si hay precio de compra
  IF NEW.precio_compra IS NOT NULL AND NEW.precio_compra > 0 THEN

    -- Calcular impuesto estimado si no está incluido
    -- Siempre usar 'autocaravana' como tipo por defecto (14,75%)
    IF NOT COALESCE(NEW.precio_incluye_impuesto_matriculacion, true) THEN
      NEW.impuesto_matriculacion_estimado := calcular_impuesto_matriculacion_estimado(
        NEW.precio_compra,
        'autocaravana',  -- Tipo fijo: siempre autocaravana
        NULL -- emisiones CO2 (no disponible)
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

-- Verificar que el trigger existe
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'trigger_pvp_base_particular';
