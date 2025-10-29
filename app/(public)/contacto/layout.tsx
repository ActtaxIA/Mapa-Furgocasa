import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto - Mapa Furgocasa | Atención al Cliente y Soporte',
  description: 'Contacta con el equipo de Mapa Furgocasa. Resolvemos tus dudas sobre áreas de autocaravanas, planificación de rutas y servicios. Email: info@furgocasa.com. Respuesta en 24-48 horas.',
  keywords: [
    'contacto furgocasa',
    'soporte mapa furgocasa',
    'ayuda autocaravanas',
    'consultas áreas autocaravanas'
  ],
  openGraph: {
    title: 'Contacta con Furgocasa - Estamos Aquí para Ayudarte',
    description: 'Ponte en contacto con nuestro equipo. Respuestas rápidas a tus consultas sobre áreas y rutas en autocaravana.',
    url: 'https://www.mapafurgocasa.com/contacto',
  },
}

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

