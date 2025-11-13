import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reportar Accidente | Mapa Furgocasa',
  description: 'Sistema de reporte de accidentes mediante código QR. Permite a testigos reportar incidentes en tu autocaravana de forma rápida y sencilla con ubicación y fotos.',
  openGraph: {
    title: 'Reportar Accidente | Mapa Furgocasa',
    description: 'Sistema de reporte de accidentes mediante código QR. Permite a testigos reportar incidentes en tu autocaravana de forma rápida y sencilla con ubicación y fotos.',
    url: 'https://www.mapafurgocasa.com/accidente',
    siteName: 'Mapa Furgocasa',
    images: [
      {
        url: 'https://www.mapafurgocasa.com/og-accidente.jpg',
        width: 1200,
        height: 630,
        alt: 'Reportar Accidente - Sistema QR para Autocaravanas',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reportar Accidente | Mapa Furgocasa',
    description: 'Sistema de reporte de accidentes mediante código QR para autocaravanas',
    images: ['https://www.mapafurgocasa.com/og-accidente.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AccidenteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
