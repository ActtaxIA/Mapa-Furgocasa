import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reportar Accidente de Autocaravana - Sistema de Alertas | Mapa Furgocasa',
  description: 'Sistema gratuito para reportar accidentes de autocaravanas, campers y furgonetas. Si eres testigo de un golpe, rasguño o daño a un vehículo, ayuda al propietario reportando el incidente con fotos y ubicación GPS. Notificación instantánea al propietario.',
  keywords: [
    'reportar accidente autocaravana',
    'denunciar golpe autocaravana',
    'daño autocaravana testigo',
    'sistema alertas autocaravanas',
    'QR accidente autocaravana',
    'notificar daño vehículo',
    'reporte incidente camper',
    'testigo accidente furgoneta',
    'ayuda propietario autocaravana',
    'golpe parking autocaravana'
  ],
  openGraph: {
    title: 'Reportar Accidente de Autocaravana - Ayuda al Propietario',
    description: '¿Has visto un golpe o daño a una autocaravana? Repórtalo de forma anónima y ayuda al propietario. Sistema gratuito con geolocalización y fotos.',
    url: 'https://www.mapafurgocasa.com/accidente',
    type: 'website',
    images: [
      {
        url: 'https://www.mapafurgocasa.com/images/og-accidente.jpg',
        width: 1200,
        height: 630,
        alt: 'Sistema de Reportes de Accidentes para Autocaravanas',
      }
    ],
    siteName: 'Mapa Furgocasa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reportar Accidente de Autocaravana - Sistema de Alertas',
    description: '¿Viste un golpe a una autocaravana? Repórtalo y ayuda al propietario. Sistema gratuito con GPS y fotos.',
    images: ['https://www.mapafurgocasa.com/images/og-accidente.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.mapafurgocasa.com/accidente',
  },
}

export default function AccidenteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

