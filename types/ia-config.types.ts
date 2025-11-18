// Tipos para la configuración de agentes de IA

export type PromptRole = 'system' | 'user' | 'assistant' | 'agent'

export interface PromptMessage {
  id: string
  role: PromptRole
  content: string
  order: number
  required: boolean
}

export interface IAConfigValue {
  model: string
  temperature: number
  max_tokens: number
  prompts: PromptMessage[]
  porcentaje_iedmt?: number  // Porcentaje IEDMT para normalización de precios (solo valoracion_vehiculos)
}

export interface IAConfig {
  id: string
  config_key: string
  config_value: IAConfigValue
  descripcion: string
  created_at: string
  updated_at: string
}

// Colores para la UI según el tipo de prompt
export const PROMPT_COLORS = {
  system: {
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    badge: 'bg-orange-200 text-orange-800',
    icon: '⚙️'
  },
  user: {
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    badge: 'bg-blue-200 text-blue-800',
    icon: '👤'
  },
  assistant: {
    border: 'border-green-300',
    bg: 'bg-green-50',
    badge: 'bg-green-200 text-green-800',
    icon: '🤖'
  },
  agent: {
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    badge: 'bg-purple-200 text-purple-800',
    icon: '🎯'
  }
}

// Labels para la UI
export const PROMPT_LABELS: Record<PromptRole, string> = {
  system: 'System',
  user: 'User',
  assistant: 'Assistant',
  agent: 'Agent'
}

