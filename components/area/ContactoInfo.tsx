'use client'

import type { Area } from '@/types/database.types'
import { PhoneIcon, EnvelopeIcon, GlobeAltIcon, MapIcon } from '@heroicons/react/24/outline'

interface Props {
  area: Area
}

export function ContactoInfo({ area }: Props) {
  const handlePhoneClick = () => {
    // Track analytics
    console.log('Phone click:', area.id)
  }

  const handleEmailClick = () => {
    // Track analytics
    console.log('Email click:', area.id)
  }

  const handleWebsiteClick = () => {
    // Track analytics
    console.log('Website click:', area.id)
  }

  const handleGoogleMapsClick = () => {
    // Track analytics
    console.log('Google Maps click:', area.id)
  }

  const hasContactInfo = area.telefono || area.email || area.website || area.google_maps_url

  if (!hasContactInfo) {
    return null
  }

  return (
    <section className="bg-white rounded-lg shadow-mobile p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Contacto</h2>

      <div className="space-y-3">
        {/* Teléfono */}
        {area.telefono && (
          <a
            href={`tel:${area.telefono}`}
            onClick={handlePhoneClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <PhoneIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium">Teléfono</p>
              <p className="text-sm font-semibold text-gray-900">{area.telefono}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {/* Email */}
        {area.email && (
          <a
            href={`mailto:${area.email}`}
            onClick={handleEmailClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <EnvelopeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 font-medium">Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{area.email}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {/* Website */}
        {area.website && (
          <a
            href={area.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWebsiteClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <GlobeAltIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 font-medium">Sitio web</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{area.website}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {/* Google Maps */}
        {area.google_maps_url && (
          <a
            href={area.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleGoogleMapsClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <MapIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium">Google Maps</p>
              <p className="text-sm font-semibold text-gray-900">Ver en Google Maps</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </section>
  )
}
