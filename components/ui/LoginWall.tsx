'use client'

import Link from 'next/link'

interface LoginWallProps {
  onClose?: () => void
}

export default function LoginWall({ onClose }: LoginWallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
        {/* Icono de candado */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Planificador de Rutas Bloqueado
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          Para usar la herramienta de <span className="font-semibold text-blue-600">Planificación de Rutas</span>, 
          la más potente de nuestra app, es necesario registrarse e iniciar sesión.
        </p>

        {/* Beneficios */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
          <p className="text-sm font-semibold text-blue-900 mb-2">✨ Al registrarte obtendrás:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>🗺️ Planificador de rutas avanzado</li>
            <li>💾 Guardar rutas personalizadas</li>
            <li>⭐ Valorar y comentar áreas</li>
            <li>💙 Guardar favoritos</li>
            <li>📝 Registrar tus visitas</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <Link
            href="/auth/register"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Registrarme Gratis
          </Link>
          
          <Link
            href="/auth/login"
            className="block w-full bg-white border-2 border-gray-300 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Texto pequeño */}
        <p className="text-xs text-gray-500 text-center mt-4">
          ✓ Acceso inmediato · ✓ 100% gratis · ✓ Sin tarjeta de crédito
        </p>
      </div>
    </div>
  )
}

