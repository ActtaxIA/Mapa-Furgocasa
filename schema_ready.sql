-- ===================================================================
-- MAPA FURGOCASA - SCHEMA DE BASE DE DATOS
-- ===================================================================
-- Este archivo debe ejecutarse en Supabase SQL Editor
-- Crea todas las tablas, índices, políticas RLS y triggers necesarios
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- TABLA: areas
-- ===================================================================
-- Almacena información de áreas para autocaravanas
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  
  -- Ubicación
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  direccion TEXT,
  codigo_postal TEXT,
  ciudad TEXT,
  provincia TEXT,
  comunidad TEXT,
  pais TEXT DEFAULT 'España',
  
  -- Contacto
  telefono TEXT,
  email TEXT,
  website TEXT,
  google_maps_url TEXT,
  google_place_id TEXT UNIQUE,
  google_rating DECIMAL(2, 1),
  
  -- Servicios (JSON)
  servicios JSONB DEFAULT '{
    "agua": false,
    "electricidad": false,
    "vaciado_aguas_negras": false,
    "vaciado_aguas_grises": false,
    "wifi": false,
    "duchas": false,
    "wc": false,
    "lavanderia": false,
    "restaurante": false,
    "supermercado": false,
    "zona_mascotas": false
  }'::jsonb,
  
  -- Características
  tipo_area TEXT CHECK (tipo_area IN ('publica', 'privada', 'camping', 'parking')),
  precio_noche DECIMAL(10, 2),
  precio_24h BOOLEAN DEFAULT false,
  plazas_totales INT,
  plazas_camper INT,
  acceso_24h BOOLEAN DEFAULT false,
  barrera_altura DECIMAL(4, 2), -- en metros
  
  -- Fotos (almacenadas en Supabase Storage)
  fotos_urls TEXT[] DEFAULT '{}',
  foto_principal TEXT,
  
  -- Metadata
  verificado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_areas_location ON public.areas (provincia, ciudad);
CREATE INDEX IF NOT EXISTS idx_areas_rating ON public.areas (google_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_areas_tipo ON public.areas (tipo_area);
CREATE INDEX IF NOT EXISTS idx_areas_verificado ON public.areas (verificado);
CREATE INDEX IF NOT EXISTS idx_areas_activo ON public.areas (activo);
CREATE INDEX IF NOT EXISTS idx_areas_slug ON public.areas (slug);
CREATE INDEX IF NOT EXISTS idx_areas_google_place_id ON public.areas (google_place_id);

-- Índice espacial para búsquedas por coordenadas
CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON public.areas (latitud, longitud);

-- ===================================================================
-- TABLA: favoritos
-- ===================================================================
-- Almacena las áreas favoritas de los usuarios
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, area_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favoritos_user ON public.favoritos (user_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_area ON public.favoritos (area_id);

-- ===================================================================
-- TABLA: valoraciones
-- ===================================================================
-- Almacena las valoraciones y comentarios de usuarios sobre áreas
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.valoraciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  fotos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, area_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_valoraciones_area ON public.valoraciones (area_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_user ON public.valoraciones (user_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_rating ON public.valoraciones (rating DESC);

-- ===================================================================
-- TABLA: visitas
-- ===================================================================
-- Registra las visitas de usuarios a áreas
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.visitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  fecha_visita DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visitas_user ON public.visitas (user_id);
CREATE INDEX IF NOT EXISTS idx_visitas_area ON public.visitas (area_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON public.visitas (fecha_visita DESC);

-- ===================================================================
-- TABLA: user_analytics
-- ===================================================================
-- Almacena eventos de analytics para tracking de comportamiento
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.user_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.user_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.user_analytics (created_at DESC);

-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON public.areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_valoraciones_updated_at
  BEFORE UPDATE ON public.valoraciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valoraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLÍTICAS RLS: areas
-- ===================================================================

-- Todos pueden ver áreas activas
CREATE POLICY "Áreas activas son públicas"
  ON public.areas FOR SELECT
  USING (activo = true);

-- Solo usuarios autenticados pueden crear áreas
CREATE POLICY "Usuarios autenticados pueden crear áreas"
  ON public.areas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador puede actualizar sus áreas
CREATE POLICY "Usuarios pueden actualizar sus áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador puede eliminar sus áreas
CREATE POLICY "Usuarios pueden eliminar sus áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ===================================================================
-- POLÍTICAS RLS: favoritos
-- ===================================================================

-- Los usuarios solo ven sus propios favoritos
CREATE POLICY "Usuarios ven sus favoritos"
  ON public.favoritos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus favoritos
CREATE POLICY "Usuarios pueden crear favoritos"
  ON public.favoritos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus favoritos
CREATE POLICY "Usuarios pueden eliminar favoritos"
  ON public.favoritos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===================================================================
-- POLÍTICAS RLS: valoraciones
-- ===================================================================

-- Todos pueden ver valoraciones
CREATE POLICY "Valoraciones son públicas"
  ON public.valoraciones FOR SELECT
  USING (true);

-- Usuarios autenticados pueden crear valoraciones
CREATE POLICY "Usuarios pueden crear valoraciones"
  ON public.valoraciones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus valoraciones
CREATE POLICY "Usuarios pueden actualizar sus valoraciones"
  ON public.valoraciones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus valoraciones
CREATE POLICY "Usuarios pueden eliminar sus valoraciones"
  ON public.valoraciones FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===================================================================
-- POLÍTICAS RLS: visitas
-- ===================================================================

-- Los usuarios solo ven sus propias visitas
CREATE POLICY "Usuarios ven sus visitas"
  ON public.visitas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear visitas
CREATE POLICY "Usuarios pueden crear visitas"
  ON public.visitas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus visitas
CREATE POLICY "Usuarios pueden actualizar sus visitas"
  ON public.visitas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus visitas
CREATE POLICY "Usuarios pueden eliminar sus visitas"
  ON public.visitas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===================================================================
-- POLÍTICAS RLS: user_analytics
-- ===================================================================

-- Cualquiera puede insertar eventos de analytics (incluso anónimos)
CREATE POLICY "Permitir inserción de analytics"
  ON public.user_analytics FOR INSERT
  WITH CHECK (true);

-- Solo los usuarios pueden ver sus propios analytics
CREATE POLICY "Usuarios ven sus analytics"
  ON public.user_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ===================================================================
-- FUNCIONES AUXILIARES
-- ===================================================================

-- Función para buscar áreas cercanas a una ubicación
CREATE OR REPLACE FUNCTION public.areas_cercanas(
  lat DECIMAL,
  lng DECIMAL,
  radio_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  latitud DECIMAL,
  longitud DECIMAL,
  distancia_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.nombre,
    a.latitud,
    a.longitud,
    -- Fórmula de Haversine para calcular distancia
    (
      6371 * acos(
        cos(radians(lat)) * 
        cos(radians(a.latitud)) * 
        cos(radians(a.longitud) - radians(lng)) + 
        sin(radians(lat)) * 
        sin(radians(a.latitud))
      )
    ) AS distancia_km
  FROM public.areas a
  WHERE a.activo = true
  ORDER BY distancia_km
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ===================================================================
-- Descomentar para insertar algunos datos de prueba

/*
INSERT INTO public.areas (
  nombre, slug, descripcion, latitud, longitud, 
  direccion, ciudad, provincia, comunidad,
  tipo_area, precio_noche, acceso_24h, verificado, activo
) VALUES 
(
  'Área de Autocaravanas El Pinar',
  'area-autocaravanas-el-pinar-madrid',
  'Área completamente equipada con todos los servicios para autocaravanas',
  40.4168,
  -3.7038,
  'Calle del Pinar 123',
  'Madrid',
  'Madrid',
  'Comunidad de Madrid',
  'publica',
  15.00,
  true,
  true,
  true
);
*/

-- ===================================================================
-- FIN DEL SCHEMA
-- ===================================================================

-- Verificar que todo se ha creado correctamente
SELECT 'Schema creado correctamente!' as mensaje;
