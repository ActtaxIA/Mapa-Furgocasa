import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planificador de Rutas para Autocaravanas | Mapa Furgocasa',
  description: 'Planifica tu ruta perfecta en autocaravana. Descubre automáticamente áreas de pernocta cercanas a tu camino en Europa, América y resto del mundo. Optimiza distancias y encuentra los mejores lugares para parar.',
  keywords: [
    'planificador rutas autocaravanas',
    'ruta autocaravana',
    'planificar viaje autocaravana',
    'ruta camper',
    'itinerario autocaravana',
    'calcular ruta autocaravana'
  ],
  openGraph: {
    title: 'Planificador de Rutas - Diseña tu Viaje en Autocaravana',
    description: 'Crea rutas personalizadas y descubre áreas de pernocta automáticamente. Planifica tu aventura en autocaravana con la herramienta más completa.',
    url: 'https://www.mapafurgocasa.com/ruta',
  },
}

export default function RutaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

