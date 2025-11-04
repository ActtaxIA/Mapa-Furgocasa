/**
 * SISTEMA DE LOGGING CON NIVELES
 * ================================
 * Logger centralizado que reduce logs en producción
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDev: boolean
  private isProd: boolean
  
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.isProd = process.env.NODE_ENV === 'production'
  }
  
  /**
   * DEBUG: Solo en development
   * Usado para debugging detallado
   */
  debug(message: string, context?: LogContext) {
    if (!this.isDev) return
    
    console.log('🔍 [DEBUG]', message, context || '')
  }
  
  /**
   * INFO: Solo en development
   * Logs informativos que no son críticos
   */
  info(message: string, context?: LogContext) {
    if (!this.isDev) return
    
    console.log('ℹ️  [INFO]', message, context || '')
  }
  
  /**
   * WARN: En development y production
   * Advertencias que deben ser visibles siempre
   */
  warn(message: string, context?: LogContext) {
    const prefix = this.isProd ? '⚠️' : '⚠️  [WARN]'
    console.warn(prefix, message, context || '')
  }
  
  /**
   * ERROR: En development y production
   * Errores que siempre deben registrarse
   */
  error(message: string, error?: any, context?: LogContext) {
    const prefix = this.isProd ? '❌' : '❌ [ERROR]'
    console.error(prefix, message)
    
    if (context) {
      console.error('Context:', context)
    }
    
    if (error) {
      console.error('Error:', error.message || error)
      
      // Stack trace solo en development
      if (this.isDev && error.stack) {
        console.error('Stack:', error.stack)
      }
    }
  }
  
  /**
   * METRIC: Métricas de performance (solo desarrollo)
   */
  metric(name: string, value: number, unit: string = 'ms') {
    if (!this.isDev) return
    
    console.log(`📊 [METRIC] ${name}: ${value}${unit}`)
  }
  
  /**
   * API: Log de llamadas API (reducido en producción)
   */
  api(method: string, endpoint: string, status: number, duration?: number) {
    if (this.isProd && status < 400) {
      // En producción, solo loggear errores (status >= 400)
      return
    }
    
    const statusEmoji = status < 400 ? '✅' : '❌'
    const durationStr = duration ? ` (${duration}ms)` : ''
    
    if (this.isDev) {
      console.log(`${statusEmoji} [API] ${method} ${endpoint} → ${status}${durationStr}`)
    } else {
      // En producción, log mínimo solo para errores
      console.error(`${statusEmoji} ${method} ${endpoint} ${status}${durationStr}`)
    }
  }
  
  /**
   * START/END: Medir duración de operaciones
   */
  start(operation: string): () => void {
    if (!this.isDev) {
      // En producción, retornar función vacía
      return () => {}
    }
    
    const startTime = Date.now()
    console.log(`⏱️  [START] ${operation}`)
    
    return () => {
      const duration = Date.now() - startTime
      console.log(`✅ [END] ${operation} (${duration}ms)`)
    }
  }
}

// Instancia singleton
export const logger = new Logger()

/**
 * Helper para loggear solo en desarrollo
 */
export function devLog(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

/**
 * Helper para loggear solo errores importantes
 */
export function prodError(message: string, error?: any) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌', message, error?.message || error)
  } else {
    console.error('❌ [ERROR]', message, error)
  }
}

