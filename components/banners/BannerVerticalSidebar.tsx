'use client'

interface BannerProps {
  position: string
}

export function BannerVerticalSidebar({ position }: BannerProps) {
  const utmCampaign = `vertical_sidebar_${position}_area_detail`

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <div className="bg-gradient-to-b from-[#063971] to-[#042143] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-[1.02]">
        {/* Header */}
        <a
          href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#ffd935] p-6 text-center no-underline"
        >
          <div className="text-[32px] font-black text-[#063971] mb-2">⭐ Casi Cinco</div>
          <div className="text-[13px] text-[#063971] font-semibold uppercase tracking-wide">
            Los Mejores de España
          </div>
        </a>

        {/* Body */}
        <div className="p-8">
          <a
            href={`https://www.casicinco.com/restaurante?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 mb-5 no-underline group"
          >
            <div className="text-2xl flex-shrink-0">🍽️</div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-[#ffd935] mb-1 group-hover:text-[#ffe566] transition-colors">
                Restaurantes
              </div>
              <div className="text-[13px] text-white/85">Gastronomía de +4.7★</div>
            </div>
          </a>

          <a
            href={`https://www.casicinco.com/bar?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 mb-5 no-underline group"
          >
            <div className="text-2xl flex-shrink-0">🍺</div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-[#ffd935] mb-1 group-hover:text-[#ffe566] transition-colors">
                Bares
              </div>
              <div className="text-[13px] text-white/85">Ambiente y calidad</div>
            </div>
          </a>

          <a
            href={`https://www.casicinco.com/hotel?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 mb-5 no-underline group"
          >
            <div className="text-2xl flex-shrink-0">🏨</div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-[#ffd935] mb-1 group-hover:text-[#ffe566] transition-colors">
                Hoteles
              </div>
              <div className="text-[13px] text-white/85">Alojamiento premium</div>
            </div>
          </a>

          <a
            href={`https://www.casicinco.com/ruta?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 no-underline group"
          >
            <div className="text-2xl flex-shrink-0">🛣️</div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-[#ffd935] mb-1 group-hover:text-[#ffe566] transition-colors">
                Planificador Rutas
              </div>
              <div className="text-[13px] text-white/85">Crea tu itinerario</div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8">
          <a
            href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#ffd935] text-[#063971] p-4 rounded-xl font-extrabold text-base text-center transition-all hover:bg-[#ffe566] hover:shadow-[0_4px_16px_rgba(255,217,53,0.4)] no-underline"
          >
            Explorar Lugares →
          </a>
          <div className="text-center mt-4 text-xs text-white/70">
            <span className="block text-xl font-extrabold text-[#ffd935] mb-1">+3500</span>
            Lugares verificados
          </div>
        </div>
      </div>
    </div>
  )
}
