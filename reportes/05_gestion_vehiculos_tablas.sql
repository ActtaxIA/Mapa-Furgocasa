-- =====================================================
-- SISTEMA DE GESTIÓN COMPLETA DE VEHÍCULOS
-- =====================================================
-- Este script crea las tablas necesarias para gestionar
-- el mantenimiento, averías, documentos, mejoras y
-- control de kilometraje de las autocaravanas
-- =====================================================

-- ============================================
-- TABLA: mantenimientos
-- ============================================
-- Historial completo de mantenimiento del vehículo
-- (ITV, cambios de aceite, revisiones, etc.)

CREATE TABLE IF NOT EXISTS mantenimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del mantenimiento
  tipo VARCHAR(100) NOT NULL, -- 'ITV', 'Cambio aceite', 'Revisión', 'Neumáticos', 'Frenos', 'Gas', 'Electricidad', 'Agua', 'Batería', 'Otro'
  fecha DATE NOT NULL,
  kilometraje INTEGER,
  descripcion TEXT,
  coste DECIMAL(10,2),

  -- Recordatorios
  proximo_mantenimiento DATE, -- Para alertas
  kilometraje_proximo INTEGER, -- km para próximo mantenimiento
  alertar_dias_antes INTEGER DEFAULT 30, -- Días antes de avisar

  -- Información del taller/servicio
  taller VARCHAR(255),
  direccion_taller TEXT,
  telefono_taller VARCHAR(50),

  -- Adjuntos
  fotos_urls TEXT[], -- URLs de fotos (facturas, trabajos, etc.)
  documentos_urls TEXT[], -- PDFs de facturas, garantías

  -- Metadata
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT mantenimientos_coste_positivo CHECK (coste >= 0),
  CONSTRAINT mantenimientos_kilometraje_positivo CHECK (kilometraje >= 0)
);

-- Índices para mantenimientos
CREATE INDEX idx_mantenimientos_vehiculo ON mantenimientos(vehiculo_id);
CREATE INDEX idx_mantenimientos_user ON mantenimientos(user_id);
CREATE INDEX idx_mantenimientos_fecha ON mantenimientos(fecha DESC);
CREATE INDEX idx_mantenimientos_tipo ON mantenimientos(tipo);
CREATE INDEX idx_mantenimientos_proximo ON mantenimientos(proximo_mantenimiento) WHERE proximo_mantenimiento IS NOT NULL;

COMMENT ON TABLE mantenimientos IS 'Historial de mantenimiento y revisiones de vehículos';
COMMENT ON COLUMN mantenimientos.tipo IS 'Tipo de mantenimiento: ITV, Cambio aceite, Revisión, etc.';
COMMENT ON COLUMN mantenimientos.proximo_mantenimiento IS 'Fecha estimada del próximo mantenimiento para alertas';


-- ============================================
-- TABLA: averias
-- ============================================
-- Registro de averías, problemas e incidencias

CREATE TABLE IF NOT EXISTS averias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información de la avería
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_averia DATE NOT NULL,
  kilometraje INTEGER,
  severidad VARCHAR(50) DEFAULT 'media', -- 'baja', 'media', 'alta', 'critica'
  categoria VARCHAR(100), -- 'Motor', 'Electricidad', 'Gas', 'Agua', 'Frenos', 'Suspensión', 'Carrocería', 'Interior', 'Otro'

  -- Estado y resolución
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'diagnosticando', 'en_reparacion', 'resuelto', 'no_reparable'
  fecha_inicio_reparacion DATE,
  fecha_resolucion DATE,
  solucion TEXT, -- Descripción de cómo se resolvió

  -- Información del taller
  taller VARCHAR(255),
  contacto_taller TEXT,
  coste_diagnostico DECIMAL(10,2),
  coste_reparacion DECIMAL(10,2),
  coste_total DECIMAL(10,2),

  -- Garantía
  en_garantia BOOLEAN DEFAULT false,
  garantia_hasta DATE,
  numero_garantia VARCHAR(100),

  -- Adjuntos
  fotos_urls TEXT[], -- Fotos de la avería
  documentos_urls TEXT[], -- Facturas, informes, etc.

  -- Metadata
  es_recurrente BOOLEAN DEFAULT false,
  relacionado_con UUID REFERENCES averias(id), -- Si es recurrente, link a la avería original
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT averias_coste_positivo CHECK (coste_total >= 0),
  CONSTRAINT averias_severidad_valida CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
  CONSTRAINT averias_estado_valido CHECK (estado IN ('pendiente', 'diagnosticando', 'en_reparacion', 'resuelto', 'no_reparable'))
);

-- Índices para averías
CREATE INDEX idx_averias_vehiculo ON averias(vehiculo_id);
CREATE INDEX idx_averias_user ON averias(user_id);
CREATE INDEX idx_averias_estado ON averias(estado);
CREATE INDEX idx_averias_fecha ON averias(fecha_averia DESC);
CREATE INDEX idx_averias_severidad ON averias(severidad);

COMMENT ON TABLE averias IS 'Registro de averías e incidencias de vehículos';
COMMENT ON COLUMN averias.severidad IS 'Nivel de gravedad: baja, media, alta, critica';
COMMENT ON COLUMN averias.estado IS 'Estado actual: pendiente, diagnosticando, en_reparacion, resuelto, no_reparable';


-- ============================================
-- TABLA: vehiculo_documentos
-- ============================================
-- Documentación digital del vehículo

CREATE TABLE IF NOT EXISTS vehiculo_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del documento
  tipo VARCHAR(100) NOT NULL, -- 'ITV', 'Seguro', 'Manual', 'Factura compra', 'Certificado gas', 'Tarjeta técnica', 'Otro'
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,

  -- Archivo
  url TEXT NOT NULL, -- URL en Supabase Storage
  tipo_archivo VARCHAR(50), -- 'pdf', 'image', 'otros'
  tamaño_bytes BIGINT,

  -- Fechas importantes
  fecha_emision DATE,
  fecha_caducidad DATE,
  alertar_dias_antes INTEGER DEFAULT 30,

  -- Información adicional según tipo
  numero_documento VARCHAR(100), -- Número de póliza, certificado, etc.
  entidad_emisora VARCHAR(255), -- Compañía de seguros, administración, etc.

  -- Metadata
  es_importante BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para documentos
CREATE INDEX idx_documentos_vehiculo ON vehiculo_documentos(vehiculo_id);
CREATE INDEX idx_documentos_user ON vehiculo_documentos(user_id);
CREATE INDEX idx_documentos_tipo ON vehiculo_documentos(tipo);
CREATE INDEX idx_documentos_caducidad ON vehiculo_documentos(fecha_caducidad) WHERE fecha_caducidad IS NOT NULL;

COMMENT ON TABLE vehiculo_documentos IS 'Documentación digital de vehículos';
COMMENT ON COLUMN vehiculo_documentos.tipo IS 'Tipo de documento: ITV, Seguro, Manual, etc.';


-- ============================================
-- TABLA: vehiculo_mejoras
-- ============================================
-- Registro de mejoras, modificaciones e instalaciones

CREATE TABLE IF NOT EXISTS vehiculo_mejoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información de la mejora
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(100), -- 'Solar', 'Electricidad', 'Agua', 'Gas', 'Calefacción', 'Aislamiento', 'Muebles', 'Electrodomésticos', 'Exterior', 'Otro'
  fecha DATE NOT NULL,

  -- Costes
  coste_materiales DECIMAL(10,2),
  coste_mano_obra DECIMAL(10,2),
  coste_total DECIMAL(10,2),

  -- Instalación
  instalado_por VARCHAR(100), -- 'DIY', 'Taller', 'Marca del taller'
  tiempo_instalacion VARCHAR(100), -- '2 horas', '1 día', etc.
  dificultad VARCHAR(50), -- 'facil', 'media', 'dificil'

  -- Valoración
  satisfaccion INTEGER, -- 1-5 estrellas
  lo_volveria_hacer BOOLEAN,
  recomendaciones TEXT,

  -- Adjuntos
  fotos_antes_urls TEXT[],
  fotos_despues_urls TEXT[],
  documentos_urls TEXT[], -- Manuales, facturas, guías

  -- Metadata
  es_publica BOOLEAN DEFAULT false, -- Si se puede compartir con la comunidad
  likes INTEGER DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT mejoras_coste_positivo CHECK (coste_total >= 0),
  CONSTRAINT mejoras_satisfaccion_valida CHECK (satisfaccion BETWEEN 1 AND 5),
  CONSTRAINT mejoras_dificultad_valida CHECK (dificultad IN ('facil', 'media', 'dificil'))
);

-- Índices para mejoras
CREATE INDEX idx_mejoras_vehiculo ON vehiculo_mejoras(vehiculo_id);
CREATE INDEX idx_mejoras_user ON vehiculo_mejoras(user_id);
CREATE INDEX idx_mejoras_categoria ON vehiculo_mejoras(categoria);
CREATE INDEX idx_mejoras_fecha ON vehiculo_mejoras(fecha DESC);
CREATE INDEX idx_mejoras_publica ON vehiculo_mejoras(es_publica) WHERE es_publica = true;

COMMENT ON TABLE vehiculo_mejoras IS 'Registro de mejoras y modificaciones realizadas al vehículo';
COMMENT ON COLUMN vehiculo_mejoras.es_publica IS 'Si se comparte con la comunidad como inspiración';


-- ============================================
-- TABLA: vehiculo_kilometraje
-- ============================================
-- Control de kilometraje y consumo de combustible

CREATE TABLE IF NOT EXISTS vehiculo_kilometraje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Lectura del cuentakilómetros
  fecha DATE NOT NULL,
  kilometros INTEGER NOT NULL,

  -- Repostaje (opcional)
  combustible_litros DECIMAL(10,2),
  coste_combustible DECIMAL(10,2),
  precio_litro DECIMAL(10,4), -- Calculado automáticamente
  tipo_combustible VARCHAR(50), -- 'Diesel', 'Gasolina', 'GLP', 'Eléctrico'
  deposito_lleno BOOLEAN DEFAULT false,

  -- Ubicación del repostaje (opcional)
  gasolinera VARCHAR(255),
  ubicacion_lat DECIMAL(10, 8),
  ubicacion_lng DECIMAL(11, 8),
  ciudad VARCHAR(100),
  pais VARCHAR(100),

  -- Cálculos automáticos
  km_desde_ultimo_repostaje INTEGER,
  consumo_medio DECIMAL(10,2), -- litros/100km

  -- Metadata
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT kilometraje_km_positivo CHECK (kilometros >= 0),
  CONSTRAINT kilometraje_combustible_positivo CHECK (combustible_litros IS NULL OR combustible_litros >= 0),
  CONSTRAINT kilometraje_coste_positivo CHECK (coste_combustible IS NULL OR coste_combustible >= 0),
  CONSTRAINT kilometraje_consumo_razonable CHECK (consumo_medio IS NULL OR consumo_medio BETWEEN 1 AND 50)
);

-- Índices para kilometraje
CREATE INDEX idx_kilometraje_vehiculo ON vehiculo_kilometraje(vehiculo_id);
CREATE INDEX idx_kilometraje_user ON vehiculo_kilometraje(user_id);
CREATE INDEX idx_kilometraje_fecha ON vehiculo_kilometraje(fecha DESC);
CREATE INDEX idx_kilometraje_km ON vehiculo_kilometraje(kilometros DESC);

COMMENT ON TABLE vehiculo_kilometraje IS 'Control de kilometraje y consumo de combustible';
COMMENT ON COLUMN vehiculo_kilometraje.consumo_medio IS 'Consumo en litros/100km calculado automáticamente';


-- ============================================
-- TABLA: vehiculo_ficha_tecnica
-- ============================================
-- Datos técnicos completos del vehículo
-- Extiende la información básica de vehiculos_registrados

CREATE TABLE IF NOT EXISTS vehiculo_ficha_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL UNIQUE REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dimensiones
  largo_cm INTEGER,
  ancho_cm INTEGER,
  alto_cm INTEGER,

  -- Pesos
  mma_kg INTEGER, -- Masa Máxima Autorizada
  tara_kg INTEGER, -- Peso en vacío
  carga_util_kg INTEGER, -- Calculado: MMA - Tara

  -- Capacidades
  deposito_agua_limpia_litros INTEGER,
  deposito_aguas_grises_litros INTEGER,
  deposito_aguas_negras_litros INTEGER,
  deposito_combustible_litros INTEGER,
  deposito_gas_kg INTEGER,

  -- Plazas
  plazas_viajar INTEGER,
  plazas_dormir INTEGER,

  -- Motor
  marca_motor VARCHAR(100),
  modelo_motor VARCHAR(100),
  cilindrada_cc INTEGER,
  potencia_cv INTEGER,
  potencia_kw INTEGER,
  tipo_combustible VARCHAR(50), -- 'Diesel', 'Gasolina', 'GLP', 'Híbrido', 'Eléctrico'
  transmision VARCHAR(50), -- 'Manual', 'Automática', 'Semiautomática'
  traccion VARCHAR(50), -- '4x2', '4x4'
  normativa_emisiones VARCHAR(50), -- 'Euro 6d', 'Euro 5', etc.

  -- Consumo oficial
  consumo_urbano_oficial DECIMAL(5,2),
  consumo_carretera_oficial DECIMAL(5,2),
  consumo_mixto_oficial DECIMAL(5,2),

  -- Equipamiento
  aire_acondicionado BOOLEAN DEFAULT false,
  calefaccion BOOLEAN DEFAULT false,
  tipo_calefaccion VARCHAR(100), -- 'Truma', 'Webasto', 'Alde', etc.
  placa_solar BOOLEAN DEFAULT false,
  potencia_solar_w INTEGER,
  nevera VARCHAR(100), -- 'Compresor', 'Absorción', 'Termoeléctrica'
  capacidad_nevera_litros INTEGER,

  -- Baterías
  bateria_motor_ah INTEGER,
  bateria_auxiliar_ah INTEGER,
  tipo_bateria_auxiliar VARCHAR(50), -- 'AGM', 'Litio', 'Gel', 'Plomo-ácido'

  -- Otros
  homologacion VARCHAR(100), -- 'Autocaravana', 'Furgoneta camperizada', 'Camper'
  numero_bastidor VARCHAR(100), -- VIN
  fecha_primera_matriculacion DATE,
  fecha_compra DATE,
  precio_compra DECIMAL(10,2),
  procedencia VARCHAR(100), -- 'Nueva', 'Segunda mano', 'Importación'

  -- Metadata
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT ficha_carga_util_correcta CHECK (carga_util_kg = mma_kg - tara_kg OR carga_util_kg IS NULL)
);

-- Índices para ficha técnica
CREATE INDEX idx_ficha_tecnica_vehiculo ON vehiculo_ficha_tecnica(vehiculo_id);
CREATE INDEX idx_ficha_tecnica_user ON vehiculo_ficha_tecnica(user_id);

COMMENT ON TABLE vehiculo_ficha_tecnica IS 'Ficha técnica completa del vehículo con todos los datos técnicos';
COMMENT ON COLUMN vehiculo_ficha_tecnica.mma_kg IS 'Masa Máxima Autorizada en kg';
COMMENT ON COLUMN vehiculo_ficha_tecnica.carga_util_kg IS 'Carga útil calculada: MMA - Tara';


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tablas de gestión de vehículos creadas correctamente:';
  RAISE NOTICE '   - mantenimientos';
  RAISE NOTICE '   - averias';
  RAISE NOTICE '   - vehiculo_documentos';
  RAISE NOTICE '   - vehiculo_mejoras';
  RAISE NOTICE '   - vehiculo_kilometraje';
  RAISE NOTICE '   - vehiculo_ficha_tecnica';
END $$;
