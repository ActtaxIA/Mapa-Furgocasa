'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Valoracion } from '@/types/database.types'

interface Props {
  areaId: string
  areaNombre: string
  valoraciones: Valoracion[]
}

export function ValoracionesCompleto({ areaId, areaNombre, valoraciones: initialValoraciones }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [valoraciones, setValoraciones] = useState(initialValoraciones)
  const { toast, showToast, hideToast } = useToast()
  
  const [formData, setFormData] = useState({
    rating: 0,
    comentario: ''
  })

  const [visitData, setVisitData] = useState({
    fecha_visita: new Date().toISOString().split('T')[0],
    notas: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }

  const handleRegistrarVisita = async () => {
    if (!user) {
      showToast('Debes iniciar sesión para registrar visitas', 'info')
      setTimeout(() => router.push('/auth/login'), 1500)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('visitas')
        .insert({
          user_id: user.id,
          area_id: areaId,
          fecha_visita: visitData.fecha_visita,
          notas: visitData.notas || null
        })

      if (error) throw error

      setShowVisitModal(false)
      setShowSuccessModal(true)
      setVisitData({
        fecha_visita: new Date().toISOString().split('T')[0],
        notas: ''
      })

      // Cerrar modal de éxito después de 2 segundos y mostrar formulario de valoración
      setTimeout(() => {
        setShowSuccessModal(false)
        setShowForm(true)
      }, 2000)
    } catch (error: any) {
      console.error('Error registrando visita:', error)
      if (error.code === '23505') {
        showToast('Ya has registrado una visita en esta fecha', 'error')
      } else {
        showToast(`Error al registrar visita: ${error.message}`, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitValoracion = async () => {
    if (!user) {
      showToast('Debes iniciar sesión para valorar', 'info')
      setTimeout(() => router.push('/auth/login'), 1500)
      return
    }

    if (formData.rating === 0) {
      showToast('Por favor selecciona una puntuación', 'error')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('valoraciones')
        .insert({
          user_id: user.id,
          area_id: areaId,
          rating: formData.rating,
          comentario: formData.comentario.trim() || null
        })
        .select()

      if (error) throw error

      // Recargar valoraciones
      const { data: newValoraciones } = await supabase
        .from('valoraciones')
        .select('*')
        .eq('area_id', areaId)
        .order('created_at', { ascending: false })

      if (newValoraciones) {
        setValoraciones(newValoraciones)
      }

      showToast('✅ ¡Valoración publicada con éxito!', 'success')
      setShowForm(false)
      setFormData({ rating: 0, comentario: '' })
      router.refresh()
    } catch (error: any) {
      console.error('Error creando valoración:', error)
      if (error.code === '23505') {
        showToast('Ya has valorado esta área. Solo puedes dejar una valoración por área.', 'error')
      } else {
        showToast(`Error al publicar valoración: ${error.message}`, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // Calcular estadísticas
  const totalValoraciones = valoraciones.length
  const ratingPromedio = totalValoraciones > 0
    ? (valoraciones.reduce((sum, v) => sum + v.rating, 0) / totalValoraciones).toFixed(1)
    : '0.0'

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => 
    valoraciones.filter(v => v.rating === stars).length
  )

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      <section className="bg-white rounded-lg shadow-mobile p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Valoraciones</h2>

        {/* Resumen de valoraciones */}
        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">{ratingPromedio}</div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(ratingPromedio))
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {totalValoraciones} {totalValoraciones === 1 ? 'valoración' : 'valoraciones'}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars, index) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{stars}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: totalValoraciones > 0
                        ? `${(ratingCounts[index] / totalValoraciones) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {ratingCounts[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowVisitModal(true)}
            className="py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Registrar Visita
          </button>
          <button
            onClick={() => {
              if (!user) {
                router.push('/auth/login')
              } else {
                setShowForm(!showForm)
              }
            }}
            className="py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors"
          >
            ✍️ Escribir valoración
          </button>
        </div>

        {/* Formulario de valoración */}
        {showForm && user && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Tu valoración</h3>
            
            {/* Selector de estrellas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntuación *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    {star <= formData.rating ? (
                      <StarIcon className="w-10 h-10 text-yellow-400" />
                    ) : (
                      <StarOutlineIcon className="w-10 h-10 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Comentario */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={formData.comentario}
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                placeholder="Comparte tu experiencia..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comentario.length}/1000 caracteres
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitValoracion}
                disabled={loading || formData.rating === 0}
                className="flex-1 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publicando...' : 'Publicar Valoración'}
              </button>
              <button 
                onClick={() => {
                  setShowForm(false)
                  setFormData({ rating: 0, comentario: '' })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de valoraciones */}
        {totalValoraciones > 0 ? (
          <div className="space-y-4">
            {valoraciones.map((valoracion) => (
              <div
                key={valoracion.id}
                className="pb-4 border-b border-gray-200 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Usuario</p>
                      <p className="text-xs text-gray-500">
                        {new Date(valoracion.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${
                          star <= valoracion.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {valoracion.comentario && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {valoracion.comentario}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">📝 Aún no hay valoraciones</p>
            <p className="text-sm text-gray-400">¡Sé el primero en valorar esta área!</p>
          </div>
        )}
      </section>

      {/* Modal Registrar Visita */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Registrar Visita a {areaNombre}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de visita *
                </label>
                <input
                  type="date"
                  value={visitData.fecha_visita}
                  onChange={(e) => setVisitData({ ...visitData, fecha_visita: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={visitData.notas}
                  onChange={(e) => setVisitData({ ...visitData, notas: e.target.value })}
                  placeholder="¿Cómo fue tu experiencia? ¿Algún consejo?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRegistrarVisita}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Visita'}
                </button>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¡Visita registrada!
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Quieres valorar tu experiencia en {areaNombre}?
            </p>
            <p className="text-sm text-gray-500">
              Se abrirá el formulario de valoración...
            </p>
          </div>
        </div>
      )}
    </>
  )
}

