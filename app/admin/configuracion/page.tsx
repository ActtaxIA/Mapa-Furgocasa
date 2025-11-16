'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { CogIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'
import { PromptMessage, IAConfigValue, PROMPT_COLORS, PROMPT_LABELS } from '@/types/ia-config.types'

interface IAConfig {
  id: string
  config_key: string
  config_value: IAConfigValue
  descripcion: string
  updated_at: string
}

interface ChatbotConfig {
  id: string
  nombre: string
  descripcion: string
  modelo: string
  temperature: number
  max_tokens: number
  system_prompt: string
  prompts?: IAConfigValue  // Sistema de prompts múltiples (nuevo)
  contexto_inicial: string | null
  instrucciones_busqueda: string | null
  puede_geolocalizar: boolean
  puede_buscar_areas: boolean
  puede_obtener_detalles: boolean
  puede_buscar_por_pais: boolean
  max_mensajes_por_sesion: number
  max_areas_por_respuesta: number
  radio_busqueda_default_km: number
  activo: boolean
  version: number
  created_at: string
  updated_at: string
}

export default function ConfiguracionPage() {
  const supabase = createClient()

  const [configs, setConfigs] = useState<IAConfig[]>([])
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('scrape_services')
  const [editedConfig, setEditedConfig] = useState<IAConfig | null>(null)
  const [editedChatbotConfig, setEditedChatbotConfig] = useState<ChatbotConfig | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [apiStatus, setApiStatus] = useState<{
    openai: boolean
    serpapi: boolean
    supabase: boolean
    chatbotOpenAI: boolean
  } | null>(null)

  useEffect(() => {
    loadConfigs()
    checkApiConnections()
  }, [])

  const checkApiConnections = async () => {
    try {
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY_ADMIN
      const serpApiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY_ADMIN

      // Check Supabase
      const { data, error } = await (supabase as any).from('areas').select('id').limit(1)
      const supabaseOk = !error && !!data

      // Check Chatbot API (servidor)
      let chatbotOpenAIOk = false
      try {
        const response = await fetch('/api/chatbot')
        if (response.ok) {
          const data = await response.json()
          chatbotOpenAIOk = data.status === 'active'
        }
      } catch {
        chatbotOpenAIOk = false
      }

      setApiStatus({
        openai: !!openaiKey,
        serpapi: !!serpApiKey,
        supabase: supabaseOk,
        chatbotOpenAI: chatbotOpenAIOk
      })
    } catch (error) {
      console.error('Error checking APIs:', error)
      setApiStatus({
        openai: false,
        serpapi: false,
        supabase: false,
        chatbotOpenAI: false
      })
    }
  }

  useEffect(() => {
    if (activeTab === 'chatbot') {
      if (chatbotConfig) {
        const config = JSON.parse(JSON.stringify(chatbotConfig))

        // Debug: ver estructura de prompts
        console.log('🔍 Chatbot Config:', config)
        console.log('🔍 Prompts:', config.prompts)
        console.log('🔍 Prompts.prompts:', config.prompts?.prompts)
        console.log('🔍 Es array?:', Array.isArray(config.prompts?.prompts))

        setEditedChatbotConfig(config)
      }
      setEditedConfig(null)
    } else {
      const active = configs.find(c => c.config_key === activeTab)
      if (active) {
        setEditedConfig(JSON.parse(JSON.stringify(active)))
      }
      setEditedChatbotConfig(null)
    }
  }, [activeTab, configs, chatbotConfig])

  const loadConfigs = async () => {
    try {
      setLoading(true)

      // Cargar configs de IA normales
      const { data, error } = await (supabase as any)
        .from('ia_config')
        .select('*')
        .order('config_key')

      if (error) throw error

      setConfigs(data || [])

      // Cargar config del chatbot
      const { data: chatbotData, error: chatbotError } = await (supabase as any)
        .from('chatbot_config')
        .select('*')
        .eq('nombre', 'asistente_principal')
        .eq('activo', true)
        .single()

      if (!chatbotError && chatbotData) {
        setChatbotConfig(chatbotData)
      }

      if (data && data.length > 0 && !activeTab) {
        setActiveTab(data[0].config_key)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
      showMessage('error', 'Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (activeTab === 'chatbot' && editedChatbotConfig) {
        // Guardar configuración del chatbot
        const updateData: any = {
          modelo: editedChatbotConfig.modelo,
          temperature: editedChatbotConfig.temperature,
          max_tokens: editedChatbotConfig.max_tokens,
          system_prompt: editedChatbotConfig.system_prompt,
          contexto_inicial: editedChatbotConfig.contexto_inicial,
          instrucciones_busqueda: editedChatbotConfig.instrucciones_busqueda,
          puede_geolocalizar: editedChatbotConfig.puede_geolocalizar,
          puede_buscar_areas: editedChatbotConfig.puede_buscar_areas,
          puede_obtener_detalles: editedChatbotConfig.puede_obtener_detalles,
          puede_buscar_por_pais: editedChatbotConfig.puede_buscar_por_pais,
          max_mensajes_por_sesion: editedChatbotConfig.max_mensajes_por_sesion,
          max_areas_por_respuesta: editedChatbotConfig.max_areas_por_respuesta,
          radio_busqueda_default_km: editedChatbotConfig.radio_busqueda_default_km,
          updated_at: new Date().toISOString()
        }

        // Si tiene prompts múltiples, incluirlos
        if (editedChatbotConfig.prompts) {
          updateData.prompts = editedChatbotConfig.prompts
        }

        const { error } = await (supabase as any)
          .from('chatbot_config')
          .update(updateData)
          .eq('id', editedChatbotConfig.id)

        if (error) throw error
      } else if (editedConfig) {
        // Guardar configuración normal
        const { error } = await (supabase as any)
          .from('ia_config')
          .update({
            config_value: editedConfig.config_value,
            updated_at: new Date().toISOString()
          })
          .eq('config_key', editedConfig.config_key)

        if (error) throw error
      }

      showMessage('success', '✓ Configuración guardada correctamente')
      await loadConfigs()
    } catch (error) {
      console.error('Error guardando:', error)
      showMessage('error', 'Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!editedConfig) return

    if (!confirm('¿Restablecer esta configuración a los valores por defecto?')) {
      return
    }

    alert('⚠️ Funcionalidad de reset temporalmente deshabilitada.\n\nPara restaurar valores por defecto, contacta con el administrador del sistema.')
  }

  const updateConfigValue = (field: keyof IAConfigValue, value: any) => {
    if (!editedConfig) return

    setEditedConfig({
      ...editedConfig,
      config_value: {
        ...editedConfig.config_value,
        [field]: value
      }
    })
  }

  const updateChatbotConfigValue = (field: keyof ChatbotConfig, value: any) => {
    if (!editedChatbotConfig) return

    setEditedChatbotConfig({
      ...editedChatbotConfig,
      [field]: value
    })
  }

  // Funciones para gestionar prompts del chatbot
  const addChatbotPrompt = (role: 'user' | 'assistant' | 'agent') => {
    if (!editedChatbotConfig || !editedChatbotConfig.prompts) return

    const newPrompt: PromptMessage = {
      id: `${role}-${Date.now()}`,
      role,
      content: '',
      order: editedChatbotConfig.prompts.prompts.length + 1,
      required: false
    }

    setEditedChatbotConfig({
      ...editedChatbotConfig,
      prompts: {
        ...editedChatbotConfig.prompts,
        prompts: [...editedChatbotConfig.prompts.prompts, newPrompt]
      }
    })
  }

  const updateChatbotPrompt = (promptId: string, field: keyof PromptMessage, value: any) => {
    if (!editedChatbotConfig || !editedChatbotConfig.prompts) return

    setEditedChatbotConfig({
      ...editedChatbotConfig,
      prompts: {
        ...editedChatbotConfig.prompts,
        prompts: editedChatbotConfig.prompts.prompts.map(p =>
          p.id === promptId ? { ...p, [field]: value } : p
        )
      }
    })
  }

  const removeChatbotPrompt = (promptId: string) => {
    if (!editedChatbotConfig || !editedChatbotConfig.prompts) return

    const updatedPrompts = editedChatbotConfig.prompts.prompts
      .filter(p => p.id !== promptId)
      .map((p, index) => ({ ...p, order: index + 1 }))

    setEditedChatbotConfig({
      ...editedChatbotConfig,
      prompts: {
        ...editedChatbotConfig.prompts,
        prompts: updatedPrompts
      }
    })
  }

  const moveChatbotPrompt = (index: number, direction: 'up' | 'down') => {
    if (!editedChatbotConfig || !editedChatbotConfig.prompts) return

    const prompts = [...editedChatbotConfig.prompts.prompts]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= prompts.length) return

    [prompts[index], prompts[newIndex]] = [prompts[newIndex], prompts[index]]

    const reorderedPrompts = prompts.map((p, i) => ({ ...p, order: i + 1 }))

    setEditedChatbotConfig({
      ...editedChatbotConfig,
      prompts: {
        ...editedChatbotConfig.prompts,
        prompts: reorderedPrompts
      }
    })
  }

  // Funciones para manejo de prompts (configs normales)
  const addPrompt = (role: 'user' | 'assistant' | 'agent' = 'user') => {
    if (!editedConfig) return

    const newPrompt: PromptMessage = {
      id: `${role}-${Date.now()}`,
      role: role,
      content: '',
      order: editedConfig.config_value.prompts.length + 1,
      required: false
    }

    updateConfigValue('prompts', [...editedConfig.config_value.prompts, newPrompt])
  }

  const removePrompt = (promptId: string) => {
    if (!editedConfig) return

    updateConfigValue(
      'prompts',
      editedConfig.config_value.prompts.filter(p => p.id !== promptId)
    )
  }

  const updatePrompt = (promptId: string, field: keyof PromptMessage, value: any) => {
    if (!editedConfig) return

    updateConfigValue(
      'prompts',
      editedConfig.config_value.prompts.map(p =>
        p.id === promptId ? { ...p, [field]: value } : p
      )
    )
  }

  const movePrompt = (index: number, direction: 'up' | 'down') => {
    if (!editedConfig) return

    const prompts = [...editedConfig.config_value.prompts].sort((a, b) => a.order - b.order)
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= prompts.length) return

    // Intercambiar órdenes
    const temp = prompts[index].order
    prompts[index].order = prompts[targetIndex].order
    prompts[targetIndex].order = temp

    updateConfigValue('prompts', prompts)
  }

  const configTabs = [
    { key: 'scrape_services', label: '🔍 Actualizar Servicios', icon: '🤖' },
    { key: 'enrich_description', label: '✨ Enriquecer Textos', icon: '📝' },
    { key: 'chatbot', label: '🧳 Tío Viajero IA (Chatbot)', icon: '💬' },
    { key: 'valoracion_vehiculos', label: '🚐 Valoración de Vehículos IA', icon: '💰' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Cargando configuración...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CogIcon className="w-10 h-10 text-sky-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración de IA</h1>
              <p className="text-gray-600 mt-1">
                Ajusta los prompts y parámetros de los 4 agentes que usan OpenAI
              </p>
              <p className="text-sm text-gray-500 mt-1">
                💡 <strong>Nota:</strong> "Enriquecer Imágenes" no aparece aquí porque solo usa SerpAPI (sin prompts de IA)
              </p>
            </div>
          </div>
        </div>

        {/* API Status */}
        {apiStatus && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔌 Estado de Conexiones API</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* OpenAI */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                apiStatus.openai
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  apiStatus.openai ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {apiStatus.openai ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white text-xl">✕</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">OpenAI</p>
                  <p className={`text-sm ${
                    apiStatus.openai ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {apiStatus.openai ? 'Conectado' : 'No configurado'}
                  </p>
                </div>
              </div>

              {/* SerpAPI */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                apiStatus.serpapi
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  apiStatus.serpapi ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {apiStatus.serpapi ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white text-xl">✕</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">SerpAPI</p>
                  <p className={`text-sm ${
                    apiStatus.serpapi ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {apiStatus.serpapi ? 'Conectado' : 'No configurado'}
                  </p>
                </div>
              </div>

              {/* Supabase */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                apiStatus.supabase
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  apiStatus.supabase ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {apiStatus.supabase ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white text-xl">✕</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Supabase</p>
                  <p className={`text-sm ${
                    apiStatus.supabase ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {apiStatus.supabase ? 'Conectado' : 'Error de conexión'}
                  </p>
                </div>
              </div>

              {/* Chatbot OpenAI (Servidor) */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                apiStatus.chatbotOpenAI
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  apiStatus.chatbotOpenAI ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {apiStatus.chatbotOpenAI ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white text-xl">✕</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Chatbot API</p>
                  <p className={`text-sm ${
                    apiStatus.chatbotOpenAI ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {apiStatus.chatbotOpenAI ? 'Conectado' : 'Error: falta OPENAI_API_KEY'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' && <CheckIcon className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {configTabs.map((tab: any) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.key
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Config Form */}
          {editedConfig && (
            <div className="p-6 space-y-6">
              {/* Descripción */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Función:</strong> {editedConfig.descripcion}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Última actualización: {new Date(editedConfig.updated_at).toLocaleString('es-ES')}
                </p>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo de OpenAI
                </label>
                <select
                  value={editedConfig.config_value.model}
                  onChange={(e) => updateConfigValue('model', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Recomendado - Rápido y económico)</option>
                  <option value="gpt-4o">gpt-4o (Más potente)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo (Muy potente pero lento)</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo (Más económico pero menos preciso)</option>
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {editedConfig.config_value.temperature}
                  <span className="ml-2 text-xs text-gray-500">
                    (0 = muy conservador, 1 = muy creativo)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={editedConfig.config_value.temperature}
                  onChange={(e) => updateConfigValue('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservador (0.0)</span>
                  <span>Equilibrado (0.5)</span>
                  <span>Creativo (1.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tokens máximos
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={editedConfig.config_value.max_tokens}
                  onChange={(e) => updateConfigValue('max_tokens', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Longitud máxima de la respuesta (más tokens = respuestas más largas pero más costosas)
                </p>
              </div>

              {/* SISTEMA DE PROMPTS FLEXIBLE */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🤖 Configuración de Prompts
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addPrompt('user')}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition disabled:opacity-50"
                    >
                      <span className="text-lg">+</span>
                      User Prompt
                    </button>
                    <button
                      onClick={() => addPrompt('assistant')}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition disabled:opacity-50"
                    >
                      <span className="text-lg">+</span>
                      Assistant Prompt
                    </button>
                    <button
                      onClick={() => addPrompt('agent')}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition disabled:opacity-50"
                    >
                      <span className="text-lg">+</span>
                      Agent Prompt
                    </button>
                  </div>
                </div>

                {/* Lista de Prompts */}
                <div className="space-y-4">
                  {editedConfig.config_value.prompts
                    .sort((a, b) => a.order - b.order)
                    .map((prompt, index) => {
                      const colors = PROMPT_COLORS[prompt.role]
                      const label = PROMPT_LABELS[prompt.role]

                      return (
                        <div
                          key={prompt.id}
                          className={`border-2 rounded-lg p-4 ${colors.border} ${colors.bg}`}
                        >
                          {/* Header del Prompt */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                                {colors.icon} {label} Prompt
                              </span>
                              <span className="text-xs text-gray-500">Orden: {index + 1}</span>
                              {prompt.required && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                  Obligatorio
                                </span>
                              )}
                            </div>

                            {/* Botones de Control */}
                            <div className="flex items-center gap-2">
                              {/* Mover arriba */}
                              {index > 0 && (
                                <button
                                  onClick={() => movePrompt(index, 'up')}
                                  disabled={saving}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                  title="Mover arriba"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              )}

                              {/* Mover abajo */}
                              {index < editedConfig.config_value.prompts.length - 1 && (
                                <button
                                  onClick={() => movePrompt(index, 'down')}
                                  disabled={saving}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                  title="Mover abajo"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}

                              {/* Eliminar (solo si no es obligatorio) */}
                              {!prompt.required && (
                                <button
                                  onClick={() => removePrompt(prompt.id)}
                                  disabled={saving}
                                  className="p-1 hover:bg-red-200 text-red-600 rounded disabled:opacity-50"
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Textarea del Prompt */}
                          <textarea
                            value={prompt.content}
                            onChange={(e) => updatePrompt(prompt.id, 'content', e.target.value)}
                            disabled={saving}
                            rows={prompt.role === 'system' ? 4 : 12}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm resize-y disabled:opacity-50 disabled:bg-gray-100"
                            placeholder={
                              prompt.role === 'system' ? 'Define el comportamiento general del agente...' :
                              prompt.role === 'user' ? 'Instrucciones para el usuario. Usa variables: {{area_nombre}}, {{contexto}}...' :
                              prompt.role === 'assistant' ? 'Ejemplo de respuesta del asistente...' :
                              'Instrucciones específicas del agente...'
                            }
                          />

                          {/* Info sobre variables */}
                          {prompt.role !== 'system' && (
                            <div className="mt-2 text-xs text-gray-600">
                              <strong>Variables disponibles:</strong>{' '}
                              <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{area_nombre}}'}</code>,{' '}
                              <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{area_ciudad}}'}</code>,{' '}
                              <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{area_provincia}}'}</code>,{' '}
                              <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{contexto}}'}</code>,{' '}
                              <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{texto_analizar}}'}</code>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>

                {/* Mensaje si solo hay system prompt */}
                {editedConfig.config_value.prompts.length === 1 && (
                  <div className="mt-4 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Solo tienes el System Prompt obligatorio.
                    </p>
                    <p className="text-xs text-gray-500">
                      Añade prompts adicionales usando los botones "+ User/Assistant/Agent Prompt" de arriba
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Restablecer Valores por Defecto
                </button>
              </div>
            </div>
          )}

          {/* Chatbot Config Form */}
          {editedChatbotConfig && activeTab === 'chatbot' && (
            <div className="p-6 space-y-6">
              {/* Descripción */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Función:</strong> {editedChatbotConfig.descripcion}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Última actualización: {new Date(editedChatbotConfig.updated_at).toLocaleString('es-ES')}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Versión: {editedChatbotConfig.version}
                </p>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo de OpenAI
                </label>
                <select
                  value={editedChatbotConfig.modelo}
                  onChange={(e) => updateChatbotConfigValue('modelo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Recomendado - Rápido y económico)</option>
                  <option value="gpt-4o">gpt-4o (Más potente)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo (Muy potente pero lento)</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo (Más económico pero menos preciso)</option>
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {editedChatbotConfig.temperature}
                  <span className="ml-2 text-xs text-gray-500">
                    (0 = muy conservador, 1 = muy creativo)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={editedChatbotConfig.temperature}
                  onChange={(e) => updateChatbotConfigValue('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservador (0.0)</span>
                  <span>Equilibrado (0.5)</span>
                  <span>Creativo (1.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tokens máximos
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={editedChatbotConfig.max_tokens}
                  onChange={(e) => updateChatbotConfigValue('max_tokens', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Longitud máxima de la respuesta (más tokens = respuestas más largas pero más costosas)
                </p>
              </div>

              {/* Configuración de Prompts */}
              {editedChatbotConfig.prompts && editedChatbotConfig.prompts.prompts && Array.isArray(editedChatbotConfig.prompts.prompts) ? (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Configuración de Prompts</h3>

                  {/* Botones para añadir prompts */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => addChatbotPrompt('user')}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition disabled:opacity-50"
                    >
                      <span className="text-lg">+</span>
                      User Prompt
                    </button>
                    <button
                      onClick={() => addChatbotPrompt('assistant')}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition disabled:opacity-50"
                    >
                      <span className="text-lg">+</span>
                      Assistant Prompt
                    </button>
                    <button
                      onClick={() => addChatbotPrompt('agent')}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition disabled:opacity-50"
                    >
                      <span className="text-lg">+</span>
                      Agent Prompt
                    </button>
                  </div>

                  {/* Lista de Prompts */}
                  <div className="space-y-4">
                    {editedChatbotConfig.prompts.prompts
                      .sort((a, b) => a.order - b.order)
                      .map((prompt, index) => {
                        const colors = PROMPT_COLORS[prompt.role]
                        const label = PROMPT_LABELS[prompt.role]

                        return (
                          <div
                            key={prompt.id}
                            className={`border-2 rounded-lg p-4 ${colors.border} ${colors.bg}`}
                          >
                            {/* Header del Prompt */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                                  {colors.icon} {label} Prompt
                                </span>
                                <span className="text-xs text-gray-500">Orden: {index + 1}</span>
                                {prompt.required && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                    Obligatorio
                                  </span>
                                )}
                              </div>

                              {/* Botones de Control */}
                              <div className="flex items-center gap-2">
                                {index > 0 && (
                                  <button
                                    onClick={() => moveChatbotPrompt(index, 'up')}
                                    disabled={saving}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                    title="Mover arriba"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                )}

                                {index < editedChatbotConfig.prompts!.prompts.length - 1 && (
                                  <button
                                    onClick={() => moveChatbotPrompt(index, 'down')}
                                    disabled={saving}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                    title="Mover abajo"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}

                                {!prompt.required && (
                                  <button
                                    onClick={() => removeChatbotPrompt(prompt.id)}
                                    disabled={saving}
                                    className="p-1 hover:bg-red-200 text-red-600 rounded disabled:opacity-50"
                                    title="Eliminar"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Textarea del Prompt */}
                            <textarea
                              value={prompt.content}
                              onChange={(e) => updateChatbotPrompt(prompt.id, 'content', e.target.value)}
                              disabled={saving}
                              rows={prompt.role === 'system' ? 12 : 8}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm resize-y disabled:opacity-50 disabled:bg-gray-100"
                              placeholder={
                                prompt.role === 'system' ? 'Define el comportamiento general del Tío Viajero IA...' :
                                prompt.role === 'user' ? 'Contexto del usuario o instrucciones adicionales...' :
                                prompt.role === 'assistant' ? 'Ejemplo de respuesta esperada del asistente...' :
                                'Instrucciones específicas para el agente...'
                              }
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              ) : (
                /* System Prompt Legacy (si no tiene prompts múltiples) */
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt (Instrucciones del Tío Viajero IA)
                  </label>
                  <textarea
                    value={editedChatbotConfig.system_prompt}
                    onChange={(e) => updateChatbotConfigValue('system_prompt', e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
                    placeholder="Define el comportamiento y personalidad del chatbot..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este prompt define la personalidad, tono y comportamiento del Tío Viajero IA
                  </p>
                </div>
              )}

              {/* Capacidades */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Capacidades Funcionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedChatbotConfig.puede_geolocalizar}
                      onChange={(e) => updateChatbotConfigValue('puede_geolocalizar', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">📍 Geolocalización</p>
                      <p className="text-xs text-gray-500">Buscar áreas cerca del usuario</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedChatbotConfig.puede_buscar_areas}
                      onChange={(e) => updateChatbotConfigValue('puede_buscar_areas', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">🔍 Buscar Áreas</p>
                      <p className="text-xs text-gray-500">Función principal de búsqueda</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedChatbotConfig.puede_obtener_detalles}
                      onChange={(e) => updateChatbotConfigValue('puede_obtener_detalles', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">📋 Detalles de Áreas</p>
                      <p className="text-xs text-gray-500">Obtener información completa</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedChatbotConfig.puede_buscar_por_pais}
                      onChange={(e) => updateChatbotConfigValue('puede_buscar_por_pais', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">🌍 Buscar por País</p>
                      <p className="text-xs text-gray-500">Filtrar por ubicación</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Límites y Configuración */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Límites y Configuración</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensajes máximos por sesión
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={editedChatbotConfig.max_mensajes_por_sesion}
                      onChange={(e) => updateChatbotConfigValue('max_mensajes_por_sesion', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Áreas máximas por respuesta
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editedChatbotConfig.max_areas_por_respuesta}
                      onChange={(e) => updateChatbotConfigValue('max_areas_por_respuesta', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radio de búsqueda (km)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      step="10"
                      value={editedChatbotConfig.radio_busqueda_default_km}
                      onChange={(e) => updateChatbotConfigValue('radio_busqueda_default_km', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-gray-700 hover:from-blue-700 hover:to-gray-800 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info sobre agentes y tipos de prompts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-3">🤖 Agentes de IA Disponibles</h3>

          <div className="mb-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">Agentes con Prompts Configurables (aparecen en pestañas):</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>🔍 Actualizar Servicios:</strong> Usa OpenAI para analizar texto web y detectar servicios (agua, electricidad, etc.)</li>
              <li><strong>✨ Enriquecer Textos:</strong> Usa OpenAI para generar descripciones detalladas de áreas</li>
              <li><strong>🧳 Tío Viajero IA (Chatbot):</strong> Asistente conversacional con IA que ayuda a usuarios a encontrar áreas usando Function Calling</li>
              <li><strong>🚐 Valoración de Vehículos IA:</strong> Usa GPT-4 + SearchAPI (opcional) para generar informes profesionales de valoración con 3 precios estratégicos</li>
            </ul>
          </div>

          <div className="mb-4 text-sm text-blue-800 bg-blue-100 p-3 rounded">
            <p className="font-semibold mb-1">Agente sin Prompts (no necesita configuración aquí):</p>
            <ul className="list-disc list-inside ml-2">
              <li><strong>🖼️ Enriquecer Imágenes:</strong> Solo usa SerpAPI para buscar fotos (no requiere OpenAI ni prompts)</li>
            </ul>
          </div>

          <h3 className="font-semibold text-blue-900 mb-2 mt-4">💡 Tipos de Prompts (para los agentes de OpenAI)</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">⚙️ System:</span>
              <span>Define el rol y comportamiento general del agente. Es obligatorio y aparece primero.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">👤 User:</span>
              <span>Instrucciones o contexto del usuario. Puede incluir variables dinámicas que se reemplazan automáticamente.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">🤖 Assistant:</span>
              <span>Ejemplo de respuesta esperada. Útil para "few-shot learning" y guiar el formato de salida.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">🎯 Agent:</span>
              <span>Instrucciones específicas adicionales para el agente. Se envían como "user" a OpenAI.</span>
            </li>
          </ul>
        </div>

        {/* Info adicional */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">ℹ️ Información Importante</h3>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Los cambios afectan inmediatamente a todas las futuras ejecuciones de los agentes</li>
            <li>Temperatura baja (0.1-0.3) = respuestas más consistentes y conservadoras</li>
            <li>Temperatura alta (0.7-1.0) = respuestas más creativas y variadas</li>
            <li>Modelos más potentes son más precisos pero más lentos y costosos</li>
            <li>Los prompts se ejecutan en el orden que defines (puedes reordenarlos con las flechas)</li>
            <li>Puedes usar variables en los prompts que se reemplazan automáticamente según el contexto</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
