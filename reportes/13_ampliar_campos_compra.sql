-- =====================================================
-- AMPLIACIÓN DE CAMPOS DE COMPRA
-- =====================================================
-- Añade campos adicionales a la tabla vehiculo_valoracion_economica
-- para capturar información detallada de la compra
-- =====================================================

-- Campos adicionales para información detallada del vendedor
ALTER TABLE vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS tipo_vendedor VARCHAR(100),
ADD COLUMN IF NOT EXISTS nombre_vendedor VARCHAR(255),
ADD COLUMN IF NOT EXISTS pais_compra VARCHAR(100),
ADD COLUMN IF NOT EXISTS ciudad_compra VARCHAR(255);

-- Campos sobre el estado del vehículo en la compra
ALTER TABLE vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS estado_general VARCHAR(50),
ADD COLUMN IF NOT EXISTS num_propietarios_anteriores INTEGER,
ADD COLUMN IF NOT EXISTS libro_mantenimiento BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS itv_al_dia BOOLEAN DEFAULT false;

-- Campos sobre documentación y garantía
ALTER TABLE vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS tiene_garantia BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meses_garantia INTEGER,
ADD COLUMN IF NOT EXISTS tipo_garantia VARCHAR(100),
ADD COLUMN IF NOT EXISTS transferencia_incluida BOOLEAN DEFAULT false;

-- Campos adicionales de financiación
ALTER TABLE vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS entidad_financiera VARCHAR(255),
ADD COLUMN IF NOT EXISTS tipo_interes DECIMAL(5,2);

-- Campos sobre la negociación
ALTER TABLE vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS precio_inicial DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS descuento_aplicado DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS vehiculo_entregado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS precio_vehiculo_entregado DECIMAL(12,2);

-- Extras incluidos en la compra
ALTER TABLE vehiculo_valoracion_economica
ADD COLUMN IF NOT EXISTS extras_incluidos TEXT;

-- Comentarios sobre los nuevos campos
COMMENT ON COLUMN vehiculo_valoracion_economica.tipo_vendedor IS 'Tipo de vendedor: Concesionario, Particular, Empresa alquiler, Subasta, etc.';
COMMENT ON COLUMN vehiculo_valoracion_economica.nombre_vendedor IS 'Nombre del concesionario o vendedor';
COMMENT ON COLUMN vehiculo_valoracion_economica.estado_general IS 'Estado general del vehículo: Excelente, Muy bueno, Bueno, Regular, Malo';
COMMENT ON COLUMN vehiculo_valoracion_economica.tipo_garantia IS 'Tipo: Oficial del fabricante, Concesionario, Aseguradora, Sin garantía';
COMMENT ON COLUMN vehiculo_valoracion_economica.precio_inicial IS 'Precio inicial pedido antes de negociar';
COMMENT ON COLUMN vehiculo_valoracion_economica.descuento_aplicado IS 'Descuento conseguido en la negociación';
COMMENT ON COLUMN vehiculo_valoracion_economica.vehiculo_entregado IS 'Si se entregó un vehículo a cambio (parte del pago)';
COMMENT ON COLUMN vehiculo_valoracion_economica.extras_incluidos IS 'Lista de extras o accesorios incluidos en la compra';

-- Crear índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_valoracion_tipo_vendedor ON vehiculo_valoracion_economica(tipo_vendedor);
CREATE INDEX IF NOT EXISTS idx_valoracion_pais_compra ON vehiculo_valoracion_economica(pais_compra);
CREATE INDEX IF NOT EXISTS idx_valoracion_procedencia ON vehiculo_valoracion_economica(procedencia);

-- Verificar que los campos se han añadido correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vehiculo_valoracion_economica'
  AND column_name IN (
    'tipo_vendedor', 'nombre_vendedor', 'pais_compra', 'ciudad_compra',
    'estado_general', 'num_propietarios_anteriores', 'libro_mantenimiento', 'itv_al_dia',
    'tiene_garantia', 'meses_garantia', 'tipo_garantia', 'transferencia_incluida',
    'entidad_financiera', 'tipo_interes',
    'precio_inicial', 'descuento_aplicado', 'vehiculo_entregado', 'precio_vehiculo_entregado',
    'extras_incluidos'
  )
ORDER BY column_name;
