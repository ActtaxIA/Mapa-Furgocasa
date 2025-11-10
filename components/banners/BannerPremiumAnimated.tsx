'use client'

interface BannerProps {
  position: string
}

export function BannerPremiumAnimated({ position }: BannerProps) {
  const utmCampaign = `premium_animated_${position}_area_detail`

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="relative bg-gradient-to-br from-[#063971] via-[#052d5a] to-[#042143] rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        {/* Efecto de brillo animado */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none animate-shine"
          style={{
            background:
              'linear-gradient(45deg, transparent 30%, rgba(255, 217, 53, 0.1) 50%, transparent 70%)',
          }}
        />

        <div className="relative z-10 p-10 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
          {/* Sección Izquierda */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-bounce">⭐</div>
              <div className="flex flex-col gap-1">
                <a
                  href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-5xl font-black text-[#ffd935] leading-none tracking-tighter no-underline hover:text-[#ffe566] transition-colors"
                >
                  Casi Cinco
                </a>
                <span className="inline-block bg-[#ffd935]/20 border-2 border-[#ffd935] px-3 py-1 rounded-2xl text-xs font-bold text-[#ffd935] uppercase tracking-wider">
                  Verificado Google
                </span>
              </div>
            </div>

            <div className="text-xl text-white/95 font-medium leading-relaxed">
              Descubre los mejores restaurantes, bares y hoteles de España. Solo lugares con
              +4.7★ en Google Maps.
            </div>

            {/* Grid de features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={`https://www.casicinco.com/ruta?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl transition-all hover:bg-[#ffd935]/10 hover:border-[#ffd935]/30 hover:translate-x-2 no-underline group"
              >
                <div className="text-3xl">🛣️</div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-white group-hover:text-[#ffd935] transition-colors">
                    Planificador de Rutas
                  </div>
                  <div className="text-xs text-white/70">Crea tu itinerario perfecto</div>
                </div>
              </a>

              <a
                href={`https://www.casicinco.com/mapa?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl transition-all hover:bg-[#ffd935]/10 hover:border-[#ffd935]/30 hover:translate-x-2 no-underline group"
              >
                <div className="text-3xl">🤖</div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-white group-hover:text-[#ffd935] transition-colors">
                    Chat IA
                  </div>
                  <div className="text-xs text-white/70">Recomendaciones personalizadas</div>
                </div>
              </a>

              <a
                href={`https://www.casicinco.com/mapa?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl transition-all hover:bg-[#ffd935]/10 hover:border-[#ffd935]/30 hover:translate-x-2 no-underline group"
              >
                <div className="text-3xl">🗺️</div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-white group-hover:text-[#ffd935] transition-colors">
                    Mapa Interactivo
                  </div>
                  <div className="text-xs text-white/70">Explora por ubicación</div>
                </div>
              </a>

              <a
                href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl transition-all hover:bg-[#ffd935]/10 hover:border-[#ffd935]/30 hover:translate-x-2 no-underline group"
              >
                <div className="text-3xl">⭐</div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-white group-hover:text-[#ffd935] transition-colors">
                    +3500 Lugares
                  </div>
                  <div className="text-xs text-white/70">Solo +4.7★ verificados</div>
                </div>
              </a>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-gradient-to-br from-[#ffd935] to-[#ffe566] text-[#063971] px-12 py-5 rounded-2xl font-black text-xl transition-all hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(255,217,53,0.7)] shadow-[0_8px_32px_rgba(255,217,53,0.5)] no-underline overflow-hidden group"
              >
                <span className="relative z-10">Explorar Ahora →</span>
              </a>
              <div className="text-sm text-white/80 flex items-center gap-2">
                <span>🔥</span>
                <span>
                  <span className="text-lg font-bold text-[#ffd935]">+3500</span> lugares
                  verificados
                </span>
              </div>
            </div>
          </div>

          {/* Sección Derecha - Stats o visualización (opcional en diseño responsive) */}
          <div className="hidden lg:flex flex-col gap-4 w-80">
            <div className="text-[#ffd935] text-base font-bold uppercase tracking-wider mb-2">
              🌟 Destacados
            </div>
            <div className="space-y-3">
              <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/14 hover:border-[#ffd935]/40 hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <div className="text-4xl mb-3">🍽️</div>
                <div className="text-base font-bold text-white mb-1.5">Restaurantes TOP</div>
                <div className="text-xs text-white/60 mb-2">📍 Madrid, Barcelona, Valencia</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-extrabold text-[#ffd935]">4.9</span>
                </div>
              </div>

              <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/14 hover:border-[#ffd935]/40 hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <div className="text-4xl mb-3">🍺</div>
                <div className="text-base font-bold text-white mb-1.5">Bares & Tapas</div>
                <div className="text-xs text-white/60 mb-2">📍 Toda España</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-extrabold text-[#ffd935]">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
