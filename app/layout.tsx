import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import WelcomeModal from '@/components/ui/WelcomeModal'

export const metadata: Metadata = {
  title: 'Mapa Furgocasa - Encuentra Áreas para Autocaravanas en Europa | +1000 Ubicaciones',
  description: 'Descubre más de 1000 áreas para autocaravanas en Europa (España, Portugal, Francia, Andorra). Planifica rutas, encuentra servicios, guarda favoritos y viaja con libertad. Información actualizada de parkings, campings y áreas públicas.',
  keywords: [
    'áreas autocaravanas europa',
    'mapa autocaravanas europa', 
    'parkings autocaravanas españa portugal francia',
    'camping autocaravanas europa',
    'pernocta autocaravanas europa',
    'rutas autocaravanas europa',
    'áreas ac francia',
    'áreas ac portugal',
    'furgocasa',
    'autocaravanas españa',
    'camper van europa'
  ],
  authors: [{ name: 'Furgocasa' }],
  manifest: '/manifest.json',
  themeColor: '#4b5668',
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
    title: 'Mapa Furgocasa - Descubre +1000 Áreas para Autocaravanas en Europa',
    description: 'Encuentra las mejores áreas para autocaravanas en Europa: España, Portugal, Francia y Andorra. Planifica rutas y viaja con libertad. Información completa de servicios, precios y ubicaciones actualizadas.',
    siteName: 'Mapa Furgocasa',
    images: [{
      url: 'https://www.mapafurgocasa.com/og-image-v2.jpg',
      width: 1200,
      height: 630,
      alt: 'Mapa Furgocasa - Planifica tu Ruta en Autocaravana por Europa'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapa Furgocasa - +1000 Áreas para Autocaravanas en Europa',
    description: 'Descubre áreas para autocaravanas en España, Portugal, Francia y Andorra. Planifica rutas, encuentra servicios y viaja con libertad por toda Europa.',
    images: ['https://www.mapafurgocasa.com/og-image-v2.jpg'],
    creator: '@furgocasa',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#4b5668',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8E3JE5ZVET"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8E3JE5ZVET');
          `}
        </Script>
        
        <WelcomeModal />
        {children}
      </body>
    </html>
  )
}
