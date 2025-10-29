import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.mapafurgocasa.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/mapa',
          '/area/',
          '/ruta',
          '/auth/',
          '/sobre-nosotros',
          '/contacto',
          '/privacidad',
          '/condiciones',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/perfil',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/mapa',
          '/area/',
          '/ruta',
          '/sobre-nosotros',
          '/contacto',
          '/privacidad',
          '/condiciones',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/perfil',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

