/**
 * GOOGLE GEOCODING API
 * ====================
 * Funciones para convertir coordenadas GPS en ubicaciones legibles
 * y viceversa usando la API de Google Maps
 */

export interface GeocodeResult {
  city: string
  province: string
  region: string
  country: string
  formatted_address: string
}

/**
 * Convierte coordenadas GPS en ciudad/provincia/región
 * Geocoding Reverso: (lat, lng) → "Granada, Granada, Andalucía"
 */
export async function getCityAndProvinceFromCoords(
  lat: number, 
  lng: number
): Promise<GeocodeResult | null> {
  // Verificar que existe la API key
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️ GOOGLE_MAPS_API_KEY no configurada - Geocoding deshabilitado')
    return null
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${process.env.GOOGLE_MAPS_API_KEY}`
    
    console.log('🌍 [Geocoding] Consultando ubicación:', lat, lng)
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('❌ [Geocoding] Error:', data.status, data.error_message)
      return null
    }

    if (!data.results || data.results.length === 0) {
      console.warn('⚠️ [Geocoding] Sin resultados')
      return null
    }

    // Extraer componentes de dirección
    const components = data.results[0].address_components
    
    let city = ''
    let province = ''
    let region = ''
    let country = ''

    for (const component of components) {
      // Ciudad (locality)
      if (component.types.includes('locality')) {
        city = component.long_name
      }
      // Provincia (administrative_area_level_2)
      if (component.types.includes('administrative_area_level_2')) {
        province = component.long_name
      }
      // Región/Comunidad Autónoma (administrative_area_level_1)
      if (component.types.includes('administrative_area_level_1')) {
        region = component.long_name
      }
      // País
      if (component.types.includes('country')) {
        country = component.long_name
      }
    }

    // Si no hay ciudad, usar provincia
    if (!city && province) {
      city = province
    }

    const result: GeocodeResult = {
      city: city || 'Desconocida',
      province: province || city || 'Desconocida',
      region: region || 'Desconocida',
      country: country || 'España',
      formatted_address: data.results[0].formatted_address
    }

    console.log('✅ [Geocoding] Ubicación obtenida:', result.city, result.province, result.country)

    return result

  } catch (error: any) {
    console.error('❌ [Geocoding] Error en la consulta:', error.message)
    return null
  }
}

/**
 * Convierte una dirección en coordenadas GPS
 * Geocoding: "Granada, España" → (37.1773, -3.5985)
 */
export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️ GOOGLE_MAPS_API_KEY no configurada')
    return null
  }

  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&language=es&key=${process.env.GOOGLE_MAPS_API_KEY}`
    
    console.log('📍 [Geocoding] Buscando dirección:', address)
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.results[0]) {
      console.error('❌ [Geocoding] No se encontró la dirección')
      return null
    }

    const location = data.results[0].geometry.location
    
    console.log('✅ [Geocoding] Coordenadas obtenidas:', location.lat, location.lng)

    return {
      lat: location.lat,
      lng: location.lng
    }

  } catch (error: any) {
    console.error('❌ [Geocoding] Error:', error.message)
    return null
  }
}

/**
 * Formatea una ubicación para mostrar en texto
 */
export function formatLocation(location: GeocodeResult): string {
  if (location.city === location.province) {
    return `${location.city}, ${location.region}, ${location.country}`
  }
  return `${location.city}, ${location.province}, ${location.region}, ${location.country}`
}




