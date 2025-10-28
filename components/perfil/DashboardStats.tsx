'use client'

import { 
  MapPinIcon, 
  HeartIcon, 
  StarIcon, 
  MapIcon 
} from '@heroicons/react/24/outline'

interface Props {
  stats: {
    totalVisitas: number
    totalValoraciones: number
    totalFavoritos: number
    totalRutas: number
    promedioRating: number
  }
}

export function DashboardStats({ stats }: Props) {
  const cards = [
    {
      title: 'Visitas',
      value: stats.totalVisitas,
      icon: MapPinIcon,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Valoraciones',
      value: stats.totalValoraciones,
      icon: StarIcon,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtitle: stats.promedioRating > 0 ? `${stats.promedioRating.toFixed(1)} ⭐` : null,
    },
    {
      title: 'Favoritos',
      value: stats.totalFavoritos,
      icon: HeartIcon,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Rutas',
      value: stats.totalRutas,
      icon: MapIcon,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.bgColor} rounded-xl p-6 border border-gray-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

