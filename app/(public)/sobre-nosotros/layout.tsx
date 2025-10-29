import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nosotros - Furgocasa | Líder en Autocaravanas y Camperización',
  description: 'Conoce Mapa Furgocasa, parte de Furgocasa Campervans. Especialistas en venta, alquiler y camperización de furgonetas. Ayudamos a miles de viajeros a descubrir el mundo en autocaravana con +1000 áreas verificadas.',
  keywords: [
    'furgocasa',
    'sobre furgocasa',
    'empresa autocaravanas',
    'camperización furgonetas',
    'alquiler autocaravanas',
    'venta campers'
  ],
  openGraph: {
    title: 'Sobre Furgocasa - Tu Compañero de Viaje en Autocaravana',
    description: 'Empresa líder en España en venta, alquiler y camperización de autocaravanas. Descubre nuestra historia y misión.',
    url: 'https://www.mapafurgocasa.com/sobre-nosotros',
  },
}

export default function SobreNosotrosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

