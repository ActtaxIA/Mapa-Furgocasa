'use client'

interface BannerProps {
  position: string
}

export function BannerCuadradoMedium({ position }: BannerProps) {
  const utmCampaign = `cuadrado_medium_${position}_area_detail`

  return (
    <div className="w-full max-w-[350px] mx-auto">
      <div className="relative w-full h-[350px] md:h-[350px] bg-gradient-to-br from-[#063971] to-[#052d5a] rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.4)]">
        {/* Fondo decorativo */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255, 217, 53, 0.1) 0%, transparent 70%)',
          }}
        />

        <a
          href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex flex-col items-center justify-center h-full px-8 py-8 text-white no-underline text-center gap-6 z-10"
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-6xl animate-pulse" style={{
              animation: 'glow 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 15px rgba(255, 217, 53, 0.6))',
            }}>
              ⭐
            </div>
            <div className="text-[40px] font-black text-[#ffd935] text-shadow-lg leading-none tracking-tighter">
              Casi Cinco
            </div>
          </div>

          {/* Tagline */}
          <div className="text-[15px] text-white/95 font-medium leading-relaxed max-w-[260px]">
            Los mejores lugares + Planificador de Rutas IA
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[22px] font-black text-[#ffd935] leading-none">
                +3500
              </span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">
                Lugares
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[22px] font-black text-[#ffd935] leading-none">
                4.7★
              </span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">
                Mínimo
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[22px] font-black text-[#ffd935] leading-none">
                50+
              </span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">
                Ciudades
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="relative bg-gradient-to-br from-[#ffd935] to-[#ffe566] text-[#063971] px-10 py-4 rounded-[14px] font-black text-base transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,217,53,0.6)] shadow-[0_6px_20px_rgba(255,217,53,0.4)] overflow-hidden group">
            <span className="relative z-10 inline-flex items-center gap-2">
              Descubrir
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </a>
      </div>
    </div>
  )
}
