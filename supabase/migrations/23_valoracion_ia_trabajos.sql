-- ===================================================================
-- SCRIPT 23: TABLA DE TRABAJOS ASÍNCRONOS PARA VALORACIÓN IA
-- ===================================================================
-- Soluciona el problema de timeout (504) en AWS Amplify
-- Permite procesar valoraciones IA en segundo plano
-- ===================================================================

-- TABLA: valoracion_ia_trabajos
-- Almacena el estado de trabajos de valoración IA en proceso
CREATE TABLE IF NOT EXISTS public.valoracion_ia_trabajos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehiculo_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Estado del trabajo
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'procesando', 'completado', 'error')),

  -- Progreso
  progreso INT DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  mensaje_estado TEXT,

  -- Resultado (cuando se completa)
  informe_id UUID,

  -- Error (si falla)
  error_mensaje TEXT,
  error_detalle TEXT,

  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_finalizacion TIMESTAMP WITH TIME ZONE,

  -- Metadatos
  tiempo_procesamiento_segundos INT,
  tokens_usados INT
);

-- NOTA: No se agregan foreign keys porque vehiculos_registrados puede no tener PRIMARY KEY
-- La integridad se maneja a nivel de aplicación

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_trabajos_vehiculo_id ON public.valoracion_ia_trabajos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_trabajos_user_id ON public.valoracion_ia_trabajos(user_id);
CREATE INDEX IF NOT EXISTS idx_trabajos_estado ON public.valoracion_ia_trabajos(estado);
CREATE INDEX IF NOT EXISTS idx_trabajos_fecha_creacion ON public.valoracion_ia_trabajos(fecha_creacion DESC);

-- RLS: Usuarios solo ven sus propios trabajos
ALTER TABLE public.valoracion_ia_trabajos ENABLE ROW LEVEL SECURITY;

-- Política de SELECT: Ver solo tus trabajos
CREATE POLICY "Los usuarios pueden ver sus propios trabajos"
  ON public.valoracion_ia_trabajos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política de INSERT: Crear solo tus trabajos
CREATE POLICY "Los usuarios pueden crear sus propios trabajos"
  ON public.valoracion_ia_trabajos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE: Actualizar solo tus trabajos
CREATE POLICY "Los usuarios pueden actualizar sus propios trabajos"
  ON public.valoracion_ia_trabajos
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política de DELETE: Eliminar solo tus trabajos
CREATE POLICY "Los usuarios pueden eliminar sus propios trabajos"
  ON public.valoracion_ia_trabajos
  FOR DELETE
  USING (auth.uid() = user_id);

-- FUNCIÓN: Limpiar trabajos antiguos completados (más de 7 días)
CREATE OR REPLACE FUNCTION limpiar_trabajos_antiguos()
RETURNS void AS $$
BEGIN
  DELETE FROM public.valoracion_ia_trabajos
  WHERE estado IN ('completado', 'error')
    AND fecha_finalizacion < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- COMENTARIOS
COMMENT ON TABLE public.valoracion_ia_trabajos IS 'Trabajos asíncronos de valoración IA para evitar timeout de AWS Amplify';
COMMENT ON COLUMN public.valoracion_ia_trabajos.estado IS 'pendiente | procesando | completado | error';
COMMENT ON COLUMN public.valoracion_ia_trabajos.progreso IS 'Porcentaje de progreso (0-100)';
COMMENT ON COLUMN public.valoracion_ia_trabajos.informe_id IS 'ID del informe generado (cuando se completa)';
COMMENT ON FUNCTION limpiar_trabajos_antiguos() IS 'Limpia trabajos completados/error con más de 7 días';

-- LOG
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla valoracion_ia_trabajos creada correctamente';
  RAISE NOTICE '✅ 4 índices creados para optimización';
  RAISE NOTICE '✅ 4 políticas RLS configuradas';
  RAISE NOTICE '✅ Función de limpieza creada';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 SIGUIENTE PASO:';
  RAISE NOTICE '   1. Modificar endpoint POST /api/vehiculos/[id]/ia-valoracion';
  RAISE NOTICE '   2. Crear endpoint GET /api/vehiculos/[id]/ia-valoracion/status';
  RAISE NOTICE '   3. Modificar frontend para polling';
END $$;
