'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Manejo especial para rate limiting
        if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          throw new Error('Has intentado iniciar sesión demasiadas veces. Por favor, espera unos minutos e inténtalo de nuevo.')
        }
        throw error
      }

      // CRÍTICO: Esperar a que la sesión se establezca completamente
      // Esto evita que múltiples componentes intenten refrescar tokens simultáneamente
      if (data?.session) {
        // Esperar un momento para que la sesión se guarde en localStorage/cookies
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verificar que la sesión está establecida antes de redirigir
        const { data: { session: verifiedSession } } = await supabase.auth.getSession()

        if (verifiedSession) {
          // Usar router en lugar de window.location para transición más suave
          router.push('/mapa')
          router.refresh() // Forzar refresh de la página
        } else {
          throw new Error('No se pudo establecer la sesión. Por favor, intenta de nuevo.')
        }
      } else {
        throw new Error('No se recibió sesión del servidor. Por favor, intenta de nuevo.')
      }
    } catch (error: any) {
      console.error('Error de login:', error)
      setError(error.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setGoogleLoading(true)

      const supabase = createClient()

      // SIEMPRE redirigir a producción
      const redirectUrl = 'https://www.mapafurgocasa.com/auth/callback?next=/mapa'

      // Debug en consola para verificar
      console.log('🔐 OAuth redirectTo:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Asegurar que funciona tanto en móvil como en desktop
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        console.error('❌ Error OAuth:', error)
        setError(error.message || 'Error al iniciar sesión con Google')
        setGoogleLoading(false)
        return
      }

      // Si hay data.url, significa que Supabase está redirigiendo
      // En este caso, la redirección debería ser automática
      if (data?.url) {
        console.log('✅ Redirigiendo a Google OAuth:', data.url)
        // La redirección debería ser automática, pero por si acaso:
        window.location.href = data.url
      } else {
        // Si no hay URL, esperar un momento y verificar
        setTimeout(() => {
          setGoogleLoading(false)
          setError('No se pudo iniciar el proceso de autenticación con Google. Por favor, intenta de nuevo.')
        }, 2000)
      }
    } catch (error: any) {
      console.error('❌ Error en handleGoogleLogin:', error)
      setError(error.message || 'Error al iniciar sesión con Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-negro.png"
              alt="Furgocasa"
              width={200}
              height={80}
              className="mx-auto mb-4"
            />
          </Link>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Olvidaste tu contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Recordarme
                </label>
              </div>
              <Link
                href="/auth/reset-password"
                className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Login con Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Redirigiendo a Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Link volver al mapa */}
        <div className="mt-6 text-center">
          <Link
            href="/mapa"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al mapa
          </Link>
        </div>
      </div>
    </div>
  )
}
