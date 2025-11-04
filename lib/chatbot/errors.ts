/**
 * MENSAJES DE ERROR AMIGABLES
 * ============================
 * Sistema centralizado de mensajes de error para el chatbot
 */

export interface ErrorMessage {
  user: string      // Mensaje para el usuario (amigable)
  admin?: string    // Mensaje técnico para admin/logs
  action?: string   // Acción sugerida
}

/**
 * Diccionario de errores conocidos
 */
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Errores de OpenAI
  OPENAI_INVALID_KEY: {
    user: '🔧 **El asistente está en mantenimiento**\n\n' +
          'Estamos trabajando para volver pronto.\n\n' +
          '💡 **Mientras tanto puedes:**\n' +
          '• Explorar el mapa en /mapa\n' +
          '• Buscar áreas manualmente en /buscar\n' +
          '• Usar el planificador de rutas en /ruta',
    admin: 'API Key de OpenAI inválida o expirada',
    action: 'Verificar OPENAI_API_KEY en variables de entorno'
  },
  
  OPENAI_RATE_LIMIT: {
    user: '⏱️ **El asistente está muy ocupado**\n\n' +
          'Hay muchas consultas en este momento.\n\n' +
          '💡 **Por favor:**\n' +
          '1. Espera 1-2 minutos\n' +
          '2. Intenta de nuevo\n\n' +
          'O explora el mapa mientras tanto 🗺️',
    admin: 'OpenAI rate limit exceeded',
    action: 'Aumentar límite en OpenAI o esperar'
  },
  
  OPENAI_TIMEOUT: {
    user: '⏱️ **La respuesta está tardando mucho**\n\n' +
          'El servidor puede estar ocupado.\n\n' +
          '💡 **Prueba:**\n' +
          '1. Hacer una pregunta más simple\n' +
          '2. Esperar 30 segundos e intentar de nuevo\n' +
          '3. Recargar la página',
    admin: 'OpenAI request timeout',
    action: 'Verificar latencia de OpenAI API'
  },
  
  OPENAI_QUOTA_EXCEEDED: {
    user: '💳 **Servicio temporalmente limitado**\n\n' +
          'Hemos alcanzado nuestro límite de uso.\n\n' +
          '💡 **Alternativas:**\n' +
          '• Usar el buscador manual\n' +
          '• Explorar el mapa interactivo\n' +
          '• Volver en unas horas',
    admin: 'OpenAI quota exceeded - recarga necesaria',
    action: 'Aumentar créditos en OpenAI'
  },
  
  // Errores de Supabase
  SUPABASE_CONNECTION: {
    user: '🔌 **Problema de conexión temporal**\n\n' +
          'No podemos acceder a nuestra base de datos.\n\n' +
          '💡 **Intenta:**\n' +
          '1. Recargar la página\n' +
          '2. Esperar unos segundos\n' +
          '3. Si persiste: soporte@mapafurgocasa.com',
    admin: 'Supabase connection failed',
    action: 'Verificar estado de Supabase y credenciales'
  },
  
  SUPABASE_TIMEOUT: {
    user: '⏱️ **Base de datos muy lenta**\n\n' +
          'La consulta está tardando demasiado.\n\n' +
          '💡 **Prueba:**\n' +
          '• Buscar en una zona más específica\n' +
          '• Reducir el número de filtros\n' +
          '• Intentar de nuevo en unos momentos',
    admin: 'Supabase query timeout',
    action: 'Optimizar queries o añadir índices'
  },
  
  // Errores de configuración
  CHATBOT_NOT_CONFIGURED: {
    user: '⚙️ **Asistente no disponible**\n\n' +
          'La configuración del chatbot no está completa.\n\n' +
          '💡 **Contacta con:**\n' +
          'soporte@mapafurgocasa.com',
    admin: 'Falta configuración en chatbot_config',
    action: 'Verificar tabla chatbot_config en Supabase'
  },
  
  CONFIG_MISSING_API_KEY: {
    user: '🔧 **Asistente en configuración**\n\n' +
          'Estamos configurando el sistema.\n\n' +
          '💡 **Vuelve en:**\n' +
          '5-10 minutos',
    admin: 'Falta OPENAI_API_KEY en variables de entorno',
    action: 'Añadir OPENAI_API_KEY en AWS Amplify'
  },
  
  // Errores de red
  NETWORK_ERROR: {
    user: '📡 **Error de red**\n\n' +
          'No pudimos conectar con el servidor.\n\n' +
          '💡 **Verifica:**\n' +
          '1. Tu conexión a internet\n' +
          '2. Recarga la página\n' +
          '3. Intenta de nuevo',
    admin: 'Network error / fetch failed',
    action: 'Verificar conectividad'
  },
  
  FETCH_TIMEOUT: {
    user: '⏱️ **Tiempo de espera agotado**\n\n' +
          'La petición tardó demasiado.\n\n' +
          '💡 **Intenta:**\n' +
          '1. Recargar la página\n' +
          '2. Hacer una pregunta más corta\n' +
          '3. Esperar 30 segundos',
    admin: 'Fetch timeout (>30s)',
    action: 'Verificar latencia del servidor'
  },
  
  // Errores de validación
  INVALID_INPUT: {
    user: '❌ **Entrada no válida**\n\n' +
          'Por favor verifica que:\n' +
          '• El mensaje no esté vacío\n' +
          '• Tenga menos de 1000 caracteres\n' +
          '• No contenga caracteres extraños',
    admin: 'Input validation failed',
    action: 'Verificar validación en frontend'
  },
  
  NO_MESSAGES: {
    user: '📝 **Escribe un mensaje**\n\n' +
          'No puedo responder si no me preguntas algo 😊\n\n' +
          '💡 **Ejemplos:**\n' +
          '• "Áreas cerca de Madrid"\n' +
          '• "Busco áreas con WiFi"\n' +
          '• "Mejores áreas en Portugal"',
    admin: 'Empty messages array',
    action: 'N/A - error de usuario'
  },
  
  // Error genérico
  GENERIC: {
    user: '❌ **Ha ocurrido un error**\n\n' +
          'No pudimos procesar tu consulta.\n\n' +
          '💡 **Intenta:**\n' +
          '1. Recargar la página\n' +
          '2. Intentar de nuevo\n' +
          '3. Si persiste, contacta: soporte@mapafurgocasa.com',
    admin: 'Unknown error',
    action: 'Revisar logs para más detalles'
  }
}

/**
 * Detecta el tipo de error y retorna el mensaje apropiado
 */
export function getErrorMessage(error: any): ErrorMessage {
  // Errores de OpenAI (por status code)
  if (error.status === 401) return ERROR_MESSAGES.OPENAI_INVALID_KEY
  if (error.status === 429) return ERROR_MESSAGES.OPENAI_RATE_LIMIT
  if (error.status === 400 && error.message?.includes('OpenAI')) {
    return ERROR_MESSAGES.OPENAI_TIMEOUT
  }
  if (error.code === 'insufficient_quota') {
    return ERROR_MESSAGES.OPENAI_QUOTA_EXCEEDED
  }
  
  // Errores de red
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.FETCH_TIMEOUT
  }
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  
  // Errores de Supabase
  if (error.message?.includes('Supabase') || error.message?.includes('PostgreSQL')) {
    if (error.message?.includes('timeout')) {
      return ERROR_MESSAGES.SUPABASE_TIMEOUT
    }
    return ERROR_MESSAGES.SUPABASE_CONNECTION
  }
  
  // Errores de configuración
  if (error.message?.includes('OPENAI_API_KEY')) {
    return ERROR_MESSAGES.CONFIG_MISSING_API_KEY
  }
  if (error.message?.includes('configuración')) {
    return ERROR_MESSAGES.CHATBOT_NOT_CONFIGURED
  }
  
  // Error genérico
  return ERROR_MESSAGES.GENERIC
}

/**
 * Formatea el mensaje de error para el usuario
 */
export function formatErrorForUser(error: any): string {
  const errorMsg = getErrorMessage(error)
  return errorMsg.user
}

/**
 * Log de error con contexto completo (para admin/desarrollo)
 */
export function logError(error: any, context?: string) {
  const errorMsg = getErrorMessage(error)
  
  console.error(`❌ [ERROR] ${context || 'Chatbot'}`)
  console.error('User message:', errorMsg.user.substring(0, 100) + '...')
  console.error('Admin message:', errorMsg.admin)
  console.error('Action:', errorMsg.action)
  console.error('Original error:', error)
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', error.stack)
  }
}

