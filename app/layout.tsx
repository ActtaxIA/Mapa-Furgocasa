import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import WelcomeModal from '@/components/ui/WelcomeModal'

export const metadata: Metadata = {
  title: 'Mapa Furgocasa - Encuentra Áreas para Autocaravanas en España | +600 Ubicaciones',
  description: 'Descubre más de 600 áreas para autocaravanas en España. Planifica rutas, encuentra servicios, guarda favoritos y viaja con libertad. Información actualizada de parkings, campings y áreas públicas.',
  keywords: ['áreas autocaravanas españa', 'mapa autocaravanas', 'parkings autocaravanas', 'camping autocaravanas', 'furgo españa', 'camper van españa', 'rutas autocaravanas', 'pernocta autocaravanas', 'furgocasa'],
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
    title: 'Mapa Furgocasa - Descubre +600 Áreas para Autocaravanas en España',
    description: 'Encuentra las mejores áreas para autocaravanas, planifica rutas y viaja con libertad por España. Información completa de servicios, precios y ubicaciones.',
    siteName: 'Mapa Furgocasa',
    images: [{
      url: 'https://www.mapafurgocasa.com/og-image-v2.jpg',
      width: 1200,
      height: 630,
      alt: 'Mapa Furgocasa - Planifica tu Ruta en Autocaravana por España'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapa Furgocasa - +600 Áreas para Autocaravanas',
    description: 'Descubre áreas para autocaravanas en España. Planifica rutas, encuentra servicios y viaja con libertad.',
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
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `}
        </Script>
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <WelcomeModal />
        {children}
      </body>
    </html>
  )
}
