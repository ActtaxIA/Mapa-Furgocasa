-- ===================================================================
-- SISTEMA DE TRACKING DE COMPORTAMIENTO DE USUARIOS
-- ===================================================================
-- Tablas para capturar interacciones, sesiones y eventos de usuarios
-- ===================================================================

-- ===================================================================
-- TABLA: user_sessions
-- ===================================================================
-- Registra cada sesión de usuario (login/acceso a la web)
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- ID de sesión del navegador

  -- Datos de inicio de sesión
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT, -- Duración calculada

  -- Datos del dispositivo y navegador
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,

  -- Datos de ubicación (si está disponible)
  ip_address INET,
  country TEXT,
  city TEXT,

  -- Métricas de actividad en la sesión
  pages_viewed INT DEFAULT 0,
  areas_viewed INT DEFAULT 0,
  searches_performed INT DEFAULT 0,
  routes_calculated INT DEFAULT 0,
  interactions_count INT DEFAULT 0,

  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_type ON public.user_sessions (device_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions (is_active);

-- ===================================================================
-- TABLA: user_interactions
-- ===================================================================
-- Registra cada interacción/evento del usuario en la plataforma
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,

  -- Tipo de evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view',           -- Vista de página
    'area_view',           -- Vista de área específica
    'area_search',         -- Búsqueda de áreas
    'route_calculate',     -- Cálculo de ruta
    'route_save',          -- Guardar ruta
    'area_favorite',       -- Agregar a favoritos
    'area_unfavorite',     -- Quitar de favoritos
    'area_visit_register', -- Registrar visita
    'area_rate',           -- Valorar área
    'filter_apply',        -- Aplicar filtros
    'map_interaction',     -- Interacción con mapa
    'chatbot_open',        -- Abrir chatbot
    'chatbot_message',     -- Mensaje al chatbot
    'vehicle_register',    -- Registrar vehículo
    'vehicle_update',      -- Actualizar vehículo
    'profile_view',        -- Ver perfil
    'profile_update',      -- Actualizar perfil
    'login',               -- Iniciar sesión
    'logout',              -- Cerrar sesión
    'signup',              -- Registro nuevo
    'share',               -- Compartir contenido
    'download',            -- Descargar algo
    'click',               -- Click genérico
    'scroll',              -- Scroll en página
    'form_submit',         -- Envío de formulario
    'error',               -- Error ocurrido
    'other'                -- Otro evento
  )),

  -- Detalles del evento
  event_data JSONB DEFAULT '{}', -- Datos adicionales del evento
  page_url TEXT,                 -- URL donde ocurrió
  page_title TEXT,               -- Título de la página

  -- Referencias a entidades relacionadas
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  ruta_id UUID REFERENCES public.rutas(id) ON DELETE SET NULL,

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON public.user_interactions (session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_event_type ON public.user_interactions (event_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON public.user_interactions (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_area_id ON public.user_interactions (area_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_ruta_id ON public.user_interactions (ruta_id);

-- ===================================================================
-- TABLA: daily_user_stats
-- ===================================================================
-- Estadísticas agregadas por usuario por día (para queries rápidas)
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.daily_user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,

  -- Métricas de actividad
  sessions_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  pages_viewed INT DEFAULT 0,
  areas_viewed INT DEFAULT 0,
  searches_performed INT DEFAULT 0,
  routes_calculated INT DEFAULT 0,
  routes_saved INT DEFAULT 0,
  favorites_added INT DEFAULT 0,
  visits_registered INT DEFAULT 0,
  ratings_given INT DEFAULT 0,
  chatbot_messages INT DEFAULT 0,

  -- Primera y última actividad del día
  first_activity_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, stat_date)
);

-- Índices para daily_user_stats
CREATE INDEX IF NOT EXISTS idx_daily_user_stats_user_id ON public.daily_user_stats (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_user_stats_date ON public.daily_user_stats (stat_date DESC);

-- ===================================================================
-- TABLA: platform_daily_stats
-- ===================================================================
-- Estadísticas globales de la plataforma por día
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.platform_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_date DATE NOT NULL UNIQUE,

  -- Usuarios
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,          -- Usuarios con al menos 1 interacción
  returning_users INT DEFAULT 0,        -- Usuarios que ya habían visitado antes

  -- Sesiones
  total_sessions INT DEFAULT 0,
  avg_session_duration_seconds INT DEFAULT 0,

  -- Actividad
  total_page_views INT DEFAULT 0,
  total_area_views INT DEFAULT 0,
  total_searches INT DEFAULT 0,
  total_routes_calculated INT DEFAULT 0,
  total_routes_saved INT DEFAULT 0,
  total_favorites_added INT DEFAULT 0,
  total_visits_registered INT DEFAULT 0,
  total_ratings_given INT DEFAULT 0,
  total_chatbot_messages INT DEFAULT 0,

  -- Engagement
  avg_pages_per_session DECIMAL(10,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,  -- % sesiones con 1 sola página

  -- Dispositivos
  desktop_users INT DEFAULT 0,
  mobile_users INT DEFAULT 0,
  tablet_users INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para platform_daily_stats
CREATE INDEX IF NOT EXISTS idx_platform_daily_stats_date ON public.platform_daily_stats (stat_date DESC);

-- ===================================================================
-- FUNCIONES DE AGREGACIÓN
-- ===================================================================

-- Función para calcular estadísticas diarias de usuario
CREATE OR REPLACE FUNCTION calculate_daily_user_stats(p_user_id UUID, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO public.daily_user_stats (
    user_id,
    stat_date,
    sessions_count,
    total_duration_seconds,
    pages_viewed,
    areas_viewed,
    searches_performed,
    routes_calculated,
    routes_saved,
    favorites_added,
    visits_registered,
    ratings_given,
    chatbot_messages,
    first_activity_at,
    last_activity_at
  )
  SELECT
    p_user_id,
    p_date,
    COUNT(DISTINCT s.id) as sessions_count,
    COALESCE(SUM(s.duration_seconds), 0) as total_duration_seconds,
    COALESCE(SUM(s.pages_viewed), 0) as pages_viewed,
    COALESCE(SUM(s.areas_viewed), 0) as areas_viewed,
    COALESCE(SUM(s.searches_performed), 0) as searches_performed,
    COALESCE(SUM(s.routes_calculated), 0) as routes_calculated,
    COUNT(DISTINCT i.id) FILTER (WHERE i.event_type = 'route_save') as routes_saved,
    COUNT(DISTINCT i.id) FILTER (WHERE i.event_type = 'area_favorite') as favorites_added,
    COUNT(DISTINCT i.id) FILTER (WHERE i.event_type = 'area_visit_register') as visits_registered,
    COUNT(DISTINCT i.id) FILTER (WHERE i.event_type = 'area_rate') as ratings_given,
    COUNT(DISTINCT i.id) FILTER (WHERE i.event_type = 'chatbot_message') as chatbot_messages,
    MIN(s.started_at) as first_activity_at,
    MAX(s.last_activity_at) as last_activity_at
  FROM public.user_sessions s
  LEFT JOIN public.user_interactions i ON i.session_id = s.id
  WHERE s.user_id = p_user_id
    AND DATE(s.started_at) = p_date
  ON CONFLICT (user_id, stat_date) DO UPDATE SET
    sessions_count = EXCLUDED.sessions_count,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    pages_viewed = EXCLUDED.pages_viewed,
    areas_viewed = EXCLUDED.areas_viewed,
    searches_performed = EXCLUDED.searches_performed,
    routes_calculated = EXCLUDED.routes_calculated,
    routes_saved = EXCLUDED.routes_saved,
    favorites_added = EXCLUDED.favorites_added,
    visits_registered = EXCLUDED.visits_registered,
    ratings_given = EXCLUDED.ratings_given,
    chatbot_messages = EXCLUDED.chatbot_messages,
    first_activity_at = EXCLUDED.first_activity_at,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_daily_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para user_sessions
CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias sesiones"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias sesiones"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para user_interactions
CREATE POLICY "Usuarios pueden ver sus propias interacciones"
  ON public.user_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias interacciones"
  ON public.user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_user_stats
CREATE POLICY "Usuarios pueden ver sus propias estadísticas"
  ON public.daily_user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas para platform_daily_stats (solo lectura pública)
CREATE POLICY "Cualquiera puede ver estadísticas globales"
  ON public.platform_daily_stats FOR SELECT
  TO authenticated
  USING (true);

-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_user_stats_updated_at
  BEFORE UPDATE ON public.daily_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_daily_stats_updated_at
  BEFORE UPDATE ON public.platform_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- COMENTARIOS
-- ===================================================================

COMMENT ON TABLE public.user_sessions IS 'Registra cada sesión de usuario con métricas de actividad';
COMMENT ON TABLE public.user_interactions IS 'Registra cada evento/interacción del usuario en la plataforma';
COMMENT ON TABLE public.daily_user_stats IS 'Estadísticas agregadas por usuario por día para queries rápidas';
COMMENT ON TABLE public.platform_daily_stats IS 'Estadísticas globales de la plataforma agregadas por día';
