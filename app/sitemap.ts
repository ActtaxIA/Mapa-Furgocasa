import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.mapafurgocasa.com'
  
  // Obtener todas las áreas activas desde Supabase (con paginación)
  const supabase = await createClient()
  const allAreas: Array<{ slug: string; updated_at: string | null }> = []
  const pageSize = 1000
  let page = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await (supabase as any)
      .from('areas')
      .select('slug, updated_at')
      .eq('activo', true)
      .order('updated_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('Error cargando áreas para sitemap:', error)
      break
    }

    if (data && data.length > 0) {
      allAreas.push(...data)
      page++
      if (data.length < pageSize) {
        hasMore = false
      }
    } else {
      hasMore = false
    }
  }

  const areas = allAreas

  // URLs estáticas del sitio
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/mapa`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ruta`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/condiciones`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // URLs dinámicas de áreas
  const areaPages: MetadataRoute.Sitemap = areas
    ? areas.map((area) => ({
        url: `${baseUrl}/area/${area.slug}`,
        lastModified: area.updated_at ? new Date(area.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    : []

  return [...staticPages, ...areaPages]
}

