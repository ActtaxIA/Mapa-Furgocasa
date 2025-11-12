-- ===================================================================
-- SISTEMA DE ALERTAS DE ACCIDENTES - TRIGGERS Y FUNCIONES
-- ===================================================================
-- Ejecutar en: Supabase SQL Editor
-- Descripción: Crea triggers para automatización
-- Orden: 2/4
-- IMPORTANTE: Ejecutar DESPUÉS de 01_crear_tablas.sql
-- ===================================================================

-- ===================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ===================================================================

-- Reutilizamos la función que ya existe en schema_ready.sql
-- Si no existe, la creamos:
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para vehiculos_registrados
CREATE TRIGGER update_vehiculos_updated_at
  BEFORE UPDATE ON public.vehiculos_registrados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers para reportes_accidentes
CREATE TRIGGER update_reportes_updated_at
  BEFORE UPDATE ON public.reportes_accidentes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================================
-- FUNCIÓN: Crear notificación automática al crear reporte
-- ===================================================================

CREATE OR REPLACE FUNCTION public.crear_notificacion_reporte()
RETURNS TRIGGER AS $$
DECLARE
  propietario_id UUID;
BEGIN
  -- Obtener el user_id del propietario del vehículo
  SELECT user_id INTO propietario_id
  FROM public.vehiculos_registrados
  WHERE id = NEW.vehiculo_afectado_id;

  -- Crear notificación in-app
  INSERT INTO public.notificaciones_reportes (
    user_id,
    reporte_id,
    tipo_notificacion,
    estado
  ) VALUES (
    propietario_id,
    NEW.id,
    'in_app',
    'pendiente'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.crear_notificacion_reporte() IS 'Crea automáticamente una notificación cuando se reporta un accidente';

-- Trigger para crear notificación automática
CREATE TRIGGER trigger_crear_notificacion_reporte
  AFTER INSERT ON public.reportes_accidentes
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_notificacion_reporte();

-- ===================================================================
-- FUNCIÓN: Marcar notificación como leída cuando se lee el reporte
-- ===================================================================

CREATE OR REPLACE FUNCTION public.marcar_notificacion_leida()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el reporte pasa de no leído a leído
  IF OLD.leido = false AND NEW.leido = true THEN
    UPDATE public.notificaciones_reportes
    SET
      leida_at = NOW(),
      estado = 'enviada'
    WHERE reporte_id = NEW.id AND leida_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.marcar_notificacion_leida() IS 'Marca la notificación como leída cuando el propietario lee el reporte';

-- Trigger para marcar notificación como leída
CREATE TRIGGER trigger_marcar_notificacion_leida
  AFTER UPDATE ON public.reportes_accidentes
  FOR EACH ROW
  WHEN (OLD.leido IS DISTINCT FROM NEW.leido)
  EXECUTE FUNCTION public.marcar_notificacion_leida();

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================

SELECT 'Triggers y funciones creados correctamente!' as mensaje;
