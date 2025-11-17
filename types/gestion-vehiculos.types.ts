// =====================================================
// TIPOS TYPESCRIPT - GESTIÓN DE VEHÍCULOS
// =====================================================

// ============================================
// MANTENIMIENTOS
// ============================================

export interface Mantenimiento {
  id: string
  vehiculo_id: string
  user_id: string
  tipo: 'ITV' | 'Cambio aceite' | 'Revisión' | 'Neumáticos' | 'Frenos' | 'Gas' | 'Electricidad' | 'Agua' | 'Batería' | 'Otro'
  fecha: string // ISO date
  kilometraje?: number
  descripcion?: string
  coste?: number
  proximo_mantenimiento?: string // ISO date
  kilometraje_proximo?: number
  alertar_dias_antes?: number
  taller?: string
  direccion_taller?: string
  telefono_taller?: string
  fotos_urls?: string[]
  documentos_urls?: string[]
  notas?: string
  created_at: string
  updated_at: string
}

export interface MantenimientoFormData {
  tipo: string
  fecha: string
  kilometraje?: number
  descripcion?: string
  coste?: number
  proximo_mantenimiento?: string
  kilometraje_proximo?: number
  taller?: string
  direccion_taller?: string
  telefono_taller?: string
  notas?: string
}

// ============================================
// AVERÍAS
// ============================================

export interface Averia {
  id: string
  vehiculo_id: string
  user_id: string
  titulo: string
  descripcion: string
  fecha_averia: string
  kilometraje?: number
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  categoria?: string
  estado: 'pendiente' | 'diagnosticando' | 'en_reparacion' | 'resuelto' | 'no_reparable'
  fecha_inicio_reparacion?: string
  fecha_resolucion?: string
  solucion?: string
  taller?: string
  contacto_taller?: string
  coste_diagnostico?: number
  coste_reparacion?: number
  coste_total?: number
  en_garantia?: boolean
  garantia_hasta?: string
  numero_garantia?: string
  fotos_urls?: string[]
  documentos_urls?: string[]
  es_recurrente?: boolean
  relacionado_con?: string
  notas?: string
  created_at: string
  updated_at: string
}

export interface AveriaFormData {
  titulo: string
  descripcion: string
  fecha_averia: string
  kilometraje?: number
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  categoria?: string
  estado: 'pendiente' | 'diagnosticando' | 'en_reparacion' | 'resuelto' | 'no_reparable'
  taller?: string
  contacto_taller?: string
  coste_diagnostico?: number
  coste_reparacion?: number
  en_garantia?: boolean
  garantia_hasta?: string
  numero_garantia?: string
  notas?: string
}

// ============================================
// DOCUMENTOS
// ============================================

export interface VehiculoDocumento {
  id: string
  vehiculo_id: string
  user_id: string
  tipo: 'ITV' | 'Seguro' | 'Manual' | 'Factura compra' | 'Certificado gas' | 'Tarjeta técnica' | 'Otro'
  nombre: string
  descripcion?: string
  url: string
  tipo_archivo?: string
  tamaño_bytes?: number
  fecha_emision?: string
  fecha_caducidad?: string
  alertar_dias_antes?: number
  numero_documento?: string
  entidad_emisora?: string
  es_importante?: boolean
  notas?: string
  created_at: string
  updated_at: string
}

export interface DocumentoFormData {
  tipo: string
  nombre: string
  descripcion?: string
  fecha_emision?: string
  fecha_caducidad?: string
  alertar_dias_antes?: number
  numero_documento?: string
  entidad_emisora?: string
  es_importante?: boolean
  notas?: string
}

// ============================================
// MEJORAS
// ============================================

export interface VehiculoMejora {
  id: string
  vehiculo_id: string
  user_id: string
  titulo: string
  descripcion: string
  categoria?: string
  fecha: string
  coste_materiales?: number
  coste_mano_obra?: number
  coste_total?: number
  instalado_por?: string
  tiempo_instalacion?: string
  dificultad?: 'facil' | 'media' | 'dificil'
  satisfaccion?: number
  lo_volveria_hacer?: boolean
  recomendaciones?: string
  fotos_antes_urls?: string[]
  fotos_despues_urls?: string[]
  documentos_urls?: string[]
  es_publica?: boolean
  likes?: number
  notas?: string
  created_at: string
  updated_at: string
}

export interface MejoraFormData {
  titulo: string
  descripcion: string
  categoria?: string
  fecha: string
  coste_materiales?: number
  coste_mano_obra?: number
  instalado_por?: string
  tiempo_instalacion?: string
  dificultad?: 'facil' | 'media' | 'dificil'
  satisfaccion?: number
  lo_volveria_hacer?: boolean
  recomendaciones?: string
  es_publica?: boolean
  notas?: string
}

// ============================================
// KILOMETRAJE
// ============================================

export interface VehiculoKilometraje {
  id: string
  vehiculo_id: string
  user_id: string
  fecha: string
  kilometros: number
  combustible_litros?: number
  coste_combustible?: number
  precio_litro?: number
  tipo_combustible?: string
  deposito_lleno?: boolean
  gasolinera?: string
  ubicacion_lat?: number
  ubicacion_lng?: number
  ciudad?: string
  pais?: string
  km_desde_ultimo_repostaje?: number
  consumo_medio?: number
  notas?: string
  created_at: string
}

export interface KilometrajeFormData {
  fecha: string
  kilometros: number
  combustible_litros?: number
  coste_combustible?: number
  tipo_combustible?: string
  deposito_lleno?: boolean
  gasolinera?: string
  ciudad?: string
  notas?: string
}

// ============================================
// FICHA TÉCNICA
// ============================================

export interface VehiculoFichaTecnica {
  id: string
  vehiculo_id: string
  user_id: string
  // Dimensiones
  largo_cm?: number
  ancho_cm?: number
  alto_cm?: number
  // Pesos
  mma_kg?: number
  tara_kg?: number
  carga_util_kg?: number
  // Capacidades
  deposito_agua_limpia_litros?: number
  deposito_aguas_grises_litros?: number
  deposito_aguas_negras_litros?: number
  deposito_combustible_litros?: number
  deposito_gas_kg?: number
  // Plazas
  plazas_viajar?: number
  plazas_dormir?: number
  // Motor
  marca_motor?: string
  modelo_motor?: string
  cilindrada_cc?: number
  potencia_cv?: number
  potencia_kw?: number
  tipo_combustible?: string
  transmision?: string
  traccion?: string
  normativa_emisiones?: string
  // Consumo oficial
  consumo_urbano_oficial?: number
  consumo_carretera_oficial?: number
  consumo_mixto_oficial?: number
  // Equipamiento
  aire_acondicionado?: boolean
  calefaccion?: boolean
  tipo_calefaccion?: string
  placa_solar?: boolean
  potencia_solar_w?: number
  nevera?: string
  capacidad_nevera_litros?: number
  // Baterías
  bateria_motor_ah?: number
  bateria_auxiliar_ah?: number
  tipo_bateria_auxiliar?: string
  // Otros
  homologacion?: string
  numero_bastidor?: string
  fecha_primera_matriculacion?: string
  fecha_compra?: string
  precio_compra?: number
  procedencia?: string
  notas?: string
  created_at: string
  updated_at: string
}

// ============================================
// VALORACIÓN ECONÓMICA
// ============================================

export interface VehiculoValoracionEconomica {
  id: string
  vehiculo_id: string
  user_id: string
  // Compra
  precio_compra?: number
  fecha_compra?: string
  procedencia?: string
  lugar_compra?: string
  kilometros_compra?: number
  // Impuesto de Matriculación (nuevo)
  origen_compra?: string
  precio_incluye_impuesto_matriculacion?: boolean
  importe_impuesto_matriculacion?: number
  impuesto_matriculacion_estimado?: number
  pvp_base_particular?: number
  motivo_exencion_impuesto?: string
  // Financiación
  financiado?: boolean
  importe_financiado?: number
  cuota_mensual?: number
  plazo_meses?: number
  pendiente_pago?: number
  // Inversión total
  total_mantenimientos?: number
  total_averias?: number
  total_mejoras?: number
  total_seguros?: number
  total_impuestos?: number
  total_otros_gastos?: number
  inversion_total?: number
  // Valoración actual
  valor_estimado_actual?: number
  fecha_ultima_valoracion?: string
  metodo_valoracion?: string
  notas_valoracion?: string
  depreciacion_anual_porcentaje?: number
  valor_residual_estimado?: number
  // Venta
  en_venta?: boolean
  precio_venta_deseado?: number
  precio_venta_minimo?: number
  fecha_puesta_venta?: string
  vendido?: boolean
  precio_venta_final?: number
  fecha_venta?: string
  ganancia_perdida?: number
  // Compartir datos
  compartir_datos_compra?: boolean
  compartir_datos_venta?: boolean
  compartir_datos_costes?: boolean
  notas?: string
  created_at: string
  updated_at: string
}

export interface ValoracionAutomatica {
  valor_estimado: number
  confianza: string
  num_comparables: number
  precio_mercado_medio: number
  ajuste_kilometraje: number
  ajuste_estado: number
  ajuste_equipamiento: number
  metodo: string
}

// ============================================
// GASTOS ADICIONALES
// ============================================

export interface GastoAdicional {
  id: string
  vehiculo_id: string
  user_id: string
  categoria: 'Seguro' | 'Impuestos' | 'Parking' | 'Peajes' | 'Limpieza' | 'Accesorios' | 'Otro'
  subcategoria?: string
  descripcion: string
  importe: number
  fecha: string
  es_recurrente?: boolean
  frecuencia?: string
  proximo_vencimiento?: string
  factura_url?: string
  documentos_urls?: string[]
  notas?: string
  created_at: string
}

export interface GastoAdicionalFormData {
  categoria: string
  subcategoria?: string
  descripcion: string
  importe: number
  fecha: string
  es_recurrente?: boolean
  frecuencia?: string
  proximo_vencimiento?: string
  notas?: string
}

// ============================================
// DATOS DE MERCADO
// ============================================

export interface DatoMercado {
  marca: string
  modelo: string
  año: number
  tipo_dato: 'compra' | 'venta' | 'venta_anuncio'
  precio: number
  fecha_transaccion: string
  kilometros?: number
  estado?: string
}

export interface EstadisticasMercado {
  marca: string
  modelo: string
  año: number
  tipo_dato: string
  num_registros: number
  precio_medio: number
  precio_minimo: number
  precio_maximo: number
  precio_mediano: number
  kilometros_medio: number
}

// ============================================
// ANÁLISIS Y ESTADÍSTICAS
// ============================================

export interface ResumenEconomico {
  vehiculo_id: string
  matricula: string
  marca: string
  modelo: string
  año: number
  // Compra
  precio_compra?: number
  fecha_compra?: string
  km_compra?: number
  // Costes
  total_mantenimientos: number
  total_averias: number
  total_mejoras: number
  total_seguros: number
  total_impuestos: number
  total_otros_gastos: number
  inversion_total: number
  // Kilometraje
  km_actual?: number
  km_recorridos?: number
  coste_por_km?: number
  // Valoración
  valor_estimado_actual?: number
  depreciacion_total?: number
  depreciacion_porcentaje?: number
  // Venta
  en_venta: boolean
  precio_venta_deseado?: number
  vendido: boolean
  precio_venta_final?: number
  ganancia_perdida?: number
  roi_porcentaje?: number
}

export interface AnalisisGastos {
  categoria: string
  num_gastos: number
  importe_total: number
  importe_medio: number
  porcentaje_del_total: number
}

export interface ProyeccionCostes {
  categoria: string
  coste_anual_estimado: number
  basado_en: string
}

export interface EstadisticasConsumo {
  num_repostajes: number
  litros_totales: number
  coste_total: number
  precio_medio_litro: number
  consumo_medio_l_100km: number
  consumo_minimo: number
  consumo_maximo: number
  km_recorridos: number
  coste_por_km: number
}

// ============================================
// HISTORICO PRECIOS
// ============================================

export interface HistoricoPrecio {
  id: string
  vehiculo_id: string
  user_id: string
  fecha_valoracion: string
  valor_estimado: number
  kilometros_en_momento?: number
  metodo?: string
  fuente?: string
  documento_url?: string
  estado_general?: string
  factores_positivos?: string[]
  factores_negativos?: string[]
  notas?: string
  created_at: string
}

