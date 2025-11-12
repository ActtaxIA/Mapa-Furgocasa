-- =====================================================
-- SISTEMA DE VALORACIÓN ECONÓMICA Y MERCADO
-- =====================================================
-- Sistema para registrar precios de compra/venta,
-- seguimiento de costes totales, depreciación,
-- y datos de mercado de autocaravanas
-- =====================================================

-- ============================================
-- TABLA: vehiculo_valoracion_economica
-- ============================================
-- Datos económicos y valoración del vehículo

CREATE TABLE IF NOT EXISTS vehiculo_valoracion_economica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL UNIQUE REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- COMPRA ORIGINAL
  precio_compra DECIMAL(12,2), -- Precio que pagó el usuario
  fecha_compra DATE,
  procedencia VARCHAR(100), -- 'Nueva', 'Segunda mano', 'Importación'
  lugar_compra VARCHAR(255), -- Concesionario, particular, etc.
  kilometros_compra INTEGER,

  -- FINANCIACIÓN
  financiado BOOLEAN DEFAULT false,
  importe_financiado DECIMAL(12,2),
  cuota_mensual DECIMAL(10,2),
  plazo_meses INTEGER,
  pendiente_pago DECIMAL(12,2),

  -- INVERSIÓN TOTAL ACUMULADA (calculado automáticamente)
  total_mantenimientos DECIMAL(12,2) DEFAULT 0,
  total_averias DECIMAL(12,2) DEFAULT 0,
  total_mejoras DECIMAL(12,2) DEFAULT 0,
  total_seguros DECIMAL(12,2) DEFAULT 0,
  total_impuestos DECIMAL(12,2) DEFAULT 0,
  total_otros_gastos DECIMAL(12,2) DEFAULT 0,
  inversion_total DECIMAL(12,2) DEFAULT 0, -- Compra + todos los gastos

  -- VALORACIÓN ACTUAL
  valor_estimado_actual DECIMAL(12,2),
  fecha_ultima_valoracion DATE,
  metodo_valoracion VARCHAR(100), -- 'Mercado', 'Tasador', 'Estimación propia', 'IA'
  notas_valoracion TEXT,

  -- DEPRECIACIÓN
  depreciacion_anual_porcentaje DECIMAL(5,2), -- % de depreciación por año
  valor_residual_estimado DECIMAL(12,2), -- Valor estimado en X años

  -- VENTA (si el vehículo se vende)
  en_venta BOOLEAN DEFAULT false,
  precio_venta_deseado DECIMAL(12,2),
  precio_venta_minimo DECIMAL(12,2),
  fecha_puesta_venta DATE,
  vendido BOOLEAN DEFAULT false,
  precio_venta_final DECIMAL(12,2),
  fecha_venta DATE,
  ganancia_perdida DECIMAL(12,2), -- Calculado: precio_venta_final - inversion_total

  -- COMPARTIR DATOS CON LA COMUNIDAD
  compartir_datos_compra BOOLEAN DEFAULT false, -- Precio de compra anónimo
  compartir_datos_venta BOOLEAN DEFAULT false, -- Precio de venta anónimo
  compartir_datos_costes BOOLEAN DEFAULT false, -- Costes de mantenimiento anónimos

  -- Metadata
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_valoracion_vehiculo ON vehiculo_valoracion_economica(vehiculo_id);
CREATE INDEX idx_valoracion_user ON vehiculo_valoracion_economica(user_id);
CREATE INDEX idx_valoracion_en_venta ON vehiculo_valoracion_economica(en_venta) WHERE en_venta = true;
CREATE INDEX idx_valoracion_vendido ON vehiculo_valoracion_economica(vendido) WHERE vendido = true;

COMMENT ON TABLE vehiculo_valoracion_economica IS 'Valoración económica completa del vehículo';
COMMENT ON COLUMN vehiculo_valoracion_economica.inversion_total IS 'Suma total de compra + todos los gastos acumulados';
COMMENT ON COLUMN vehiculo_valoracion_economica.ganancia_perdida IS 'Beneficio o pérdida al vender: precio_venta - inversion_total';


-- ============================================
-- TABLA: datos_mercado_autocaravanas
-- ============================================
-- Base de datos de precios de mercado (anónimos)
-- para análisis de tendencias y valoraciones

CREATE TABLE IF NOT EXISTS datos_mercado_autocaravanas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- IDENTIFICACIÓN DEL VEHÍCULO (anónimo)
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  año INTEGER NOT NULL,

  -- CARACTERÍSTICAS PRINCIPALES
  homologacion VARCHAR(50), -- 'Autocaravana', 'Furgoneta camperizada'
  largo_cm INTEGER,
  plazas_dormir INTEGER,
  motorizado_por VARCHAR(100), -- 'Fiat Ducato', 'Mercedes Sprinter', etc.
  tipo_combustible VARCHAR(50),

  -- DATOS ECONÓMICOS
  tipo_dato VARCHAR(50) NOT NULL, -- 'compra', 'venta', 'venta_anuncio'
  precio DECIMAL(12,2) NOT NULL,
  fecha_transaccion DATE NOT NULL,
  kilometros INTEGER,
  estado VARCHAR(50), -- 'Excelente', 'Muy bueno', 'Bueno', 'Regular'

  -- ORIGEN DEL DATO
  origen VARCHAR(100), -- 'Usuario app', 'Scraping web', 'API terceros', 'Manual'
  pais VARCHAR(100) DEFAULT 'España',
  region VARCHAR(100),

  -- EQUIPAMIENTO (opcional, para afinar valoraciones)
  tiene_placa_solar BOOLEAN,
  tiene_calefaccion BOOLEAN,
  tipo_calefaccion VARCHAR(100),
  capacidad_agua_litros INTEGER,

  -- CONTRIBUCIÓN DE USUARIOS (anónimo)
  contribuido_por_usuario BOOLEAN DEFAULT false,
  vehiculo_id_original UUID, -- Solo para referencia interna, no se expone públicamente

  -- Metadata
  verificado BOOLEAN DEFAULT false, -- Si ha sido verificado por admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas y análisis
CREATE INDEX idx_mercado_marca_modelo ON datos_mercado_autocaravanas(marca, modelo);
CREATE INDEX idx_mercado_año ON datos_mercado_autocaravanas(año);
CREATE INDEX idx_mercado_precio ON datos_mercado_autocaravanas(precio);
CREATE INDEX idx_mercado_fecha ON datos_mercado_autocaravanas(fecha_transaccion DESC);
CREATE INDEX idx_mercado_tipo_dato ON datos_mercado_autocaravanas(tipo_dato);
CREATE INDEX idx_mercado_verificado ON datos_mercado_autocaravanas(verificado);

COMMENT ON TABLE datos_mercado_autocaravanas IS 'Base de datos anónima de precios de mercado para valoraciones';
COMMENT ON COLUMN datos_mercado_autocaravanas.tipo_dato IS 'compra, venta, venta_anuncio';


-- ============================================
-- TABLA: historico_precios_usuario
-- ============================================
-- Registro histórico de valoraciones del vehículo
-- para ver evolución del valor en el tiempo

CREATE TABLE IF NOT EXISTS historico_precios_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- VALORACIÓN
  fecha_valoracion DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_estimado DECIMAL(12,2) NOT NULL,
  kilometros_en_momento INTEGER,

  -- MÉTODO Y ORIGEN
  metodo VARCHAR(100), -- 'Tasador profesional', 'Valoración online', 'Estimación propia', 'IA/Algoritmo'
  fuente VARCHAR(255), -- Nombre del tasador, web, etc.
  documento_url TEXT, -- PDF del informe de tasación

  -- FACTORES DE LA VALORACIÓN
  estado_general VARCHAR(50), -- 'Excelente', 'Muy bueno', 'Bueno', 'Regular', 'Malo'
  factores_positivos TEXT[], -- ['Bajo kilometraje', 'Placa solar nueva', etc.]
  factores_negativos TEXT[], -- ['Abolladura lateral', 'Motor con ruido', etc.]

  -- Metadata
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_historico_vehiculo ON historico_precios_usuario(vehiculo_id);
CREATE INDEX idx_historico_fecha ON historico_precios_usuario(fecha_valoracion DESC);

COMMENT ON TABLE historico_precios_usuario IS 'Historial de valoraciones del vehículo a lo largo del tiempo';


-- ============================================
-- TABLA: gastos_adicionales
-- ============================================
-- Gastos no cubiertos por otras tablas
-- (seguros, impuestos, parking, peajes, etc.)

CREATE TABLE IF NOT EXISTS gastos_adicionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos_registrados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- INFORMACIÓN DEL GASTO
  categoria VARCHAR(100) NOT NULL, -- 'Seguro', 'Impuestos', 'Parking', 'Peajes', 'Limpieza', 'Accesorios', 'Otro'
  subcategoria VARCHAR(100), -- 'Seguro todo riesgo', 'IBI', 'Parking mensual', etc.
  descripcion TEXT NOT NULL,

  -- IMPORTE
  importe DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,

  -- RECURRENCIA (para gastos periódicos)
  es_recurrente BOOLEAN DEFAULT false,
  frecuencia VARCHAR(50), -- 'Mensual', 'Trimestral', 'Anual'
  proximo_vencimiento DATE,

  -- ADJUNTOS
  factura_url TEXT,
  documentos_urls TEXT[],

  -- Metadata
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_gastos_vehiculo ON gastos_adicionales(vehiculo_id);
CREATE INDEX idx_gastos_user ON gastos_adicionales(user_id);
CREATE INDEX idx_gastos_categoria ON gastos_adicionales(categoria);
CREATE INDEX idx_gastos_fecha ON gastos_adicionales(fecha DESC);
CREATE INDEX idx_gastos_recurrentes ON gastos_adicionales(es_recurrente) WHERE es_recurrente = true;

COMMENT ON TABLE gastos_adicionales IS 'Gastos adicionales no incluidos en mantenimiento o averías';


-- ============================================
-- VISTA: resumen_economico_vehiculo
-- ============================================
-- Vista consolidada de todos los datos económicos

CREATE OR REPLACE VIEW resumen_economico_vehiculo AS
SELECT
  v.id as vehiculo_id,
  v.matricula,
  v.marca,
  v.modelo,
  v.año,
  v.user_id,

  -- Datos de compra
  ve.precio_compra,
  ve.fecha_compra,
  ve.kilometros_compra,

  -- Costes acumulados
  ve.total_mantenimientos,
  ve.total_averias,
  ve.total_mejoras,
  ve.total_seguros,
  ve.total_impuestos,
  ve.total_otros_gastos,
  ve.inversion_total,

  -- Valoración actual
  ve.valor_estimado_actual,
  ve.fecha_ultima_valoracion,

  -- Depreciación
  CASE
    WHEN ve.precio_compra IS NOT NULL AND ve.precio_compra > 0 AND ve.valor_estimado_actual IS NOT NULL
    THEN ((ve.precio_compra - ve.valor_estimado_actual) / ve.precio_compra * 100)
    ELSE NULL
  END as depreciacion_porcentaje,

  -- Estado de venta
  ve.en_venta,
  ve.precio_venta_deseado,
  ve.vendido,
  ve.precio_venta_final,
  ve.fecha_venta,
  ve.ganancia_perdida,

  -- ROI (Return on Investment)
  CASE
    WHEN ve.vendido AND ve.precio_venta_final IS NOT NULL AND ve.inversion_total > 0
    THEN ((ve.precio_venta_final - ve.inversion_total) / ve.inversion_total * 100)
    ELSE NULL
  END as roi_porcentaje,

  -- Kilometraje actual (último registro)
  (SELECT kilometros FROM vehiculo_kilometraje
   WHERE vehiculo_id = v.id
   ORDER BY fecha DESC, created_at DESC
   LIMIT 1) as kilometros_actual,

  -- Coste por kilómetro (solo si vendido)
  CASE
    WHEN ve.vendido
    THEN (
      SELECT CASE
        WHEN (km_fin.kilometros - COALESCE(ve.kilometros_compra, 0)) > 0
        THEN ve.inversion_total / (km_fin.kilometros - COALESCE(ve.kilometros_compra, 0))
        ELSE NULL
      END
      FROM (
        SELECT kilometros FROM vehiculo_kilometraje
        WHERE vehiculo_id = v.id
        ORDER BY fecha DESC
        LIMIT 1
      ) km_fin
    )
    ELSE NULL
  END as coste_por_kilometro,

  ve.created_at,
  ve.updated_at

FROM vehiculos_registrados v
LEFT JOIN vehiculo_valoracion_economica ve ON v.id = ve.vehiculo_id
WHERE v.activo = true;

COMMENT ON VIEW resumen_economico_vehiculo IS 'Vista consolidada de todos los datos económicos del vehículo';


-- ============================================
-- VISTA: estadisticas_mercado_por_modelo
-- ============================================
-- Estadísticas de mercado agrupadas por marca/modelo

CREATE OR REPLACE VIEW estadisticas_mercado_por_modelo AS
SELECT
  marca,
  modelo,
  año,
  tipo_dato,
  COUNT(*) as num_registros,
  AVG(precio) as precio_medio,
  MIN(precio) as precio_minimo,
  MAX(precio) as precio_maximo,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precio) as precio_mediano,
  AVG(kilometros) as kilometros_medio,
  MIN(fecha_transaccion) as fecha_primera_transaccion,
  MAX(fecha_transaccion) as fecha_ultima_transaccion
FROM datos_mercado_autocaravanas
WHERE verificado = true
GROUP BY marca, modelo, año, tipo_dato
HAVING COUNT(*) >= 3; -- Solo mostrar si hay al menos 3 datos

COMMENT ON VIEW estadisticas_mercado_por_modelo IS 'Estadísticas de precios de mercado por marca/modelo/año';


-- ============================================
-- MENSAJES DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tablas de valoración económica creadas correctamente:';
  RAISE NOTICE '   - vehiculo_valoracion_economica';
  RAISE NOTICE '   - datos_mercado_autocaravanas';
  RAISE NOTICE '   - historico_precios_usuario';
  RAISE NOTICE '   - gastos_adicionales';
  RAISE NOTICE '   - resumen_economico_vehiculo (vista)';
  RAISE NOTICE '   - estadisticas_mercado_por_modelo (vista)';
END $$;
