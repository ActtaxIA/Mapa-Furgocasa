// ===================================================================
// TIPOS PARA SISTEMA DE REPORTES DE ACCIDENTES
// ===================================================================

export interface VehiculoRegistrado {
  id: string
  user_id: string
  matricula: string
  marca?: string
  modelo?: string
  año?: number
  color?: string
  foto_url?: string
  fotos_adicionales: string[]
  qr_code_id: string
  qr_image_url?: string
  activo: boolean
  verificado: boolean
  vendido?: boolean // Estado de venta del vehículo
  created_at: string
  updated_at: string
}

export interface ReporteAccidente {
  id: string
  vehiculo_afectado_id: string
  matricula_tercero?: string
  descripcion_tercero?: string
  testigo_nombre: string
  testigo_email?: string
  testigo_telefono?: string
  descripcion: string
  tipo_dano?: 'Rayón' | 'Abolladura' | 'Choque' | 'Rotura' | 'Otro'
  ubicacion_lat: number
  ubicacion_lng: number
  ubicacion_direccion?: string
  ubicacion_descripcion?: string
  fotos_urls: string[]
  fecha_accidente: string
  ip_address?: string
  captcha_verificado: boolean
  verificado: boolean
  leido: boolean
  cerrado: boolean
  es_anonimo: boolean
  notas_propietario?: string
  created_at: string
  updated_at: string
}

export interface NotificacionReporte {
  id: string
  user_id: string
  reporte_id: string
  tipo_notificacion: 'email' | 'push' | 'in_app'
  estado: 'pendiente' | 'enviada' | 'fallida'
  intentos: number
  enviada_at?: string
  leida_at?: string
  created_at: string
}

// Tipos para formularios
export interface VehiculoFormData {
  matricula: string
  marca?: string
  modelo?: string
  año?: number
  color?: string
  foto?: File
}

export interface ReporteFormData {
  matricula_tercero?: string
  descripcion_tercero?: string
  testigo_nombre: string
  testigo_email?: string
  testigo_telefono?: string
  descripcion: string
  tipo_dano?: 'Rayón' | 'Abolladura' | 'Choque' | 'Rotura' | 'Otro'
  ubicacion_lat: number
  ubicacion_lng: number
  ubicacion_direccion?: string
  ubicacion_descripcion?: string
  fecha_accidente: string
  fotos?: File[]
}

// Tipos para respuestas de API
export interface VehiculoBusquedaResponse {
  vehiculo_id: string | null
  matricula: string | null
  marca: string | null
  modelo: string | null
  color: string | null
  foto_url: string | null
  existe: boolean
}

export interface EstadisticasVehiculo {
  total_reportes: number
  reportes_pendientes: number
  reportes_cerrados: number
  ultimo_reporte: string | null
}

export interface ReporteCompletoUsuario extends ReporteAccidente {
  vehiculo_matricula: string
  vehiculo_marca?: string
  vehiculo_modelo?: string
}

// Tipos para componentes
export interface UbicacionData {
  lat: number
  lng: number
  direccion?: string
  descripcion?: string
}
