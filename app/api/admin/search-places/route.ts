import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Método GET para verificar que la ruta funciona
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Search Places API is working. Use POST to search.'
  })
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user || !session.user.user_metadata?.is_admin) {
      return NextResponse.json(
        { error: 'No autorizado. Se requieren permisos de administrador.' },
        { status: 403 }
      )
    }

    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere un término de búsqueda' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      console.error('❌ Google Maps API Key no configurada')
      return NextResponse.json(
        { error: 'Google Maps API Key no configurada en el servidor. Por favor, añade NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local' },
        { status: 500 }
      )
    }

    console.log('🔍 Buscando en Google Places:', query)
    console.log('🔑 API Key disponible:', apiKey ? `${apiKey.substring(0, 10)}...` : 'No')

    // Mejorar la query para obtener más resultados relevantes
    // Si el usuario busca "areas autocaravanas murcia", ampliamos la búsqueda
    let enhancedQuery = query

    // Agregar términos relacionados si no están presentes
    const keywords = ['autocaravana', 'camping', 'area', 'camper', 'motorhome', 'rv']
    const hasKeyword = keywords.some(keyword => query.toLowerCase().includes(keyword))

    if (hasKeyword) {
      // Si tiene una keyword, añadimos variaciones
      const location = query.toLowerCase()
        .replace(/areas?/gi, '')
        .replace(/autocaravanas?/gi, '')
        .replace(/camping/gi, '')
        .replace(/camper/gi, '')
        .replace(/motorhome/gi, '')
        .replace(/parking/gi, '')
        .trim()

      // Buscar múltiples variaciones
      enhancedQuery = `(área OR area OR camping OR parking) autocaravana OR camper OR motorhome ${location}`
      console.log('🔍 Query mejorada:', enhancedQuery)
    }

    // Primera búsqueda
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    searchUrl.searchParams.append('query', enhancedQuery)
    searchUrl.searchParams.append('key', apiKey)
    searchUrl.searchParams.append('language', 'es')
    // ✅ Sin restricción de región para permitir búsquedas globales (Europa y LATAM)
    // searchUrl.searchParams.append('region', 'es')  // ❌ Eliminado - limitaba búsquedas a España
    // Tipos relevantes para áreas de autocaravanas
    searchUrl.searchParams.append('type', 'rv_park|campground|parking')

    console.log('📡 URL de búsqueda:', searchUrl.toString().replace(apiKey, 'API_KEY_HIDDEN'))

    const response = await fetch(searchUrl.toString())

    if (!response.ok) {
      console.error('❌ Error HTTP de Google Places API:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ Error body:', errorText)
      return NextResponse.json(
        { error: `Error en la API de Google: ${response.status} ${response.statusText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('📦 Respuesta de Google Places API:', data.status)

    if (data.status === 'ZERO_RESULTS') {
      console.log('ℹ️ No se encontraron resultados para:', query)
      return NextResponse.json({
        results: [],
        status: 'ZERO_RESULTS'
      })
    }

    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ REQUEST_DENIED:', data.error_message)
      return NextResponse.json(
        {
          error: `Error de Google Places API: ${data.error_message || 'Solicitud denegada. Verifica que Places API esté habilitada en Google Cloud Console y que la API Key tenga permisos.'}`,
          details: data.error_message
        },
        { status: 500 }
      )
    }

    if (data.status === 'INVALID_REQUEST') {
      console.error('❌ INVALID_REQUEST:', data.error_message)
      return NextResponse.json(
        {
          error: `Solicitud inválida: ${data.error_message || 'Verifica el formato de búsqueda'}`,
          details: data.error_message
        },
        { status: 500 }
      )
    }

    if (data.status !== 'OK') {
      console.error('❌ Error de Google Places API:', data.status, data.error_message)
      return NextResponse.json(
        {
          error: data.error_message || `Error al buscar en Google Places (${data.status})`,
          status: data.status
        },
        { status: 500 }
      )
    }

    console.log(`✅ Encontrados ${data.results?.length || 0} resultados iniciales`)

    // Recopilar todos los resultados (hasta 60)
    let allResults = data.results || []
    let nextPageToken = data.next_page_token

    // Google Places devuelve máximo 20 resultados por página, hasta 3 páginas (60 total)
    let pagesProcessed = 1
    while (nextPageToken && pagesProcessed < 3) {
      // Google requiere un pequeño delay antes de usar el next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log(`📄 Obteniendo página ${pagesProcessed + 1}...`)

      const nextPageUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
      nextPageUrl.searchParams.append('key', apiKey)
      nextPageUrl.searchParams.append('pagetoken', nextPageToken)

      const nextResponse = await fetch(nextPageUrl.toString())

      if (nextResponse.ok) {
        const nextData = await nextResponse.json()

        if (nextData.status === 'OK' && nextData.results) {
          allResults = [...allResults, ...nextData.results]
          nextPageToken = nextData.next_page_token
          pagesProcessed++
          console.log(`✅ Página ${pagesProcessed}: ${nextData.results.length} resultados más`)
        } else {
          console.log(`⚠️ No hay más resultados disponibles`)
          break
        }
      } else {
        console.error(`❌ Error obteniendo página ${pagesProcessed + 1}`)
        break
      }
    }

    console.log(`🎉 Total de resultados obtenidos: ${allResults.length}`)

    // Enriquecer resultados con Place Details (para obtener website, teléfono, etc.)
    console.log('📞 Obteniendo detalles adicionales de cada lugar...')
    const resultsWithDetails = await Promise.all(
      allResults.map(async (place: any) => {
        try {
          // Llamar a Place Details API para obtener todos los detalles (excepto fotos)
          const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
          detailsUrl.searchParams.append('place_id', place.place_id)
          detailsUrl.searchParams.append('key', apiKey)
          detailsUrl.searchParams.append('fields', 'name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,price_level,rating,user_ratings_total,reviews,types,url,utc_offset,vicinity,business_status,address_components')
          detailsUrl.searchParams.append('language', 'es')

          const detailsResponse = await fetch(detailsUrl.toString())

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()

            if (detailsData.status === 'OK' && detailsData.result) {
              return {
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address,
                geometry: {
                  location: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng
                  }
                },
                types: place.types,
                rating: place.rating,
                user_ratings_total: place.user_ratings_total,
                business_status: place.business_status,
                website: detailsData.result.website || null,
                phone: detailsData.result.formatted_phone_number || detailsData.result.international_phone_number || null,
                photos: place.photos?.map((photo: any) => ({
                  photo_reference: photo.photo_reference,
                  height: photo.height,
                  width: photo.width
                }))
              }
            }
          }

          // Si falla, devolver sin detalles adicionales
          return {
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            types: place.types,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            business_status: place.business_status,
            website: null,
            phone: null,
            photos: place.photos?.map((photo: any) => ({
              photo_reference: photo.photo_reference,
              height: photo.height,
              width: photo.width
            }))
          }
        } catch (error) {
          console.error(`Error obteniendo detalles para ${place.name}:`, error)
          // En caso de error, devolver datos básicos
          return {
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            types: place.types,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            business_status: place.business_status,
            website: null,
            phone: null,
            photos: place.photos?.map((photo: any) => ({
              photo_reference: photo.photo_reference,
              height: photo.height,
              width: photo.width
            }))
          }
        }
      })
    )

    console.log(`✅ Detalles obtenidos para ${resultsWithDetails.length} lugares`)
    const withWebsite = resultsWithDetails.filter(r => r.website).length
    console.log(`🌐 ${withWebsite} lugares tienen website`)

    const results = resultsWithDetails

    return NextResponse.json({
      results,
      status: 'OK',
      total: results.length
    })
  } catch (error: any) {
    console.error('❌ Error en búsqueda de lugares:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
