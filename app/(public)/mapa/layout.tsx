import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mapa Interactivo de Áreas para Autocaravanas en Europa | Mapa Furgocasa',
  description: 'Explora más de 1000 áreas para autocaravanas en un mapa interactivo. Filtra por servicios, precio y ubicación en España, Portugal, Francia y Andorra. Encuentra tu próxima parada con información actualizada en tiempo real.',
  keywords: [
    'mapa áreas autocaravanas',
    'mapa interactivo autocaravanas europa',
    'encontrar áreas autocaravanas',
    'mapa parkings autocaravanas',
    'áreas ac cerca de mi',
    'mapa campings autocaravanas'
  ],
  openGraph: {
    title: 'Mapa Interactivo - +1000 Áreas para Autocaravanas en Europa',
    description: 'Encuentra y filtra áreas para autocaravanas en toda Europa. Información actualizada de servicios, precios y ubicaciones.',
    url: 'https://www.mapafurgocasa.com/mapa',
  },
}

export default function MapaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

