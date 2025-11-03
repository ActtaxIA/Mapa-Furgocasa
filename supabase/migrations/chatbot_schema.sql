-- ============================================
-- CHATBOT FURGOCASA - SCHEMA COMPLETO
-- ============================================
-- Día 1: Base de datos y funciones de consulta
-- Este script crea todas las tablas, funciones y políticas
-- necesarias para el chatbot con Function Calling
-- ============================================

-- Activar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: chatbot_config
-- ============================================
-- Configuración del asistente de IA
-- Permite ajustar prompts, modelos y comportamiento sin código

CREATE TABLE IF NOT EXISTS chatbot_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  
  -- Configuración del modelo
  modelo TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(2,1) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INT DEFAULT 1000 CHECK (max_tokens > 0 AND max_tokens <= 4096),
  
  -- Prompts configurables
  system_prompt TEXT NOT NULL,
  contexto_inicial TEXT,
  instrucciones_busqueda TEXT,
  
  -- Capacidades funcionales
  puede_geolocalizar BOOLEAN DEFAULT true,
  puede_buscar_areas BOOLEAN DEFAULT true,
  puede_obtener_detalles BOOLEAN DEFAULT true,
  puede_buscar_por_pais BOOLEAN DEFAULT true,
  
  -- Límites de uso
  max_mensajes_por_sesion INT DEFAULT 50,
  max_areas_por_respuesta INT DEFAULT 5,
  radio_busqueda_default_km INT DEFAULT 50,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_chatbot_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chatbot_config_timestamp_trigger ON chatbot_config;
CREATE TRIGGER update_chatbot_config_timestamp_trigger
  BEFORE UPDATE ON chatbot_config
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_config_timestamp();

-- ============================================
-- TABLA: chatbot_conversaciones
-- ============================================
-- Almacena conversaciones completas de usuarios

CREATE TABLE IF NOT EXISTS chatbot_conversaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuario (puede ser NULL para anónimos)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sesion_id TEXT NOT NULL, -- ID único para cada sesión (anónimos o autenticados)
  
  -- Metadatos de la conversación
  titulo TEXT DEFAULT 'Nueva conversación',
  total_mensajes INT DEFAULT 0,
  ultimo_mensaje_at TIMESTAMPTZ,
  
  -- Contexto geográfico del usuario
  ubicacion_usuario JSONB, -- {lat, lng, ciudad, pais}
  
  -- Preferencias detectadas en la conversación
  preferencias_detectadas JSONB DEFAULT '{}'::jsonb, -- {servicios_preferidos, presupuesto_max, etc}
  
  -- Estadísticas de la conversación
  total_areas_consultadas INT DEFAULT 0,
  areas_consultadas UUID[], -- Array de IDs de áreas mencionadas
  
  -- Estado
  activa BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_conversaciones_user_id ON chatbot_conversaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_sesion_id ON chatbot_conversaciones(sesion_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_activa ON chatbot_conversaciones(activa) WHERE activa = true;
CREATE INDEX IF NOT EXISTS idx_conversaciones_created ON chatbot_conversaciones(created_at DESC);

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_conversaciones_timestamp_trigger ON chatbot_conversaciones;
CREATE TRIGGER update_conversaciones_timestamp_trigger
  BEFORE UPDATE ON chatbot_conversaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_config_timestamp();

-- ============================================
-- TABLA: chatbot_mensajes
-- ============================================
-- Mensajes individuales dentro de cada conversación

CREATE TABLE IF NOT EXISTS chatbot_mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversacion_id UUID NOT NULL REFERENCES chatbot_conversaciones(id) ON DELETE CASCADE,
  
  -- Mensaje
  rol TEXT NOT NULL CHECK (rol IN ('user', 'assistant', 'system', 'function')),
  contenido TEXT NOT NULL,
  
  -- Metadatos técnicos
  tokens_usados INT,
  modelo_usado TEXT,
  temperatura_usada DECIMAL(2,1),
  
  -- Function Calling
  function_call_name TEXT, -- Nombre de la función llamada
  function_call_args JSONB, -- Argumentos enviados
  function_call_result JSONB, -- Resultado obtenido
  
  -- Referencias a áreas mencionadas
  areas_mencionadas UUID[], -- IDs de áreas en la respuesta
  
  -- Feedback del usuario
  util BOOLEAN, -- thumbs up/down
  feedback_texto TEXT,
  feedback_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON chatbot_mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created ON chatbot_mensajes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_rol ON chatbot_mensajes(rol);
CREATE INDEX IF NOT EXISTS idx_mensajes_function_call ON chatbot_mensajes(function_call_name) WHERE function_call_name IS NOT NULL;

-- ============================================
-- TABLA: chatbot_analytics
-- ============================================
-- Analytics y tracking de eventos del chatbot

CREATE TABLE IF NOT EXISTS chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuario (puede ser NULL)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversacion_id UUID REFERENCES chatbot_conversaciones(id) ON DELETE CASCADE,
  
  -- Evento
  evento TEXT NOT NULL, -- 'chat_iniciado', 'pregunta_areas', 'busqueda_cercana', 'error', etc
  categoria TEXT, -- 'busqueda', 'navegacion', 'error', 'feedback'
  
  -- Detalles del evento
  detalles JSONB DEFAULT '{}'::jsonb,
  
  -- Contexto
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_evento ON chatbot_analytics(evento);
CREATE INDEX IF NOT EXISTS idx_analytics_categoria ON chatbot_analytics(categoria);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON chatbot_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversacion ON chatbot_analytics(conversacion_id);

-- ============================================
-- FUNCIÓN: areas_cerca
-- ============================================
-- Busca áreas cercanas usando la fórmula de Haversine
-- Retorna áreas ordenadas por distancia con datos relevantes

DROP FUNCTION IF EXISTS areas_cerca(DECIMAL, DECIMAL, INT);

CREATE OR REPLACE FUNCTION areas_cerca(
  lat_usuario DECIMAL,
  lng_usuario DECIMAL,
  radio_km INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  slug TEXT,
  ciudad TEXT,
  provincia TEXT,
  pais TEXT,
  latitud DECIMAL,
  longitud DECIMAL,
  distancia_km DECIMAL,
  precio_noche DECIMAL,
  servicios JSONB,
  tipo_area TEXT,
  google_rating DECIMAL,
  plazas_totales INT,
  google_maps_url TEXT,
  fotos_urls TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.nombre,
    a.slug,
    a.ciudad,
    a.provincia,
    a.pais,
    a.latitud,
    a.longitud,
    -- Fórmula de Haversine para calcular distancia en km
    ROUND(
      CAST(
        6371 * acos(
          LEAST(1.0,
            cos(radians(lat_usuario)) * 
            cos(radians(a.latitud)) * 
            cos(radians(a.longitud) - radians(lng_usuario)) + 
            sin(radians(lat_usuario)) * 
            sin(radians(a.latitud))
          )
        ) AS NUMERIC
      ), 1
    ) as distancia_km,
    a.precio_noche,
    a.servicios,
    a.tipo_area,
    a.google_rating,
    a.plazas_totales,
    a.google_maps_url,
    a.fotos_urls
  FROM areas a
  WHERE 
    a.activo = true
    AND (
      6371 * acos(
        LEAST(1.0,
          cos(radians(lat_usuario)) * 
          cos(radians(a.latitud)) * 
          cos(radians(a.longitud) - radians(lng_usuario)) + 
          sin(radians(lat_usuario)) * 
          sin(radians(a.latitud))
        )
      )
    ) <= radio_km
  ORDER BY distancia_km ASC
  LIMIT 20; -- Retornamos más para poder filtrar después
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNCIÓN: contar_areas_por_servicios
-- ============================================
-- Cuenta cuántas áreas tienen ciertos servicios
-- Útil para estadísticas y recomendaciones

CREATE OR REPLACE FUNCTION contar_areas_por_servicios(
  servicio_buscar TEXT
)
RETURNS INT AS $$
DECLARE
  total INT;
BEGIN
  SELECT COUNT(*)
  INTO total
  FROM areas
  WHERE 
    activo = true
    AND servicios->>servicio_buscar = 'true';
  
  RETURN total;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- RLS POLICIES - Row Level Security
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas para chatbot_config
-- ============================================

-- Todos pueden leer la configuración activa
DROP POLICY IF EXISTS "Anyone can read active config" ON chatbot_config;
CREATE POLICY "Anyone can read active config"
  ON chatbot_config FOR SELECT
  USING (activo = true);

-- Solo admins pueden modificar
DROP POLICY IF EXISTS "Only admins can modify config" ON chatbot_config;
CREATE POLICY "Only admins can modify config"
  ON chatbot_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- ============================================
-- Políticas para chatbot_conversaciones
-- ============================================

-- Los usuarios pueden ver sus propias conversaciones
DROP POLICY IF EXISTS "Users can view own conversations" ON chatbot_conversaciones;
CREATE POLICY "Users can view own conversations"
  ON chatbot_conversaciones FOR SELECT
  USING (
    auth.uid() = user_id 
    OR sesion_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Los usuarios pueden crear conversaciones
DROP POLICY IF EXISTS "Users can create conversations" ON chatbot_conversaciones;
CREATE POLICY "Users can create conversations"
  ON chatbot_conversaciones FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.uid() IS NULL AND sesion_id IS NOT NULL)
  );

-- Los usuarios pueden actualizar sus conversaciones
DROP POLICY IF EXISTS "Users can update own conversations" ON chatbot_conversaciones;
CREATE POLICY "Users can update own conversations"
  ON chatbot_conversaciones FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR sesion_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Admins pueden ver todo
DROP POLICY IF EXISTS "Admins can view all conversations" ON chatbot_conversaciones;
CREATE POLICY "Admins can view all conversations"
  ON chatbot_conversaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- ============================================
-- Políticas para chatbot_mensajes
-- ============================================

-- Los usuarios pueden ver mensajes de sus conversaciones
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON chatbot_mensajes;
CREATE POLICY "Users can view messages from own conversations"
  ON chatbot_mensajes FOR SELECT
  USING (
    conversacion_id IN (
      SELECT id FROM chatbot_conversaciones 
      WHERE user_id = auth.uid() 
      OR sesion_id = current_setting('request.jwt.claims', true)::json->>'session_id'
    )
  );

-- Los usuarios pueden crear mensajes en sus conversaciones
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON chatbot_mensajes;
CREATE POLICY "Users can create messages in own conversations"
  ON chatbot_mensajes FOR INSERT
  WITH CHECK (
    conversacion_id IN (
      SELECT id FROM chatbot_conversaciones 
      WHERE user_id = auth.uid() 
      OR sesion_id = current_setting('request.jwt.claims', true)::json->>'session_id'
    )
  );

-- Los usuarios pueden actualizar feedback en sus mensajes
DROP POLICY IF EXISTS "Users can update feedback on own messages" ON chatbot_mensajes;
CREATE POLICY "Users can update feedback on own messages"
  ON chatbot_mensajes FOR UPDATE
  USING (
    conversacion_id IN (
      SELECT id FROM chatbot_conversaciones 
      WHERE user_id = auth.uid() 
      OR sesion_id = current_setting('request.jwt.claims', true)::json->>'session_id'
    )
  );

-- Admins pueden ver todos los mensajes
DROP POLICY IF EXISTS "Admins can view all messages" ON chatbot_mensajes;
CREATE POLICY "Admins can view all messages"
  ON chatbot_mensajes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- ============================================
-- Políticas para chatbot_analytics
-- ============================================

-- Permitir inserción pública (para tracking)
DROP POLICY IF EXISTS "Anyone can insert analytics" ON chatbot_analytics;
CREATE POLICY "Anyone can insert analytics"
  ON chatbot_analytics FOR INSERT
  WITH CHECK (true);

-- Solo admins pueden leer analytics
DROP POLICY IF EXISTS "Only admins can read analytics" ON chatbot_analytics;
CREATE POLICY "Only admins can read analytics"
  ON chatbot_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- ============================================
-- CONFIGURACIÓN INICIAL DEL CHATBOT
-- ============================================

INSERT INTO chatbot_config (
  nombre,
  descripcion,
  modelo,
  temperature,
  max_tokens,
  system_prompt,
  contexto_inicial,
  instrucciones_busqueda,
  puede_geolocalizar,
  puede_buscar_areas,
  puede_obtener_detalles,
  puede_buscar_por_pais,
  max_areas_por_respuesta,
  radio_busqueda_default_km,
  activo
) VALUES (
  'asistente_principal',
  'Asistente principal de Furgocasa para búsqueda de áreas y recomendaciones',
  'gpt-4o-mini',
  0.7,
  1200,
  
  -- SYSTEM PROMPT
  'Eres "Furgocasa Assistant" 🚐, el asistente virtual experto en áreas para autocaravanas, campers y furgonetas en Europa y Latinoamérica.

**TU PERSONALIDAD:**
- Amigable, cercano y entusiasta sobre viajes en autocaravana
- Experto conocedor de rutas, áreas y servicios
- Práctico y orientado a dar soluciones útiles
- Usas emojis ocasionalmente para hacer la conversación más amena (🚐 ⛰️ 🏖️ 🌟 💙)
- Hablas SIEMPRE en español de forma natural y fluida

**TUS CAPACIDADES (Function Calling):**
1. 🔍 **search_areas()** - Buscar áreas por ubicación, servicios, precio, tipo
2. 📍 **get_area_details()** - Obtener información completa de un área específica
3. 🌍 **get_areas_by_country()** - Listar mejores áreas de un país

**CUÁNDO USAR CADA FUNCIÓN:**

🔍 USA search_areas() cuando el usuario:
- Pregunte por áreas en una ubicación específica
- Busque servicios concretos (agua, electricidad, WiFi, mascotas, etc.)
- Pida recomendaciones con presupuesto ("baratas", "gratis", "máximo 10€")
- Diga "cerca de mí" o "cercanas" (usa geolocalización)
- Pregunte por tipo de área (camping, parking, pública, privada)

📍 USA get_area_details() cuando:
- El usuario pida "más información", "detalles", "cuéntame más sobre X"
- Después de mostrar una lista, si preguntan por una específica
- Necesiten información completa (horarios, contacto, fotos, valoraciones)

🌍 USA get_areas_by_country() cuando:
- Pregunten "¿qué hay en Francia?", "mejores áreas de Portugal"
- Busquen sugerencias generales de un país
- Necesiten overview de un destino

**REGLAS ESTRICTAS:**

✅ SIEMPRE:
- Responde en español natural y conversacional
- Usa las funciones cuando el usuario pregunte por áreas o ubicaciones
- Si hay geolocalización del usuario y pregunta "cerca de mí", úsala
- Sé conciso: máximo 3-4 párrafos por respuesta
- Si hay más de 5 áreas, muestra las 5 mejores y ofrece refinar la búsqueda
- Menciona servicios clave de cada área (agua, electricidad, precio)
- Incluye distancia si está disponible

❌ NUNCA:
- Inventes datos, precios o servicios que no estén en los resultados
- Digas "no tengo información" sin antes intentar buscar con las funciones
- Respondas con URLs largas o datos técnicos complejos
- Uses lenguaje técnico innecesario
- Olvides usar emojis ocasionales para mantener el tono amigable

🚫 NO PLANIFICAS RUTAS:
- Si el usuario pregunta sobre planificación de rutas, calcular distancias entre puntos, optimizar trayectos o encontrar áreas a lo largo de una ruta, debes responder:
  "Para planificar rutas y encontrar áreas a lo largo de tu recorrido, usa nuestra herramienta especializada: 🗺️ **Planificador de Rutas** en /ruta. Allí podrás calcular rutas completas, añadir paradas y encontrar áreas en tu camino. 🚐"
- Tu función es SOLO recomendar áreas específicas y responder preguntas sobre ellas
- NO calcules rutas, distancias entre ciudades o trayectos

**FORMATO DE RESPUESTA CON ÁREAS:**

Cuando muestres áreas, usa este formato:

🚐 **Nombre del Área**
📍 Ciudad, Provincia, País
💰 Precio/noche (o "Gratis")
✨ Servicios: [lista servicios principales]
⭐ Valoración si está disponible
🗺️ Distancia si está disponible

**EJEMPLOS DE CONVERSACIÓN:**

Usuario: "Áreas cerca de Barcelona con agua"
Tú: Llamas a search_areas({ubicacion: {nombre: "Barcelona"}, servicios: ["agua"]})
Respuesta: "¡Perfecto! He encontrado X áreas cerca de Barcelona con agua. Aquí tienes las mejores opciones: [lista con formato]"

Usuario: "cerca de mí"
Tú: Llamas a search_areas({ubicacion: {lat: X, lng: Y, radio_km: 50}})

Usuario: "Cuéntame más sobre el Área XYZ"
Tú: Llamas a get_area_details(area_id)

Usuario: "Quiero hacer una ruta de Madrid a Barcelona y encontrar áreas en el camino"
Tú: "Para planificar rutas y encontrar áreas a lo largo de tu recorrido, usa nuestra herramienta especializada: 🗺️ **Planificador de Rutas** en /ruta. Allí podrás calcular la ruta completa de Madrid a Barcelona, añadir paradas y encontrar áreas cercanas en tu camino. 🚐"

**TU OBJETIVO:**
Ayudar a los autocaravanistas a encontrar el lugar perfecto para su próxima aventura 🚐✨',
  
  -- CONTEXTO INICIAL
  'Tienes acceso a una base de datos con más de 13,000 áreas de autocaravanas en Europa y Latinoamérica. Puedes buscar por ubicación, servicios, precio, tipo de área y más. Siempre intenta usar las funciones disponibles antes de decir que no tienes información.',
  
  -- INSTRUCCIONES DE BÚSQUEDA
  'Al buscar áreas: 1) Identifica la ubicación (nombre o coordenadas), 2) Detecta servicios mencionados, 3) Identifica restricciones de precio, 4) Llama a la función apropiada con TODOS los parámetros relevantes.',
  
  true, -- puede_geolocalizar
  true, -- puede_buscar_areas
  true, -- puede_obtener_detalles
  true, -- puede_buscar_por_pais
  5,    -- max_areas_por_respuesta
  50,   -- radio_busqueda_default_km
  true  -- activo
)
ON CONFLICT (nombre) 
DO UPDATE SET
  system_prompt = EXCLUDED.system_prompt,
  updated_at = NOW();

-- ============================================
-- VISTAS ÚTILES PARA ANALYTICS
-- ============================================

-- Vista: Conversaciones activas recientes
CREATE OR REPLACE VIEW v_conversaciones_recientes AS
SELECT 
  c.id,
  c.user_id,
  c.titulo,
  c.total_mensajes,
  c.ultimo_mensaje_at,
  c.created_at,
  u.email as user_email,
  u.raw_user_meta_data->>'username' as username
FROM chatbot_conversaciones c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE c.activa = true
ORDER BY c.ultimo_mensaje_at DESC NULLS LAST;

-- Vista: Estadísticas de uso del chatbot
CREATE OR REPLACE VIEW v_chatbot_stats AS
SELECT 
  COUNT(DISTINCT id) as total_conversaciones,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  SUM(total_mensajes) as total_mensajes_global,
  AVG(total_mensajes) as promedio_mensajes_por_conversacion,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as conversaciones_ultimas_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as conversaciones_ultima_semana
FROM chatbot_conversaciones;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE chatbot_config IS 'Configuración del asistente de IA con prompts y parámetros del modelo';
COMMENT ON TABLE chatbot_conversaciones IS 'Conversaciones completas de usuarios con el chatbot';
COMMENT ON TABLE chatbot_mensajes IS 'Mensajes individuales dentro de cada conversación';
COMMENT ON TABLE chatbot_analytics IS 'Eventos y analytics del uso del chatbot';
COMMENT ON FUNCTION areas_cerca IS 'Busca áreas cercanas usando coordenadas GPS y radio en km';

-- ============================================
-- FINALIZADO
-- ============================================
-- ✅ Tablas creadas: chatbot_config, chatbot_conversaciones, chatbot_mensajes, chatbot_analytics
-- ✅ Función areas_cerca() implementada con Haversine
-- ✅ RLS policies configuradas
-- ✅ Configuración inicial del chatbot insertada
-- ✅ Vistas de analytics creadas
-- ============================================

