-- ===================================================================
-- SISTEMA DE ALERTAS DE ACCIDENTES - CREACIÓN DE TABLAS
-- ===================================================================
-- Ejecutar en: Supabase SQL Editor
-- Descripción: Crea las tablas necesarias para el sistema de reportes
-- Orden: 1/4
-- ===================================================================

-- Enable UUID extension (si no está habilitado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- TABLA: vehiculos_registrados
-- ===================================================================
-- Almacena las autocaravanas registradas por los usuarios
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.vehiculos_registrados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos del vehículo
  matricula VARCHAR(20) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  año INTEGER CHECK (año >= 1900 AND año <= EXTRACT(YEAR FROM NOW()) + 1),
  color VARCHAR(50),

  -- Fotos del vehículo (Supabase Storage)
  foto_url TEXT,
  fotos_adicionales TEXT[] DEFAULT '{}',

  -- QR único para reportes
  qr_code_id VARCHAR(50) UNIQUE NOT NULL, -- ID único para el QR
  qr_image_url TEXT, -- URL de la imagen del QR generado

  -- Estado
  activo BOOLEAN DEFAULT true,
  verificado BOOLEAN DEFAULT false, -- Para verificación futura si lo necesitas

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Restricciones
  UNIQUE(user_id, matricula) -- Un usuario puede registrar la misma matrícula solo una vez
);

-- Comentarios descriptivos
COMMENT ON TABLE public.vehiculos_registrados IS 'Almacena las autocaravanas registradas por los usuarios';
COMMENT ON COLUMN public.vehiculos_registrados.qr_code_id IS 'ID único para generar el QR de reporte';
COMMENT ON COLUMN public.vehiculos_registrados.matricula IS 'Matrícula del vehículo (formato libre)';

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_vehiculos_user ON public.vehiculos_registrados (user_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_matricula ON public.vehiculos_registrados (matricula);
CREATE INDEX IF NOT EXISTS idx_vehiculos_qr ON public.vehiculos_registrados (qr_code_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_activo ON public.vehiculos_registrados (activo);

-- ===================================================================
-- TABLA: reportes_accidentes
-- ===================================================================
-- Almacena los reportes de accidentes realizados por testigos
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.reportes_accidentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Vehículo afectado (el que tiene el QR)
  vehiculo_afectado_id UUID NOT NULL REFERENCES public.vehiculos_registrados(id) ON DELETE CASCADE,

  -- Datos del tercero causante
  matricula_tercero VARCHAR(20),
  descripcion_tercero TEXT, -- Descripción del vehículo tercero (marca, color, etc.)

  -- Datos del testigo
  testigo_nombre VARCHAR(200) NOT NULL,
  testigo_email VARCHAR(200),
  testigo_telefono VARCHAR(50),

  -- Descripción del accidente
  descripcion TEXT NOT NULL,
  tipo_dano TEXT, -- "Rayón", "Abolladura", "Choque", "Otro"

  -- Ubicación (Google Maps)
  ubicacion_lat DECIMAL(10, 8) NOT NULL,
  ubicacion_lng DECIMAL(11, 8) NOT NULL,
  ubicacion_direccion TEXT, -- Dirección legible (geocoding reverso)
  ubicacion_descripcion TEXT, -- Descripción adicional del lugar

  -- Fotos del accidente (Supabase Storage)
  fotos_urls TEXT[] DEFAULT '{}',

  -- Fecha y hora del accidente
  fecha_accidente TIMESTAMPTZ NOT NULL,

  -- Seguridad y validación
  ip_address VARCHAR(50), -- Para prevenir spam
  captcha_verificado BOOLEAN DEFAULT false,

  -- Estado del reporte
  verificado BOOLEAN DEFAULT false, -- Verificado por el propietario
  leido BOOLEAN DEFAULT false, -- Leído por el propietario
  cerrado BOOLEAN DEFAULT false, -- Caso cerrado/resuelto
  notas_propietario TEXT, -- Notas privadas del propietario

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios descriptivos
COMMENT ON TABLE public.reportes_accidentes IS 'Almacena reportes de accidentes realizados por testigos a través de QR';
COMMENT ON COLUMN public.reportes_accidentes.vehiculo_afectado_id IS 'Vehículo que sufrió el daño (dueño del QR escaneado)';
COMMENT ON COLUMN public.reportes_accidentes.matricula_tercero IS 'Matrícula del vehículo que causó el daño';
COMMENT ON COLUMN public.reportes_accidentes.leido IS 'Si el propietario ha leído el reporte';
COMMENT ON COLUMN public.reportes_accidentes.cerrado IS 'Si el propietario ha marcado el caso como resuelto';

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_reportes_vehiculo ON public.reportes_accidentes (vehiculo_afectado_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON public.reportes_accidentes (fecha_accidente DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_leido ON public.reportes_accidentes (leido);
CREATE INDEX IF NOT EXISTS idx_reportes_cerrado ON public.reportes_accidentes (cerrado);
CREATE INDEX IF NOT EXISTS idx_reportes_created ON public.reportes_accidentes (created_at DESC);

-- ===================================================================
-- TABLA: notificaciones_reportes
-- ===================================================================
-- Historial de notificaciones enviadas a propietarios
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.notificaciones_reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reporte_id UUID NOT NULL REFERENCES public.reportes_accidentes(id) ON DELETE CASCADE,

  tipo_notificacion VARCHAR(50) NOT NULL, -- "email", "push", "in_app"
  estado VARCHAR(50) DEFAULT 'pendiente', -- "pendiente", "enviada", "fallida"
  intentos INT DEFAULT 0,

  enviada_at TIMESTAMPTZ,
  leida_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios descriptivos
COMMENT ON TABLE public.notificaciones_reportes IS 'Historial de notificaciones enviadas a propietarios sobre reportes';
COMMENT ON COLUMN public.notificaciones_reportes.tipo_notificacion IS 'Tipo: email, push, in_app';
COMMENT ON COLUMN public.notificaciones_reportes.estado IS 'Estado: pendiente, enviada, fallida';

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_user ON public.notificaciones_reportes (user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_reporte ON public.notificaciones_reportes (reporte_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON public.notificaciones_reportes (estado);

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================

SELECT 'Tablas creadas correctamente!' as mensaje;
