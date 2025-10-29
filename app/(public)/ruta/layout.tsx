import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planificador de Rutas para Autocaravanas en Europa | Mapa Furgocasa',
  description: 'Planifica tu ruta perfecta en autocaravana por Europa. Descubre automáticamente áreas de pernocta cercanas a tu camino. Optimiza distancias y encuentra los mejores lugares para parar en España, Portugal y Francia.',
  keywords: [
    'planificador rutas autocaravanas',
    'ruta autocaravana europa',
    'planificar viaje autocaravana',
    'ruta camper europa',
    'itinerario autocaravana',
    'calcular ruta autocaravana'
  ],
  openGraph: {
    title: 'Planificador de Rutas - Diseña tu Viaje en Autocaravana por Europa',
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

