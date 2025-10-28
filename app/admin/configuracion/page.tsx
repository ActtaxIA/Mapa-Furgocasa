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

export default function ConfiguracionPage() {
  const supabase = createClient()
  
  const [configs, setConfigs] = useState<IAConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('scrape_services')
  const [editedConfig, setEditedConfig] = useState<IAConfig | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadConfigs()
  }, [])

  useEffect(() => {
    const active = configs.find(c => c.config_key === activeTab)
    if (active) {
      setEditedConfig(JSON.parse(JSON.stringify(active)))
    }
  }, [activeTab, configs])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/ia-config')
      const result = await response.json()

      if (result.success) {
        setConfigs(result.data)
        if (result.data.length > 0 && !activeTab) {
          setActiveTab(result.data[0].config_key)
        }
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
    if (!editedConfig) return

    try {
      setSaving(true)

      const response = await fetch('/api/admin/ia-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configKey: editedConfig.config_key,
          configValue: editedConfig.config_value
        })
      })

      const result = await response.json()

      if (result.success) {
        showMessage('success', '✓ Configuración guardada correctamente')
        await loadConfigs()
      } else {
        showMessage('error', 'Error al guardar: ' + result.error)
      }
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

    try {
      setSaving(true)

      const response = await fetch('/api/admin/ia-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configKey: editedConfig.config_key })
      })

      const result = await response.json()

      if (result.success) {
        showMessage('success', '✓ Configuración restablecida')
        await loadConfigs()
      } else {
        showMessage('error', 'Error al restablecer: ' + result.error)
      }
    } catch (error) {
      console.error('Error restableciendo:', error)
      showMessage('error', 'Error al restablecer la configuración')
    } finally {
      setSaving(false)
    }
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

  // Funciones para manejo de prompts
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
    { key: 'enrich_description', label: '✨ Enriquecer Textos', icon: '📝' }
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
                Ajusta los prompts y parámetros de los agentes de inteligencia artificial
              </p>
            </div>
          </div>
        </div>

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
              {configTabs.map((tab) => (
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
        </div>

        {/* Info sobre tipos de prompts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Cómo funcionan los diferentes tipos de prompts</h3>
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
