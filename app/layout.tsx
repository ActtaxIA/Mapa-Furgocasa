import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import WelcomeModal from '@/components/ui/WelcomeModal'
import ChatbotWidget from '@/components/chatbot/ChatbotWidget'

export const metadata: Metadata = {
  title: 'Mapa Furgocasa - Encuentra Áreas para Autocaravanas | +3600 Ubicaciones en Europa y LATAM',
  description: 'Descubre más de 3600 áreas para autocaravanas en Europa y Latinoamérica (España, Portugal, Francia, Italia, Argentina, Chile, Uruguay...). Planifica rutas, encuentra servicios, guarda favoritos y viaja con libertad. Información actualizada de parkings, campings y áreas públicas.',
  keywords: [
    'áreas autocaravanas',
    'mapa autocaravanas europa',
    'parkings autocaravanas',
    'camping autocaravanas',
    'pernocta autocaravanas',
    'rutas autocaravanas',
    'áreas autocaravanas europa',
    'áreas autocaravanas latinoamérica',
    'áreas autocaravanas argentina',
    'furgocasa',
    'autocaravanas españa',
    'autocaravanas francia',
    'autocaravanas portugal',
    'camper van'
  ],
  authors: [{ name: 'Furgocasa' }],
  manifest: '/manifest.json',
  themeColor: '#0b3c74',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
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
    title: 'Mapa Furgocasa - Descubre +3600 Áreas para Autocaravanas en Europa y LATAM',
    description: 'Encuentra las mejores áreas para autocaravanas en Europa y Latinoamérica: España, Portugal, Francia, Italia, Alemania, Argentina, Chile, Uruguay... Planifica rutas y viaja con libertad. Información completa de servicios, precios y ubicaciones actualizadas.',
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
  themeColor: '#0b3c74',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Favicons adicionales para máxima compatibilidad */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        {/* Meta tag moderno para reemplazar el deprecado apple-mobile-web-app-capable */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
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
        <ChatbotWidget />
        {children}
      </body>
    </html>
  )
}
