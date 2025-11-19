import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instalar App Móvil - Furgocasa | Guía Completa iPhone y Android',
  description: '📱 Instala Furgocasa como app en tu móvil en 3 sencillos pasos. Acceso instantáneo, pantalla completa y funciona offline. Guía para iPhone y Android.',
  keywords: [
    'instalar furgocasa app',
    'app furgocasa',
    'PWA furgocasa',
    'furgocasa iphone',
    'furgocasa android',
    'como instalar furgocasa',
    'app autocaravanas',
    'instalar app movil'
  ],
  openGraph: {
    title: '📱 Instala Furgocasa como App | iPhone y Android',
    description: 'Guía paso a paso para instalar Furgocasa en tu móvil. Acceso instantáneo y funciona offline. 100% gratis.',
    type: 'website',
  }
}

export default function InstalarAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

