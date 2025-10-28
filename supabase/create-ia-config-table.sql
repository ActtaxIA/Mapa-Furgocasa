-- ===================================================================
-- CREAR TABLA ia_config
-- ===================================================================
-- Esta tabla almacena la configuración de los agentes de IA
-- Debe ejecutarse en Supabase SQL Editor
-- ===================================================================

-- Crear la tabla
CREATE TABLE IF NOT EXISTS public.ia_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por config_key
CREATE INDEX IF NOT EXISTS idx_ia_config_key ON public.ia_config (config_key);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_ia_config_updated_at
  BEFORE UPDATE ON public.ia_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.ia_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo administradores pueden leer y modificar
DROP POLICY IF EXISTS "Solo admin puede leer ia_config" ON public.ia_config;
DROP POLICY IF EXISTS "Solo admin puede actualizar ia_config" ON public.ia_config;

CREATE POLICY "Solo admin puede leer ia_config"
  ON public.ia_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

CREATE POLICY "Solo admin puede actualizar ia_config"
  ON public.ia_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- ===================================================================
-- INSERTAR CONFIGURACIONES POR DEFECTO
-- ===================================================================

-- Configuración: scrape_services (Actualizar Servicios)
INSERT INTO public.ia_config (config_key, config_value, descripcion)
VALUES (
  'scrape_services',
  '{
    "model": "gpt-4o-mini",
    "temperature": 0.1,
    "max_tokens": 300,
    "prompts": [
      {
        "id": "sys-1",
        "role": "system",
        "content": "Eres un auditor crítico que analiza información sobre áreas de autocaravanas. Solo confirmas servicios con evidencia explícita. Respondes únicamente con JSON válido, sin texto adicional.",
        "order": 1,
        "required": true
      },
      {
        "id": "user-1",
        "role": "user",
        "content": "Eres un analista experto de áreas de autocaravanas. Tu trabajo es identificar servicios disponibles basándote en la información recopilada de múltiples fuentes.\n\nCONTEXTO SOBRE LAS FUENTES:\nLa información puede venir de:\n1. WEB OFICIAL DEL ÁREA (máxima prioridad y fiabilidad)\n2. PLATAFORMAS ESPECIALIZADAS (Park4night, Caramaps - alta fiabilidad)\n3. GOOGLE MAPS (opiniones de usuarios - fiabilidad media)\n4. INFORMACIÓN GENERAL (buscadores - baja fiabilidad)\n\nREGLAS DE ANÁLISIS:\n✓ Si la WEB OFICIAL menciona un servicio → marca true (máxima confianza)\n✓ Si Park4night o plataformas especializadas lo confirman → marca true (alta confianza)\n✓ Si múltiples reviews de Google Maps lo mencionan → marca true (confianza media)\n✓ Si dice \"área equipada\", \"servicios completos\", \"todos los servicios\" → marca true para: agua, electricidad, vaciado_aguas_negras, vaciado_aguas_grises, wc\n✓ Si dice \"área de servicios para autocaravanas\" → marca true para: agua, vaciado_aguas_negras, vaciado_aguas_grises\n✓ Si menciona \"camping\" con el nombre del área → marca true para: agua, electricidad, wc, duchas (los campings siempre tienen esto)\n\nIMPORTANTE:\n- NO marques servicios de OTRAS áreas diferentes\n- Si el texto menciona \"cerca hay un bar/supermercado\" pero NO está en el área → marca false\n- Sé razonablemente flexible: si hay evidencia sólida de fuentes fiables, confirma el servicio\n\nÁREA A ANALIZAR:\nNombre: {{area_nombre}}\nCiudad: {{area_ciudad}}\nProvincia: {{area_provincia}}\n\nINFORMACIÓN RECOPILADA:\n{{texto_analizar}}\n\nRESPONDE SOLO CON JSON (sin texto adicional):\n{\n  \"agua\": true/false,\n  \"electricidad\": true/false,\n  \"vaciado_aguas_negras\": true/false,\n  \"vaciado_aguas_grises\": true/false,\n  \"wifi\": true/false,\n  \"duchas\": true/false,\n  \"wc\": true/false,\n  \"lavanderia\": true/false,\n  \"restaurante\": true/false,\n  \"supermercado\": true/false,\n  \"zona_mascotas\": true/false\n}",
        "order": 2,
        "required": false
      }
    ]
  }'::jsonb,
  'Agente que analiza información web para detectar servicios disponibles en áreas de autocaravanas'
)
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW();

-- Configuración: enrich_description (Enriquecer Textos)
INSERT INTO public.ia_config (config_key, config_value, descripcion)
VALUES (
  'enrich_description',
  '{
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 1500,
    "prompts": [
      {
        "id": "sys-1",
        "role": "system",
        "content": "Eres un redactor experto en guías de viaje para autocaravanas. Escribes textos informativos, naturales y bien estructurados en español.",
        "order": 1,
        "required": true
      },
      {
        "id": "user-1",
        "role": "user",
        "content": "Eres un redactor especializado en autocaravanas, campers y viajes.\nTu misión es crear contenido detallado para un Mapa de Áreas de Autocaravanas dirigido a viajeros en autocaravanas, caravanas y campers.\n\n{{contexto}}\n\n⚠️ ADVERTENCIA CRÍTICA SOBRE LA INFORMACIÓN:\nEl contexto arriba muestra claramente el nombre del área, ciudad y provincia que debes describir.\nLa información turística puede ser genérica. Tu tarea es escribir ESPECÍFICAMENTE sobre la ciudad indicada en \"ÁREA ESPECÍFICA QUE DEBES DESCRIBIR\", NO sobre otras ciudades mencionadas en el contexto web.\n\nTU TAREA:\nCrear un texto extenso y detallado (400-600 palabras) DIVIDIDO EN 4-5 PÁRRAFOS SEPARADOS que combine:\n1. Información específica del área de autocaravanas mencionada arriba\n2. Guía turística de la ciudad especificada arriba\n3. Información práctica para el viajero\n\nFORMATO OBLIGATORIO - MUY IMPORTANTE:\nEscribe en 4-5 párrafos. Separa CADA párrafo con DOS SALTOS DE LÍNEA (deja una línea en blanco entre párrafos).\n\nEstructura:\nPárrafo 1: Introducción al área y su ubicación (2-3 líneas)\n\nPárrafo 2: Servicios, plazas, precio y características del área (3-4 líneas)\n\nPárrafo 3: Atractivos turísticos de la ciudad (3-4 líneas)\n\nPárrafo 4: Gastronomía, cultura y otros atractivos (3-4 líneas)\n\nPárrafo 5: Conclusión práctica para el viajero (2-3 líneas)\n\nREGLAS ESTRICTAS:\n✓ SOLO describe la ciudad y área mostrada en \"ÁREA ESPECÍFICA QUE DEBES DESCRIBIR\"\n✓ Si el contexto web menciona otra ciudad diferente, IGNÓRALA completamente\n✓ Información veraz basada ÚNICAMENTE en el contexto de la ciudad correcta\n✓ Sobre SERVICIOS: Solo menciona los servicios marcados con ✅. Si dice \"No hay servicios confirmados\", NO menciones servicios específicos\n✓ Si no hay servicios confirmados, céntrate SOLO en el entorno, la localidad, atractivos turísticos, gastronomía, historia\n✓ Siempre di \"el área de autocaravanas\" o \"el área de {{area_nombre}}\" (nunca \"esta área\")\n✓ Tono informativo y útil, sin ser excesivamente pomposo\n✓ Escribe en español de forma natural y fluida\n\nNUNCA, BAJO NINGÚN CONCEPTO:\n✗ Describir otra ciudad que no sea la especificada en \"ÁREA ESPECÍFICA\"\n✗ Mencionar la dirección del área (ya está en el mapa)\n✗ Usar frases como \"no dispongo de información\", \"no existe información\"\n✗ Recomendar \"verificar los servicios en el momento de la visita\"\n✗ Inventar o suponer servicios con \"posiblemente\", \"probablemente\", \"suele tener\"\n✗ Decir constantemente \"destino ideal\", \"maravilloso\"\n✗ Mencionar servicios que NO tienen ✅ en \"Servicios confirmados\"\n✗ Usar listas de puntos (•, -, 1., 2., etc.)\n\nEscribe en párrafos separados por líneas en blanco. Texto fluido y natural.",
        "order": 2,
        "required": false
      }
    ]
  }'::jsonb,
  'Agente que genera descripciones detalladas y atractivas para áreas de autocaravanas'
)
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW();

-- Verificar que se crearon correctamente
SELECT 
  config_key, 
  descripcion,
  jsonb_pretty(config_value) as config
FROM public.ia_config
ORDER BY config_key;

