import type { Metadata, Viewport } from 'next'
import './globals.css'
import WelcomeModal from '@/components/ui/WelcomeModal'

export const metadata: Metadata = {
  title: 'Mapa Furgocasa - Áreas para Autocaravanas en España',
  description: 'Encuentra las mejores áreas para autocaravanas en España. Información actualizada de servicios, precios y ubicaciones.',
  keywords: ['autocaravanas', 'áreas autocaravanas', 'furgocasa', 'camping', 'españa', 'camper', 'furgo'],
  authors: [{ name: 'Furgocasa' }],
  manifest: '/manifest.json',
  themeColor: '#0284c7',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Furgocasa',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.mapafurgocasa.com',
    title: 'Mapa Furgocasa - Áreas para Autocaravanas',
    description: 'Encuentra las mejores áreas para autocaravanas en España',
    siteName: 'Furgocasa',
    images: ['/favicon.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapa Furgocasa',
    description: 'Áreas para autocaravanas en España',
    images: ['/favicon.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0284c7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <WelcomeModal />
        {children}
      </body>
    </html>
  )
}
