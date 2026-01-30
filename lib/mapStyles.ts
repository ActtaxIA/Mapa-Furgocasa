/**
 * Estilos de mapas para diferentes configuraciones
 */

// Estilo Waze-like (Minimalista y limpio)
export const WAZE_STYLE = [
  // Ocultar todos los POIs (negocios, restaurantes, etc.)
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  // Ocultar etiquetas de POIs
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }]
  },
  // Ocultar transporte público
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }]
  },
  // Simplificar paisaje (fondo verde claro)
  {
    featureType: 'landscape',
    stylers: [
      { color: '#f5f5f5' },
      { lightness: 20 }
    ]
  },
  // Carreteras principales - Naranja (estilo Waze)
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      { color: '#FFA500' },
      { weight: 2.5 }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels',
    stylers: [
      { visibility: 'simplified' },
      { weight: 0.8 }
    ]
  },
  // Carreteras arteriales - Blanco
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      { color: '#FFFFFF' },
      { weight: 2 }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels',
    stylers: [
      { visibility: 'simplified' },
      { weight: 0.6 }
    ]
  },
  // Carreteras locales - Gris claro
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [
      { color: '#E8E8E8' },
      { weight: 1 }
    ]
  },
  {
    featureType: 'road.local',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  // Agua - Azul suave
  {
    featureType: 'water',
    stylers: [
      { color: '#B3D9FF' },
      { lightness: 10 }
    ]
  },
  // Parques - Verde muy suave (apenas visible)
  {
    featureType: 'landscape.natural',
    stylers: [
      { color: '#E8F5E9' },
      { visibility: 'simplified' }
    ]
  },
  // Edificios - Ocultar o muy sutiles
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [
      { color: '#F0F0F0' },
      { visibility: 'simplified' }
    ]
  },
  // Etiquetas de ciudades - Simplificadas
  {
    featureType: 'administrative.locality',
    elementType: 'labels',
    stylers: [
      { visibility: 'on' },
      { weight: 0.8 }
    ]
  },
  // Bordes administrativos - Sutiles
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      { color: '#CCCCCC' },
      { weight: 0.5 }
    ]
  }
]

// Estilo Dark Mode (próximamente)
export const DARK_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  }
]

/**
 * Obtiene el estilo de mapa según la configuración
 */
export function getMapStyle(estilo: 'default' | 'waze' | 'satellite' | 'dark'): any[] {
  switch (estilo) {
    case 'waze':
      return WAZE_STYLE
    case 'dark':
      return DARK_STYLE
    case 'default':
    case 'satellite':
    default:
      return [] // Sin estilos personalizados
  }
}
