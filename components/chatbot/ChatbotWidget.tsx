'use client'

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface Message {
  rol: 'user' | 'assistant'
  contenido: string
  areas?: any[]
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversacionId, setConversacionId] = useState<string | null>(null)
  const [ubicacion, setUbicacion] = useState<{lat: number, lng: number} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  
  // Comprobar autenticación
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])
  
  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Obtener geolocalización
  useEffect(() => {
    if (isOpen && user && !ubicacion) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUbicacion({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
            console.log('📍 Ubicación obtenida:', position.coords.latitude, position.coords.longitude)
          },
          (error) => {
            console.log('⚠️ No se pudo obtener ubicación:', error)
          }
        )
      }
    }
  }, [isOpen, user, ubicacion])
  
  // Iniciar conversación
  const iniciarConversacion = async () => {
    if (!user) return
    
    const sesionId = user.id || `anon_${Date.now()}`
    
    const { data, error } = await supabase
      .from('chatbot_conversaciones')
      .insert({
        user_id: user.id,
        sesion_id: sesionId,
        titulo: 'Nueva conversación',
        ubicacion_usuario: ubicacion ? { lat: ubicacion.lat, lng: ubicacion.lng } : null
      })
      .select()
      .single()
    
    if (data) {
      setConversacionId(data.id)
      
      // Mensaje de bienvenida
      setMessages([{
        rol: 'assistant',
        contenido: '¡Hola! 👋 Soy tu asistente de Furgocasa. ¿En qué puedo ayudarte hoy?\n\nPuedo ayudarte a:\n🔍 Encontrar áreas para tu autocaravana\n📍 Recomendar las mejores ubicaciones\n💡 Responder dudas sobre servicios y precios\n🌍 Buscar áreas por país o región\n\n💡 **Tip:** Si quieres planificar una ruta completa, usa nuestra herramienta 🗺️ **Planificador de Rutas** en /ruta\n\n¡Pregúntame lo que necesites! 🚐'
      }])
    }
  }
  
  // Abrir chat
  const handleOpen = () => {
    setIsOpen(true)
    if (user && !conversacionId) {
      iniciarConversacion()
    }
  }
  
  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!input.trim() || sending || !user) return
    
    const userMessage: Message = { rol: 'user', contenido: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)
    
    // Guardar mensaje del usuario en BD
    if (conversacionId) {
      await supabase.from('chatbot_mensajes').insert({
        conversacion_id: conversacionId,
        rol: 'user',
        contenido: input
      })
    }
    
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({ 
            role: m.rol, 
            content: m.contenido 
          })),
          conversacionId,
          ubicacionUsuario: ubicacion
        })
      })
      
      if (!response.ok) {
        throw new Error('Error en la respuesta')
      }
      
      const data = await response.json()
      
      setMessages(prev => [...prev, {
        rol: 'assistant',
        contenido: data.message,
        areas: data.areas
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        rol: 'assistant',
        contenido: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.'
      }])
    } finally {
      setSending(false)
    }
  }
  
  // Loading inicial
  if (loading) {
    return null
  }
  
  // MODAL DE BLOQUEO (si no está autenticado)
  if (isOpen && !user) {
    return (
      <>
        {/* Botón difuminado */}
        <button
          onClick={() => setIsOpen(false)}
          className="fixed bottom-6 right-6 bg-gray-400 text-white rounded-full p-4 shadow-2xl z-50 blur-sm"
        >
          <span className="text-2xl">💬</span>
        </button>
        
        {/* Modal de bloqueo */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            {/* Botón cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Icono de candado con chatbot */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">💬</span>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Asistente IA Bloqueado
            </h2>

            {/* Descripción */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Para usar el <span className="font-semibold text-purple-600">Asistente Inteligente</span> con IA, 
              una de nuestras herramientas más avanzadas, necesitas registrarte e iniciar sesión.
            </p>

            {/* Beneficios */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-purple-900 mb-2">✨ Con el asistente IA podrás:</p>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>🤖 Búsqueda inteligente con IA</li>
                <li>💬 Conversación natural en español</li>
                <li>🎯 Recomendaciones personalizadas</li>
                <li>📍 Búsqueda por ubicación GPS</li>
                <li>⚡ Respuestas instantáneas 24/7</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                🚀 Registrarme Gratis
              </Link>
              
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-white border-2 border-gray-300 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {/* Texto pequeño */}
            <p className="text-xs text-gray-500 text-center mt-4">
              ✓ Acceso inmediato · ✓ 100% gratis · ✓ IA avanzada
            </p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
          title="Asistente IA"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}
      
      {/* Ventana del chat */}
      {isOpen && user && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <span>🤖</span>
                Asistente Furgocasa
              </h3>
              <p className="text-xs opacity-90">IA · Respuestas en tiempo real</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.rol === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white text-gray-900 shadow-md border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.contenido}</p>
                  
                  {/* Mostrar áreas si las hay */}
                  {msg.areas && msg.areas.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.areas.slice(0, 3).map((area: any) => (
                        <Link
                          key={area.id}
                          href={`/area/${area.slug}`}
                          className="block bg-purple-50 hover:bg-purple-100 p-2 rounded-lg text-xs transition-colors"
                          target="_blank"
                        >
                          <strong className="text-purple-900">{area.nombre}</strong>
                          <div className="text-purple-700 text-xs mt-1">
                            📍 {area.ciudad}, {area.pais}
                            {area.precio_noche !== null && area.precio_noche > 0 && (
                              <span className="ml-2">💰 {area.precio_noche}€</span>
                            )}
                            {(area.precio_noche === null || area.precio_noche === 0) && (
                              <span className="ml-2">💰 Gratis</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                placeholder="Pregunta lo que necesites..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={sending}
              />
              <button
                onClick={enviarMensaje}
                disabled={sending || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-6 py-2 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              >
                {sending ? '...' : 'Enviar'}
              </button>
            </div>
            {ubicacion && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                📍 Ubicación detectada · Las búsquedas serán más precisas
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

