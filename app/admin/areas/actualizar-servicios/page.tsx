'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import type { Area } from '@/types/database.types'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface AreaConCambios extends Area {
  seleccionada: boolean
  procesando: boolean
  procesada: boolean
  error: string | null
  serviciosNuevos?: Record<string, boolean>
}

const SERVICIOS_VALIDOS = [
  'agua',
  'electricidad',
  'vaciado_aguas_negras',
  'vaciado_aguas_grises',
  'wifi',
  'duchas',
  'wc',
  'lavanderia',
  'restaurante',
  'supermercado',
  'zona_mascotas'
]

export default function ActualizarServiciosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [areas, setAreas] = useState<AreaConCambios[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [provinciaFiltro, setProvinciaFiltro] = useState('todas')
  const [provincias, setProvincias] = useState<string[]>([])
  const [soloSinWeb, setSoloSinWeb] = useState(false)
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const [configStatus, setConfigStatus] = useState<{
    ready: boolean
    checks: any
  } | null>(null)

  // Función para analizar servicios directamente desde el cliente
  const analizarServiciosArea = async (areaId: string): Promise<Record<string, boolean> | null> => {
    try {
      console.log('🔎 [SCRAPE] Analizando servicios para área:', areaId)
      
      // 1. Obtener datos del área
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('*')
        .eq('id', areaId)
        .single()

      if (areaError || !area) {
        console.error('❌ Área no encontrada')
        return null
      }

      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY_ADMIN

      // 2. Buscar información con SerpAPI (a través del proxy del servidor)
      const query = `"${area.nombre}" ${area.ciudad} ${area.provincia} servicios autocaravanas camping agua electricidad`
      
      console.log('🔍 Llamando a SerpAPI (vía proxy)...')
      const serpResponse = await fetch('/api/admin/serpapi-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, engine: 'google' })
      })

      if (!serpResponse.ok) {
        console.error('❌ Error del proxy de SerpAPI:', serpResponse.status)
        return null
      }

      const serpResult = await serpResponse.json()
      
      if (!serpResult.success) {
        console.error('❌ Error de SerpAPI:', serpResult.error)
        return null
      }

      const serpData = serpResult.data

      // 3. Construir texto para analizar
      let textoParaAnalizar = `INFORMACIÓN DEL ÁREA: ${area.nombre}, ${area.ciudad}, ${area.provincia}\n\n`

      if (serpData.organic_results) {
        serpData.organic_results.forEach((result: any) => {
          textoParaAnalizar += `${result.title}\n${result.snippet}\n\n`
        })
      }

      if (serpData.answer_box) {
        textoParaAnalizar += `${serpData.answer_box.snippet || serpData.answer_box.answer}\n\n`
      }

      console.log(`📊 Información recopilada: ${textoParaAnalizar.length} caracteres`)

      // 4. Obtener configuración del agente
      const { data: configData } = await supabase
        .from('ia_config')
        .select('config_value')
        .eq('config_key', 'scrape_services')
        .single()

      const config = configData?.config_value || {
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 300,
        prompts: [
          {
            id: 'sys-1',
            role: 'system',
            content: 'Eres un auditor crítico que analiza información sobre áreas de autocaravanas. Solo confirmas servicios con evidencia explícita. Respondes únicamente con JSON válido, sin texto adicional.',
            order: 1,
            required: true
          }
        ]
      }

      // 5. Construir mensajes para OpenAI
      const messages = config.prompts
        .sort((a: any, b: any) => a.order - b.order)
        .map((prompt: any) => {
          let content = prompt.content
            .replace(/\{\{area_nombre\}\}/g, area.nombre)
            .replace(/\{\{area_ciudad\}\}/g, area.ciudad)
            .replace(/\{\{area_provincia\}\}/g, area.provincia)
            .replace(/\{\{texto_analizar\}\}/g, textoParaAnalizar)
          
          return {
            role: prompt.role === 'agent' ? 'user' : prompt.role,
            content: content
          }
        })

      // 6. Llamar a OpenAI
      console.log('🤖 Llamando a OpenAI...')
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          temperature: config.temperature,
          max_tokens: config.max_tokens
        })
      })

      if (!openaiResponse.ok) {
        console.error('❌ Error de OpenAI:', openaiResponse.status)
        return null
      }

      const openaiData = await openaiResponse.json()
      const respuestaIA = openaiData.choices[0].message.content || '{}'

      // 7. Parsear respuesta
      let serviciosDetectados: Record<string, boolean> = {}
      try {
        const jsonMatch = respuestaIA.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          serviciosDetectados = JSON.parse(jsonMatch[0])
        } else {
          serviciosDetectados = JSON.parse(respuestaIA)
        }
      } catch (e) {
        console.error('❌ Error parseando respuesta:', respuestaIA)
        return null
      }

      // 8. Validar servicios
      const serviciosFinales: Record<string, boolean> = {}
      SERVICIOS_VALIDOS.forEach(servicio => {
        serviciosFinales[servicio] = serviciosDetectados[servicio] === true
      })

      // 9. Actualizar en la base de datos
      console.log('💾 Actualizando base de datos...')
      const { error: updateError } = await supabase
        .from('areas')
        .update({
          servicios: serviciosFinales,
          updated_at: new Date().toISOString()
        })
        .eq('id', areaId)

      if (updateError) {
        console.error('❌ Error al actualizar BD:', updateError)
        return null
      }

      console.log('✅ Servicios actualizados exitosamente!')
      return serviciosFinales

    } catch (error) {
      console.error('❌ Error analizando servicios:', error)
      return null
    }
  }

  useEffect(() => {
    checkAdminAndLoadAreas()
    checkConfiguration()
  }, [])

  const checkAdminAndLoadAreas = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }

    await loadAreas()
  }

  const checkConfiguration = async () => {
    try {
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY_ADMIN
      
      // SerpAPI ahora se usa a través del proxy del servidor, no necesitamos verificarla aquí
      setConfigStatus({
        ready: !!openaiKey,
        checks: {
          openaiKeyValid: !!openaiKey,
          serpApiKeyValid: true // Asumimos que está en el servidor
        }
      })
    } catch (error) {
      console.error('Error verificando configuración:', error)
    }
  }

  const loadAreas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error

      const areasConEstado: AreaConCambios[] = (data || []).map(area => ({
        ...area,
        seleccionada: false,
        procesando: false,
        procesada: false,
        error: null
      }))

      setAreas(areasConEstado)

      // Extraer provincias únicas
      const provinciasUnicas = [...new Set(data?.map(a => a.provincia).filter(Boolean))] as string[]
      setProvincias(provinciasUnicas.sort())

    } catch (error) {
      console.error('Error cargando áreas:', error)
    } finally {
      setLoading(false)
    }
  }

  const areasFiltradas = areas.filter(area => {
    const matchBusqueda = area.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         area.ciudad?.toLowerCase().includes(busqueda.toLowerCase())
    
    const matchProvincia = provinciaFiltro === 'todas' || area.provincia === provinciaFiltro
    
    const matchWeb = !soloSinWeb || !area.website || area.website === ''

    return matchBusqueda && matchProvincia && matchWeb
  })

  const toggleSeleccion = (id: string) => {
    setAreas(prev => prev.map(area => 
      area.id === id ? { ...area, seleccionada: !area.seleccionada } : area
    ))
  }

  const seleccionarTodas = () => {
    const idsVisibles = new Set(areasFiltradas.map(a => a.id))
    setAreas(prev => prev.map(area => ({
      ...area,
      seleccionada: idsVisibles.has(area.id) ? true : area.seleccionada
    })))
  }

  const deseleccionarTodas = () => {
    setAreas(prev => prev.map(area => ({ ...area, seleccionada: false })))
  }

  const procesarAreas = async () => {
    // Validar configuración
    if (!configStatus?.ready) {
      alert(
        '❌ No se puede procesar\n\n' +
        'Las API keys no están configuradas correctamente.\n\n' +
        'Revisa el mensaje de advertencia en la parte superior de la página.'
      )
      return
    }

    const areasSeleccionadas = areas.filter(a => a.seleccionada)
    
    if (areasSeleccionadas.length === 0) {
      alert('Por favor, selecciona al menos un área')
      return
    }

    // Estimación de tiempo y costo
    const estimatedMinutes = Math.ceil((areasSeleccionadas.length * 5) / 60)
    const estimatedCost = (areasSeleccionadas.length * 0.0002).toFixed(4)
    
    if (!confirm(
      `¿Deseas actualizar los servicios de ${areasSeleccionadas.length} área(s)?\n\n` +
      `⏱️ Tiempo estimado: ${estimatedMinutes} minuto(s)\n` +
      `💰 Costo aproximado: $${estimatedCost} USD\n\n` +
      `El proceso incluye pausas entre peticiones para evitar límites de rate.`
    )) {
      return
    }

    setProcesando(true)
    setProgreso({ actual: 0, total: areasSeleccionadas.length })

    for (let i = 0; i < areasSeleccionadas.length; i++) {
      const area = areasSeleccionadas[i]
      
      setAreas(prev => prev.map(a => 
        a.id === area.id ? { ...a, procesando: true } : a
      ))

      try {
        // Llamar directamente a la lógica desde el cliente
        const servicios = await analizarServiciosArea(area.id)
        
        if (servicios) {
          setAreas(prev => prev.map(a => 
            a.id === area.id ? {
              ...a,
              procesando: false,
              procesada: true,
              serviciosNuevos: servicios,
              error: null
            } : a
          ))
        } else {
          throw new Error('No se pudieron analizar los servicios')
        }
      } catch (error: any) {
        setAreas(prev => prev.map(a => 
          a.id === area.id ? {
            ...a,
            procesando: false,
            procesada: true,
            error: error.message
          } : a
        ))

        // Si hay un error de configuración crítico, detener todo el proceso
        if (error.message.includes('API Key') || error.message.includes('configurada')) {
          alert(`❌ Error crítico de configuración. Deteniendo proceso.\n\n${error.message}`)
          setProcesando(false)
          break
        }

        // Si es error de rate limit, pausar más tiempo
        if (error.message.includes('Límite') || error.message.includes('429')) {
          alert(`⏸️ Límite de API alcanzado. Pausando 30 segundos...\n\n${error.message}`)
          await new Promise(resolve => setTimeout(resolve, 30000))
        }
      }

      setProgreso({ actual: i + 1, total: areasSeleccionadas.length })

      // Pausa inteligente entre peticiones (más larga si es un lote grande)
      const delayMs = areasSeleccionadas.length > 20 ? 3000 : 2000
      
      // No pausar después de la última
      if (i < areasSeleccionadas.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    setProcesando(false)
    alert('✅ Proceso completado. Revisa los resultados.')
  }

  const areasSeleccionadas = areas.filter(a => a.seleccionada).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ArrowPathIcon className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando áreas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Banner de advertencia de configuración */}
      {configStatus && !configStatus.ready && (
        <div className="bg-red-50 border-b-4 border-red-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-3">
                  ⚠️ Configuración Incompleta - Funcionalidad Deshabilitada
                </h3>
                <ul className="text-sm text-red-800 space-y-2 mb-4">
                  {!configStatus.checks.openaiKeyValid && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">❌</span>
                      <div className="flex-1">
                        <strong>OpenAI API Key</strong> no configurada o inválida
                        {configStatus.checks.openaiError && (
                          <div className="text-xs text-red-700 mt-1 bg-red-100 rounded px-2 py-1 font-mono">
                            {configStatus.checks.openaiError}
                          </div>
                        )}
                      </div>
                    </li>
                  )}
                  {!configStatus.checks.serpApiKeyValid && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">❌</span>
                      <div className="flex-1">
                        <strong>SerpAPI Key</strong> no configurada o inválida
                        {configStatus.checks.serpApiError && (
                          <div className="text-xs text-red-700 mt-1 bg-red-100 rounded px-2 py-1 font-mono">
                            {configStatus.checks.serpApiError}
                          </div>
                        )}
                      </div>
                    </li>
                  )}
                </ul>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-sm text-red-900">
                  <strong className="block mb-2">📝 Cómo solucionarlo:</strong>
                  <ol className="list-decimal list-inside space-y-1.5 ml-2">
                    <li>Verifica que el archivo <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code> existe en la raíz del proyecto</li>
                    <li>Comprueba que las variables <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono text-xs">OPENAI_API_KEY</code> y <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono text-xs">SERPAPI_KEY</code> estén definidas correctamente</li>
                    <li>Reinicia el servidor de desarrollo en PowerShell: <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono text-xs">npm run dev</code></li>
                    <li>Recarga esta página (F5)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/areas"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🔄 Actualizar Servicios</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Usa IA para detectar servicios desde las webs de las áreas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Controles */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o ciudad..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro Provincia */}
            <div>
              <select
                value={provinciaFiltro}
                onChange={(e) => setProvinciaFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="todas">Todas las provincias</option>
                {provincias.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Filtro Sin Web */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloSinWeb}
                  onChange={(e) => setSoloSinWeb(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Solo sin web</span>
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              <button
                onClick={seleccionarTodas}
                disabled={procesando}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Seleccionar todas ({areasFiltradas.length})
              </button>
              <button
                onClick={deseleccionarTodas}
                disabled={procesando}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Deseleccionar todas
              </button>
            </div>

            <button
              onClick={procesarAreas}
              disabled={procesando || areasSeleccionadas === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {procesando ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Procesando {progreso.actual}/{progreso.total}...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Actualizar {areasSeleccionadas} área{areasSeleccionadas !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista de Áreas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={areasFiltradas.length > 0 && areasFiltradas.every(a => a.seleccionada)}
                      onChange={(e) => e.target.checked ? seleccionarTodas() : deseleccionarTodas()}
                      disabled={procesando}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Web
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Servicios Actuales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {areasFiltradas.map((area) => (
                  <tr key={area.id} className={area.procesando ? 'bg-yellow-50' : area.procesada ? 'bg-green-50' : ''}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={area.seleccionada}
                        onChange={() => toggleSeleccion(area.id)}
                        disabled={procesando}
                        className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{area.nombre}</div>
                        <div className="text-sm text-gray-500">{area.ciudad}, {area.provincia}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {area.website ? (
                        <a href={area.website} target="_blank" className="text-sm text-sky-600 hover:underline">
                          Ver web →
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Sin web</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {area.servicios && typeof area.servicios === 'object' ? (
                          Object.entries(area.servicios)
                            .filter(([_, value]) => value === true)
                            .map(([key]) => (
                              <span key={key} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {key}
                              </span>
                            ))
                        ) : (
                          <span className="text-sm text-gray-400">Sin servicios</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {area.procesando && (
                        <span className="inline-flex items-center gap-2 text-sm text-yellow-700">
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Procesando...
                        </span>
                      )}
                      {area.procesada && !area.error && (
                        <span className="inline-flex items-center gap-2 text-sm text-green-700">
                          <CheckIcon className="w-4 h-4" />
                          Actualizado
                        </span>
                      )}
                      {area.error && (
                        <span className="inline-flex items-center gap-2 text-sm text-red-700">
                          <XMarkIcon className="w-4 h-4" />
                          {area.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {areasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <FunnelIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay áreas que coincidan con los filtros</p>
            </div>
          )}
        </div>

        {/* Modal de Procesamiento */}
        {procesando && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="animate-spin">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">🔍 Actualizando Servicios</h3>
                    <p className="text-green-100 text-sm">Detectando servicios con IA...</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round((progreso.actual / progreso.total) * 100)}%
                  </div>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="bg-gray-200 h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
                ></div>
              </div>

              {/* Lista de Áreas Procesadas */}
              <div className="p-6 bg-gray-50 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {areas.filter(a => a.seleccionada).map((area) => (
                    <div 
                      key={area.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        area.procesando ? 'bg-yellow-50 border-yellow-300 animate-pulse' :
                        area.procesada && !area.error ? 'bg-green-50 border-green-300' :
                        area.error ? 'bg-red-50 border-red-300' :
                        'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{area.nombre}</div>
                          <div className="text-sm text-gray-600">{area.ciudad}, {area.provincia}</div>
                        </div>
                        <div>
                          {area.procesando && (
                            <span className="flex items-center gap-2 text-yellow-700">
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                              Procesando...
                            </span>
                          )}
                          {area.procesada && !area.error && (
                            <span className="flex items-center gap-2 text-green-700 font-semibold">
                              <CheckIcon className="w-5 h-5" />
                              Actualizado
                            </span>
                          )}
                          {area.error && (
                            <span className="flex items-center gap-2 text-red-700 text-sm">
                              <XMarkIcon className="w-5 h-5" />
                              {area.error}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Mostrar servicios detectados */}
                      {area.procesada && !area.error && area.serviciosNuevos && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-2">Servicios detectados:</div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(area.serviciosNuevos)
                              .filter(([_, value]) => value === true)
                              .map(([key]) => (
                                <span key={key} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-medium">
                                  {key}
                                </span>
                              ))}
                            {Object.values(area.serviciosNuevos).every(v => v === false) && (
                              <span className="text-xs text-gray-500 italic">
                                No se detectaron servicios con evidencia suficiente
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer con Estadísticas */}
              <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {areas.filter(a => a.procesada && !a.error).length}
                    </div>
                    <div className="text-xs text-gray-600">Exitosas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {areas.filter(a => a.error).length}
                    </div>
                    <div className="text-xs text-gray-600">Errores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {progreso.actual} / {progreso.total}
                    </div>
                    <div className="text-xs text-gray-600">Progreso</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

