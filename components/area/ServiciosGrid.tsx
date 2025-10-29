import type { Servicios } from '@/types/database.types'

interface Props {
  servicios: Servicios
}

export function ServiciosGrid({ servicios }: Props) {
  const serviciosConfig = [
    { key: 'agua', label: 'Agua', icon: '💧', color: 'text-blue-600' },
    { key: 'electricidad', label: 'Electricidad', icon: '⚡', color: 'text-yellow-600' },
    { key: 'vaciado_aguas_negras', label: 'Vaciado Químico', icon: '♻️', color: 'text-gray-600' },
    { key: 'vaciado_aguas_grises', label: 'Vaciado Aguas Grises', icon: '🚰', color: 'text-gray-500' },
    { key: 'wifi', label: 'WiFi', icon: '📶', color: 'text-purple-600' },
    { key: 'duchas', label: 'Duchas', icon: '🚿', color: 'text-blue-500' },
    { key: 'wc', label: 'WC', icon: '🚻', color: 'text-gray-700' },
    { key: 'lavanderia', label: 'Lavandería', icon: '🧺', color: 'text-indigo-600' },
    { key: 'restaurante', label: 'Restaurante', icon: '🍽️', color: 'text-orange-600' },
    { key: 'supermercado', label: 'Supermercado', icon: '🛒', color: 'text-green-600' },
    { key: 'zona_mascotas', label: 'Zona Mascotas', icon: '🐕', color: 'text-amber-600' },
  ]

  // Contar servicios disponibles
  const serviciosDisponibles = Object.values(servicios).filter(Boolean).length
  const serviciosTotales = serviciosConfig.length

  return (
    <section className="bg-white rounded-lg shadow-mobile p-6 border-t-4 border-[#0b3c74]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#0b3c74]">Servicios</h2>
        <span className="text-sm font-semibold text-[#0b3c74] bg-sky-50 px-3 py-1 rounded-full">
          {serviciosDisponibles} de {serviciosTotales}
        </span>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {serviciosConfig.map(({ key, label, icon, color }) => {
          const disponible = servicios[key as keyof Servicios]
          
          return (
            <div
              key={key}
              className={`
                flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                ${disponible 
                  ? 'bg-sky-50 border-[#0b3c74] shadow-sm' 
                  : 'bg-gray-50 border-gray-200 opacity-50'
                }
              `}
            >
              <span className={`text-2xl ${disponible ? '' : 'grayscale'}`}>
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${disponible ? 'text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </p>
                {disponible && (
                  <p className="text-xs text-[#0b3c74] font-semibold">✓ Disponible</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota si no hay servicios */}
      {serviciosDisponibles === 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ℹ️ No hay información de servicios disponible para esta área.
          </p>
        </div>
      )}
    </section>
  )
}
