import type { Area } from '@/types/database.types'

interface Props {
  area: Area
}

export function InformacionBasica({ area }: Props) {
  return (
    <section className="bg-white rounded-lg shadow-mobile p-6 border-t-4 border-[#0b3c74]">
      <h2 className="text-xl font-bold text-[#0b3c74] mb-4">Información</h2>

      {/* Descripción */}
      {area.descripcion && (
        <div className="text-gray-700 mb-6 leading-relaxed space-y-4">
          {area.descripcion
            .split(/\r?\n\r?\n/)
            .filter((p: any) => p.trim().length > 0)
            .map((parrafo: any, index: any) => (
              <p key={index} className="text-justify">{parrafo.trim()}</p>
            ))}
        </div>
      )}

      {/* Características clave */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Plazas */}
        {area.plazas_totales && (
          <div className="text-center p-3 bg-sky-50 rounded-lg border border-sky-200">
            <div className="text-2xl mb-1">🚐</div>
            <div className="text-xs text-sky-700 font-medium">Plazas</div>
            <div className="text-sm font-semibold text-sky-900">{area.plazas_totales} total</div>
          </div>
        )}

        {/* Acceso 24h */}
        <div className="text-center p-3 bg-sky-50 rounded-lg border border-sky-200">
          <div className="text-2xl mb-1">{area.acceso_24h ? '🕐' : '⏰'}</div>
          <div className="text-xs text-sky-700 font-medium">Acceso</div>
          <div className="text-sm font-semibold text-sky-900">{area.acceso_24h ? '24 horas' : 'Horario'}</div>
        </div>

        {/* Altura máxima */}
        {area.barrera_altura && (
          <div className="text-center p-3 bg-sky-50 rounded-lg border border-sky-200">
            <div className="text-2xl mb-1">📏</div>
            <div className="text-xs text-sky-700 font-medium">Altura máx</div>
            <div className="text-sm font-semibold text-sky-900">{area.barrera_altura}m</div>
          </div>
        )}

        {/* Precio */}
        {area.precio_noche !== null && (
          <div className="text-center p-3 bg-[#0b3c74] rounded-lg shadow-lg">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xs text-white/80 font-medium">Precio</div>
            <div className="text-sm font-bold text-white">
              {area.precio_noche === 0 ? 'Gratis' : `${area.precio_noche}€`}
            </div>
          </div>
        )}
      </div>

      {/* Ubicación detallada */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">📍 Ubicación</h3>
        <div className="space-y-2 text-sm text-gray-600">
          {area.direccion && (
            <p><span className="font-medium">Dirección:</span> {area.direccion}</p>
          )}
          {area.codigo_postal && (
            <p><span className="font-medium">CP:</span> {area.codigo_postal}</p>
          )}
          <p>
            <span className="font-medium">Ciudad:</span> {area.ciudad}
          </p>
          <p>
            <span className="font-medium">Provincia:</span> {area.provincia}
          </p>
          {area.comunidad && (
            <p><span className="font-medium">Comunidad:</span> {area.comunidad}</p>
          )}
        </div>
      </div>
    </section>
  )
}
