'use client'

interface BannerProps {
  position: string
}

export function BannerWideCarousel({ position }: BannerProps) {
  const utmCampaign = `wide_carousel_${position}_area_detail`

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="relative bg-gradient-to-br from-[#063971] via-[#052d5a] to-[#042143] rounded-3xl overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.3)]">
        {/* Efecto de part ículas de fondo */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 50%, rgba(255, 217, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 217, 53, 0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 p-10 md:p-14">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex-1">
              <a
                href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-2 no-underline"
              >
                <div className="text-5xl font-black text-[#ffd935] mb-2 tracking-tighter text-shadow-lg">
                  ⭐ Casi Cinco
                </div>
              </a>
              <div className="text-lg text-white/95 mb-4">
                Descubre los mejores restaurantes, bares y hoteles de España
              </div>
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#ffd935]">+3500</span>
                  <span className="text-[13px] text-white/80">lugares verificados</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#ffd935]">4.7★</span>
                  <span className="text-[13px] text-white/80">mínimo rating</span>
                </div>
                <a
                  href={`https://www.casicinco.com/mapa?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline gap-1.5 no-underline hover:opacity-80 transition-opacity"
                >
                  <span className="text-3xl font-black text-[#ffd935]">50+</span>
                  <span className="text-[13px] text-white/80">ciudades</span>
                </a>
              </div>
            </div>
            <div className="text-center">
              <a
                href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block bg-gradient-to-br from-[#ffd935] to-[#ffe566] text-[#063971] px-12 py-5 rounded-2xl font-black text-xl transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,217,53,0.6)] shadow-[0_8px_24px_rgba(255,217,53,0.4)] no-underline overflow-hidden group"
              >
                <span className="relative z-10">Explorar Ahora →</span>
              </a>
              <a
                href={`https://www.casicinco.com/ruta?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-xs text-white/70 no-underline hover:text-[#ffd935] transition-colors"
              >
                🛣️ Planificador de Rutas + Chat IA
              </a>
            </div>
          </div>

          {/* Carrusel de lugares */}
          <div className="relative overflow-hidden py-5">
            <div className="flex gap-4 animate-scroll hover:pause-animation">
              {/* Lugar 1 */}
              <a
                href={`https://www.casicinco.com/restaurante/madrid?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[280px] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/12 hover:border-[#ffd935]/40 hover:-translate-y-1 no-underline"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🍽️</div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-white mb-1">DiverXO</div>
                    <div className="text-xs text-white/70">📍 Madrid</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-bold text-[#ffd935]">4.9</span>
                  <span className="text-[11px] text-white/60">(1.2k reseñas)</span>
                </div>
                <div className="inline-block bg-[#ffd935]/15 border border-[#ffd935]/30 px-3 py-1 rounded-xl text-[11px] text-[#ffd935] font-semibold mt-2">
                  Restaurante
                </div>
              </a>

              {/* Lugar 2 */}
              <a
                href={`https://www.casicinco.com/bar/barcelona?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[280px] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/12 hover:border-[#ffd935]/40 hover:-translate-y-1 no-underline"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🍺</div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-white mb-1">Bobby's Free</div>
                    <div className="text-xs text-white/70">📍 Barcelona</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-bold text-[#ffd935]">4.8</span>
                  <span className="text-[11px] text-white/60">(856 reseñas)</span>
                </div>
                <div className="inline-block bg-[#ffd935]/15 border border-[#ffd935]/30 px-3 py-1 rounded-xl text-[11px] text-[#ffd935] font-semibold mt-2">
                  Bar
                </div>
              </a>

              {/* Lugar 3 */}
              <a
                href={`https://www.casicinco.com/hotel/barcelona?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[280px] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/12 hover:border-[#ffd935]/40 hover:-translate-y-1 no-underline"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🏨</div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-white mb-1">Hotel Arts</div>
                    <div className="text-xs text-white/70">📍 Barcelona</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-bold text-[#ffd935]">4.9</span>
                  <span className="text-[11px] text-white/60">(2.3k reseñas)</span>
                </div>
                <div className="inline-block bg-[#ffd935]/15 border border-[#ffd935]/30 px-3 py-1 rounded-xl text-[11px] text-[#ffd935] font-semibold mt-2">
                  Hotel
                </div>
              </a>

              {/* Lugar 4 */}
              <a
                href={`https://www.casicinco.com/restaurante/valencia?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[280px] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/12 hover:border-[#ffd935]/40 hover:-translate-y-1 no-underline"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🍽️</div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-white mb-1">Quique Dacosta</div>
                    <div className="text-xs text-white/70">📍 Valencia</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-bold text-[#ffd935]">4.8</span>
                  <span className="text-[11px] text-white/60">(980 reseñas)</span>
                </div>
                <div className="inline-block bg-[#ffd935]/15 border border-[#ffd935]/30 px-3 py-1 rounded-xl text-[11px] text-[#ffd935] font-semibold mt-2">
                  Restaurante
                </div>
              </a>

              {/* Duplicados para efecto infinito */}
              <a
                href={`https://www.casicinco.com/restaurante/madrid?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[280px] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 transition-all hover:bg-white/12 hover:border-[#ffd935]/40 hover:-translate-y-1 no-underline"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🍽️</div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-white mb-1">DiverXO</div>
                    <div className="text-xs text-white/70">📍 Madrid</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#ffd935] text-sm">★★★★★</span>
                  <span className="text-lg font-bold text-[#ffd935]">4.9</span>
                  <span className="text-[11px] text-white/60">(1.2k reseñas)</span>
                </div>
                <div className="inline-block bg-[#ffd935]/15 border border-[#ffd935]/30 px-3 py-1 rounded-xl text-[11px] text-[#ffd935] font-semibold mt-2">
                  Restaurante
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
