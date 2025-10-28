'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import type { Area } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

export default function EnriquecerImagenesPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processLog, setProcessLog] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProvincia, setFilterProvincia] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setAreas(data || [])
    } catch (error) {
      console.error('Error cargando áreas:', error)
    } finally {
      setLoading(false)
    }
  }

  const enrichImages = async (areaId: string): Promise<boolean> => {
    try {
      console.log('🖼️ [IMAGES] Buscando imágenes para área:', areaId)
      
      // 1. Obtener datos del área
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('*')
        .eq('id', areaId)
        .single()

      if (areaError || !area) {
        console.error('❌ Área no encontrada')
        setProcessLog(prev => [...prev, `  ❌ Área no encontrada`])
        return false
      }

      const serpApiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY_ADMIN
      
      const imagenesEncontradas: Array<{
        url: string
        fuente: string
        titulo?: string
        prioridad: number
      }> = []

      // 2. Buscar en Google Images
      console.log('🔎 Buscando en Google Images...')
      const queryImages = `"${area.nombre}" ${area.ciudad} autocaravanas`
      
      try {
        const serpImagesUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(queryImages)}&api_key=${serpApiKey}&location=Spain&hl=es&gl=es&num=20`
        const respImages = await fetch(serpImagesUrl)
        const dataImages = await respImages.json()

        if (!dataImages.error && dataImages.images_results) {
          console.log(`  ✅ ${dataImages.images_results.length} imágenes en Google Images`)
          
          dataImages.images_results.slice(0, 10).forEach((img: any) => {
            if (img.original && esImagenValida(img.original)) {
              imagenesEncontradas.push({
                url: img.original,
                fuente: 'Google Images',
                titulo: img.title,
                prioridad: 2
              })
            }
          })
        }
      } catch (e) {
        console.log('  ⚠️ Error buscando imágenes:', e)
      }

      // 3. Buscar en Park4night
      console.log('🏕️ Buscando en Park4night...')
      const queryPark4night = `"${area.nombre}" ${area.ciudad} site:park4night.com`
      
      try {
        const serpPark4nightUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(queryPark4night)}&api_key=${serpApiKey}&num=10`
        const respPark = await fetch(serpPark4nightUrl)
        const dataPark = await respPark.json()

        if (!dataPark.error && dataPark.images_results) {
          console.log(`  ✅ ${dataPark.images_results.length} imágenes en Park4night`)
          
          dataPark.images_results.forEach((img: any) => {
            if (img.original && esImagenValida(img.original)) {
              imagenesEncontradas.push({
                url: img.original,
                fuente: 'Park4night',
                titulo: img.title,
                prioridad: 1 // Alta prioridad
              })
            }
          })
        }
      } catch (e) {
        console.log('  ⚠️ Error buscando Park4night:', e)
      }

      // 4. Filtrar duplicados y ordenar
      const imagenesUnicas = eliminarDuplicados(imagenesEncontradas)
      imagenesUnicas.sort((a, b) => a.prioridad - b.prioridad)

      console.log(`📊 Total imágenes encontradas: ${imagenesUnicas.length}`)

      if (imagenesUnicas.length === 0) {
        setProcessLog(prev => [...prev, `  ⚠️ No se encontraron imágenes`])
        return false
      }

      // 5. Guardar en BD
      const foto_principal = imagenesUnicas[0]?.url || null
      const fotos_urls = imagenesUnicas.slice(0, 7).map(img => img.url)

      console.log('💾 Actualizando base de datos...')
      const { error: updateError } = await supabase
        .from('areas')
        .update({
          foto_principal: foto_principal,
          fotos_urls: fotos_urls,
          updated_at: new Date().toISOString()
        })
        .eq('id', areaId)

      if (updateError) {
        console.error('❌ Error al actualizar BD:', updateError)
        setProcessLog(prev => [...prev, `  ❌ Error guardando imágenes`])
        return false
      }

      console.log('✅ Imágenes guardadas exitosamente!')
      return true

    } catch (error) {
      console.error('❌ Error enriqueciendo imágenes:', error)
      setProcessLog(prev => [...prev, `  ❌ Error de red: ${error}`])
      return false
    }
  }

  const esImagenValida = (url: string): boolean => {
    if (!url) return false
    
    // Evitar imágenes pequeñas de iconos o tracking
    const blacklist = [
      'logo', 'icon', 'avatar', 'pixel', 'badge',
      'tracking', 'analytics', 'ad.', '/ads/',
      'favicon', 'sprite', 'thumb',
      '1x1', '16x16', '32x32', '64x64',
      'data:image', 'base64'
    ]
    
    const urlLower = url.toLowerCase()
    return !blacklist.some(term => urlLower.includes(term))
  }

  const eliminarDuplicados = (imagenes: Array<{url: string, fuente: string, titulo?: string, prioridad: number}>) => {
    const urlsVistas = new Set<string>()
    return imagenes.filter(img => {
      if (urlsVistas.has(img.url)) {
        return false
      }
      urlsVistas.add(img.url)
      return true
    })
  }

  const handleEnrichSelected = async () => {
    if (selectedIds.length === 0) {
      alert('❌ Selecciona al menos un área para enriquecer')
      return
    }

    const confirmacion = confirm(
      `¿Enriquecer imágenes de ${selectedIds.length} área(s)?\n\n` +
      `Esto buscará imágenes en:\n` +
      `- Web oficial del área\n` +
      `- Park4night\n` +
      `- Google Images\n\n` +
      `Tiempo estimado: ${selectedIds.length * 15} segundos`
    )

    if (!confirmacion) return

    setProcessing(true)
    setProcessLog([])

    for (let i = 0; i < selectedIds.length; i++) {
      const areaId = selectedIds[i]
      const area = areas.find(a => a.id === areaId)
      
      if (!area) continue

      setProcessLog(prev => [...prev, `\n🖼️ Procesando: ${area.nombre} (${i + 1}/${selectedIds.length})...`])
      
      const success = await enrichImages(areaId)
      
      if (success) {
        setProcessLog(prev => [...prev, `✅ ${area.nombre} - Imágenes encontradas y guardadas`])
      } else {
        setProcessLog(prev => [...prev, `✗ ${area.nombre} - No se encontraron imágenes`])
      }

      // Pausa entre requests para no saturar
      if (i < selectedIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setProcessLog(prev => [...prev, `\n✅ Completado: ${selectedIds.length} área(s) procesadas`])
    setProcessLog(prev => [...prev, `🔄 Recargando lista de áreas...`])
    
    // Recargar áreas
    await fetchAreas()
    
    // Limpiar selección
    setSelectedIds([])
    
    setProcessLog(prev => [...prev, `✅ Lista actualizada`])
    setProcessing(false)
    
    // Mostrar mensaje de éxito
    setTimeout(() => {
      alert(`✅ Proceso completado\n\n${selectedIds.length} área(s) procesada(s) exitosamente`)
    }, 500)
  }

  const provincias = Array.from(new Set(areas.map(a => a.provincia).filter((p): p is string => p !== null))).sort()

  const areasFiltradas = areas.filter(area => {
    const matchSearch = searchTerm === '' || 
      area.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.provincia?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchProvincia = filterProvincia === '' || area.provincia === filterProvincia

    return matchSearch && matchProvincia
  })

  // Filtrar áreas sin foto_principal
  const areasSinImagenes = areasFiltradas.filter(a => !a.foto_principal)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/areas" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Áreas
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <PhotoIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enriquecer Imágenes</h1>
              <p className="text-gray-600 mt-1">Busca y añade imágenes automáticamente a las áreas</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar área</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o ciudad..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
              <select
                value={filterProvincia}
                onChange={(e) => setFilterProvincia(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas las provincias</option>
                {provincias.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setSelectedIds(areasSinImagenes.map(a => a.id))}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Seleccionar sin imágenes ({areasSinImagenes.length})
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Deseleccionar todas
              </button>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleEnrichSelected}
            disabled={processing || selectedIds.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
              processing || selectedIds.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            <PhotoIcon className="w-5 h-5" />
            {processing ? 'Procesando...' : `Enriquecer ${selectedIds.length} área(s)`}
          </button>
        </div>

        {/* Lista de áreas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === areasFiltradas.length && areasFiltradas.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(areasFiltradas.map(a => a.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imágenes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Cargando áreas...
                    </td>
                  </tr>
                ) : areasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No hay áreas que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  areasFiltradas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(area.id)}
                          onChange={() => {
                            if (selectedIds.includes(area.id)) {
                              setSelectedIds(selectedIds.filter(id => id !== area.id))
                            } else {
                              setSelectedIds([...selectedIds, area.id])
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{area.nombre}</div>
                        <div className="text-sm text-gray-500">{area.ciudad}, {area.provincia}</div>
                      </td>
                      <td className="px-6 py-4">
                        {area.foto_principal ? (
                          <div className="flex items-center gap-2">
                            <img src={area.foto_principal} alt="" className="w-16 h-12 object-cover rounded" />
                            <span className="text-sm text-gray-600">
                              {area.fotos_urls?.length || 0} foto(s)
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin imágenes</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {area.foto_principal ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Con imágenes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠ Sin imágenes
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de procesamiento */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="animate-spin">
                    <PhotoIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">🖼️ Buscando Imágenes</h3>
                    <p className="text-purple-100 text-sm">Scrapeando webs y plataformas...</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-900 overflow-y-auto max-h-96">
                <div className="font-mono text-sm space-y-2">
                  {processLog.map((line, idx) => (
                    <div 
                      key={idx}
                      className={`${
                        line.includes('✅') ? 'text-green-400' :
                        line.includes('✗') ? 'text-red-400' :
                        line.includes('Procesando') ? 'text-yellow-400 animate-pulse' :
                        'text-gray-400'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log final */}
        {processLog.length > 0 && !processing && (
          <div className="mt-6 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {processLog.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

