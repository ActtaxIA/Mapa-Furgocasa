-- ===================================================================
-- TABLA: rutas
-- ===================================================================
-- Almacena las rutas calculadas por los usuarios
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.rutas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  
  -- Puntos de la ruta (origen, destino, paradas)
  origen JSONB NOT NULL, -- {nombre, latitud, longitud, area_id?}
  destino JSONB NOT NULL, -- {nombre, latitud, longitud, area_id?}
  paradas JSONB DEFAULT '[]'::jsonb, -- [{nombre, latitud, longitud, area_id?, orden}]
  
  -- Información de la ruta
  distancia_km DECIMAL(10, 2), -- Distancia total en kilómetros
  duracion_minutos INT, -- Duración estimada en minutos
  geometria JSONB, -- GeoJSON de la ruta completa
  
  -- Metadata
  favorito BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rutas_user ON public.rutas (user_id);
CREATE INDEX IF NOT EXISTS idx_rutas_favorito ON public.rutas (favorito);
CREATE INDEX IF NOT EXISTS idx_rutas_created_at ON public.rutas (created_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_rutas_updated_at
  BEFORE UPDATE ON public.rutas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias rutas
CREATE POLICY "Los usuarios pueden ver sus propias rutas"
  ON public.rutas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias rutas
CREATE POLICY "Los usuarios pueden crear sus propias rutas"
  ON public.rutas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias rutas
CREATE POLICY "Los usuarios pueden actualizar sus propias rutas"
  ON public.rutas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias rutas
CREATE POLICY "Los usuarios pueden eliminar sus propias rutas"
  ON public.rutas
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===================================================================
-- COMENTARIOS
-- ===================================================================

COMMENT ON TABLE public.rutas IS 'Almacena las rutas calculadas y guardadas por los usuarios';
COMMENT ON COLUMN public.rutas.origen IS 'Punto de origen de la ruta en formato JSON';
COMMENT ON COLUMN public.rutas.destino IS 'Punto de destino de la ruta en formato JSON';
COMMENT ON COLUMN public.rutas.paradas IS 'Array de paradas intermedias en formato JSON';
COMMENT ON COLUMN public.rutas.geometria IS 'GeoJSON con la geometría completa de la ruta';

