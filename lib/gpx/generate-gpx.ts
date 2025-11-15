/**
 * 🗺️ Generador de Archivos GPX
 *
 * Convierte rutas de Mapa Furgocasa a formato GPX 1.1
 * Compatible con: Garmin, TomTom, Suunto, y la mayoría de dispositivos GPS
 */

interface GPXPoint {
  lat: number
  lng: number
  name?: string
  description?: string
  type?: 'waypoint' | 'routepoint'
}

interface GPXRouteData {
  nombre: string
  descripcion?: string
  origen: { nombre: string; latitud: number; longitud: number }
  destino: { nombre: string; latitud: number; longitud: number }
  paradas?: Array<{ nombre: string; latitud: number; longitud: number; orden: number }>
  geometria?: any // GeoJSON de la ruta completa
  distancia_km?: number
  duracion_minutos?: number
}

/**
 * Escapa caracteres XML especiales
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Formatea timestamp a ISO 8601
 */
function formatTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Genera archivo GPX 1.1 desde datos de ruta
 */
export function generateGPX(rutaData: GPXRouteData): string {
  const timestamp = formatTimestamp()
  const nombre = escapeXML(rutaData.nombre)
  const descripcion = rutaData.descripcion ? escapeXML(rutaData.descripcion) : ''

  // Construir waypoints (puntos de interés)
  const waypoints: GPXPoint[] = []

  // Añadir origen como waypoint
  waypoints.push({
    lat: rutaData.origen.latitud,
    lng: rutaData.origen.longitud,
    name: rutaData.origen.nombre,
    description: 'Punto de origen',
    type: 'waypoint'
  })

  // Añadir paradas intermedias
  if (rutaData.paradas && rutaData.paradas.length > 0) {
    rutaData.paradas
      .sort((a, b) => a.orden - b.orden)
      .forEach((parada, index) => {
        waypoints.push({
          lat: parada.latitud,
          lng: parada.longitud,
          name: parada.nombre,
          description: `Parada ${index + 1}`,
          type: 'waypoint'
        })
      })
  }

  // Añadir destino como waypoint
  waypoints.push({
    lat: rutaData.destino.latitud,
    lng: rutaData.destino.longitud,
    name: rutaData.destino.nombre,
    description: 'Punto de destino',
    type: 'waypoint'
  })

  // Construir track points (trazado de la ruta)
  let trackPoints: GPXPoint[] = []

  if (rutaData.geometria?.features?.[0]?.geometry?.coordinates) {
    // Convertir GeoJSON LineString a puntos GPX
    const coordinates = rutaData.geometria.features[0].geometry.coordinates
    trackPoints = coordinates.map((coord: [number, number]) => ({
      lng: coord[0],
      lat: coord[1],
      type: 'routepoint'
    }))
  } else {
    // Si no hay geometría, usar solo los waypoints
    trackPoints = waypoints.map(wp => ({
      lat: wp.lat,
      lng: wp.lng,
      type: 'routepoint'
    }))
  }

  // Generar XML GPX 1.1
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
  creator="Mapa Furgocasa - https://www.mapafurgocasa.com"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${nombre}</name>
    ${descripcion ? `<desc>${descripcion}</desc>` : ''}
    <author>
      <name>Mapa Furgocasa</name>
      <link href="https://www.mapafurgocasa.com">
        <text>Mapa Furgocasa - Tu mejor app para autocaravanas</text>
      </link>
    </author>
    <time>${timestamp}</time>
    ${rutaData.distancia_km ? `<keywords>Distancia: ${rutaData.distancia_km.toFixed(1)} km${rutaData.duracion_minutos ? `, Duración: ${Math.round(rutaData.duracion_minutos)} min` : ''}</keywords>` : ''}
  </metadata>
`

  // Añadir waypoints (puntos de interés)
  waypoints.forEach(wp => {
    gpx += `  <wpt lat="${wp.lat}" lon="${wp.lng}">
    <name>${escapeXML(wp.name || 'Punto')}</name>
    ${wp.description ? `<desc>${escapeXML(wp.description)}</desc>` : ''}
    <sym>Flag, Blue</sym>
    <type>waypoint</type>
  </wpt>
`
  })

  // Añadir track (trazado de la ruta)
  gpx += `  <trk>
    <name>${nombre}</name>
    ${descripcion ? `<desc>${descripcion}</desc>` : ''}
    <type>autocaravana</type>
    <trkseg>
`

  // Añadir todos los puntos del track
  trackPoints.forEach(point => {
    gpx += `      <trkpt lat="${point.lat}" lon="${point.lng}">
        <time>${timestamp}</time>
      </trkpt>
`
  })

  gpx += `    </trkseg>
  </trk>
`

  // Añadir ruta (route) para navegación
  gpx += `  <rte>
    <name>${nombre} - Navegación</name>
    ${descripcion ? `<desc>${descripcion}</desc>` : ''}
`

  waypoints.forEach(wp => {
    gpx += `    <rtept lat="${wp.lat}" lon="${wp.lng}">
      <name>${escapeXML(wp.name || 'Punto')}</name>
      ${wp.description ? `<desc>${escapeXML(wp.description)}</desc>` : ''}
    </rtept>
`
  })

  gpx += `  </rte>
</gpx>`

  return gpx
}

/**
 * Descarga archivo GPX en el navegador
 */
export function downloadGPX(gpxContent: string, filename: string): void {
  // Crear blob con el contenido GPX
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' })

  // Crear enlace de descarga
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.gpx') ? filename : `${filename}.gpx`

  // Trigger descarga
  document.body.appendChild(link)
  link.click()

  // Limpiar
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Genera nombre de archivo GPX sanitizado
 */
export function generateGPXFilename(routeName: string): string {
  const sanitized = routeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .substring(0, 50) // Máximo 50 caracteres

  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return `mapa-furgocasa-${sanitized}-${timestamp}.gpx`
}
