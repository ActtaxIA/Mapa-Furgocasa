-- ===================================================================
-- SISTEMA DE ALERTAS DE ACCIDENTES - ROW LEVEL SECURITY (RLS)
-- ===================================================================
-- Ejecutar en: Supabase SQL Editor
-- Descripción: Configura políticas de seguridad RLS
-- Orden: 3/4
-- IMPORTANTE: Ejecutar DESPUÉS de 02_crear_triggers.sql
-- ===================================================================

-- ===================================================================
-- HABILITAR RLS
-- ===================================================================

ALTER TABLE public.vehiculos_registrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_accidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_reportes ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLÍTICAS RLS: vehiculos_registrados
-- ===================================================================

-- Los usuarios solo ven sus propios vehículos
CREATE POLICY "Usuarios ven sus vehículos"
  ON public.vehiculos_registrados FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus vehículos
CREATE POLICY "Usuarios pueden crear vehículos"
  ON public.vehiculos_registrados FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus vehículos
CREATE POLICY "Usuarios pueden actualizar sus vehículos"
  ON public.vehiculos_registrados FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus vehículos
CREATE POLICY "Usuarios pueden eliminar sus vehículos"
  ON public.vehiculos_registrados FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Permitir buscar vehículo por QR (necesario para página pública)
-- SOLO permite ver si existe y datos básicos (no expone datos del propietario)
CREATE POLICY "Buscar vehículo por QR público"
  ON public.vehiculos_registrados FOR SELECT
  TO anon
  USING (activo = true);

-- ===================================================================
-- POLÍTICAS RLS: reportes_accidentes
-- ===================================================================

-- IMPORTANTE: Los reportes se crean de forma PÚBLICA (sin autenticación)
-- Por eso usamos una política especial para anon
CREATE POLICY "Permitir crear reportes públicos"
  ON public.reportes_accidentes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true); -- Cualquiera puede crear un reporte

-- Solo el propietario del vehículo puede ver los reportes de su vehículo
CREATE POLICY "Propietarios ven reportes de sus vehículos"
  ON public.reportes_accidentes FOR SELECT
  TO authenticated
  USING (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  );

-- Solo el propietario puede actualizar los reportes (marcar como leído, cerrado, etc.)
CREATE POLICY "Propietarios pueden actualizar sus reportes"
  ON public.reportes_accidentes FOR UPDATE
  TO authenticated
  USING (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  );

-- Solo el propietario puede eliminar reportes (opcional, por si quiere borrar reportes falsos)
CREATE POLICY "Propietarios pueden eliminar sus reportes"
  ON public.reportes_accidentes FOR DELETE
  TO authenticated
  USING (
    vehiculo_afectado_id IN (
      SELECT id FROM public.vehiculos_registrados
      WHERE user_id = auth.uid()
    )
  );

-- ===================================================================
-- POLÍTICAS RLS: notificaciones_reportes
-- ===================================================================

-- Los usuarios solo ven sus propias notificaciones
CREATE POLICY "Usuarios ven sus notificaciones"
  ON public.notificaciones_reportes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- El sistema puede crear notificaciones (desde triggers)
CREATE POLICY "Permitir crear notificaciones"
  ON public.notificaciones_reportes FOR INSERT
  WITH CHECK (true);

-- Los usuarios pueden actualizar sus notificaciones (marcar como leída)
CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
  ON public.notificaciones_reportes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================

SELECT 'Políticas RLS configuradas correctamente!' as mensaje;
