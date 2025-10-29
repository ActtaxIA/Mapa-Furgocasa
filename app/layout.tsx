import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import WelcomeModal from '@/components/ui/WelcomeModal'

export const metadata: Metadata = {
  title: 'Mapa Furgocasa - Encuentra Áreas para Autocaravanas | +1000 Ubicaciones en el Mundo',
  description: 'Descubre más de 1000 áreas para autocaravanas en Europa, América y resto del mundo (España, Portugal, Francia, Andorra, Argentina...). Planifica rutas, encuentra servicios, guarda favoritos y viaja con libertad. Información actualizada de parkings, campings y áreas públicas.',
  keywords: [
    'áreas autocaravanas',
    'mapa autocaravanas mundial', 
    'parkings autocaravanas',
    'camping autocaravanas',
    'pernocta autocaravanas',
    'rutas autocaravanas',
    'áreas autocaravanas europa',
    'áreas autocaravanas américa',
    'áreas autocaravanas argentina',
    'furgocasa',
    'autocaravanas españa',
    'camper van'
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
    title: 'Mapa Furgocasa - Descubre +1000 Áreas para Autocaravanas en el Mundo',
    description: 'Encuentra las mejores áreas para autocaravanas en Europa, América y resto del mundo: España, Portugal, Francia, Andorra, Argentina... Planifica rutas y viaja con libertad. Información completa de servicios, precios y ubicaciones actualizadas.',
    siteName: 'Mapa Furgocasa',
    images: [{
      url: 'https://www.mapafurgocasa.com/og-image-v2.jpg',
      width: 1200,
      height: 630,
      alt: 'Mapa Furgocasa - Planifica tu Ruta en Autocaravana'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapa Furgocasa - +1000 Áreas para Autocaravanas',
    description: 'Descubre áreas para autocaravanas en Europa, América y resto del mundo. Planifica rutas, encuentra servicios y viaja con libertad.',
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
