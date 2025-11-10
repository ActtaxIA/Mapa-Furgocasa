'use client'

interface BannerProps {
  position: string
}

export function BannerMobile({ position }: BannerProps) {
  const utmCampaign = `mobile_${position}_area_detail`

  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="bg-gradient-to-br from-[#063971] to-[#042143] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        <div className="flex items-center justify-between p-4 gap-4">
          <a
            href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 flex-1 no-underline text-white"
          >
            <div className="text-4xl animate-[spin_3s_ease-in-out_infinite]">⭐</div>
            <div className="flex-1">
              <div className="text-lg font-black text-[#ffd935] leading-none mb-0.5">
                Casi Cinco
              </div>
              <div className="text-[11px] text-white/90 leading-tight mb-1">
                +3500 lugares + Rutas IA
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#ffd935] font-semibold">
                <span>★★★★★</span>
                <span>+4.7 rating</span>
              </div>
            </div>
          </a>
          <a
            href={`https://www.casicinco.com?utm_source=furgocasa&utm_medium=banner&utm_campaign=${utmCampaign}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ffd935] text-[#063971] px-4 py-2.5 rounded-lg font-extrabold text-[13px] whitespace-nowrap transition-all hover:bg-[#ffe566] hover:scale-105 no-underline shadow-[0_2px_8px_rgba(255,217,53,0.3)]"
          >
            Ver →
          </a>
        </div>
      </div>
    </div>
  )
}
