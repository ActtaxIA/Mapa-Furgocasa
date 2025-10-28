import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  const checks = {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasSerpAPI: !!process.env.SERPAPI_KEY,
    openaiKeyValid: false,
    serpApiKeyValid: false,
    openaiError: null as string | null,
    serpApiError: null as string | null
  }

  // Validar OpenAI
  if (checks.hasOpenAI) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!
      })
      
      // Test simple: listar modelos
      const models = await openai.models.list()
      checks.openaiKeyValid = !!models.data && models.data.length > 0
    } catch (e: any) {
      checks.openaiKeyValid = false
      checks.openaiError = e.message || 'Error desconocido'
    }
  } else {
    checks.openaiError = 'Variable OPENAI_API_KEY no definida en .env.local'
  }

  // Validar SerpAPI
  if (checks.hasSerpAPI) {
    try {
      const response = await fetch(
        `https://serpapi.com/account.json?api_key=${process.env.SERPAPI_KEY}`
      )
      
      if (response.ok) {
        const data = await response.json()
        checks.serpApiKeyValid = !!data.account_email
      } else {
        checks.serpApiKeyValid = false
        const errorData = await response.json().catch(() => ({}))
        checks.serpApiError = errorData.error || `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (e: any) {
      checks.serpApiKeyValid = false
      checks.serpApiError = e.message || 'Error desconocido'
    }
  } else {
    checks.serpApiError = 'Variable SERPAPI_KEY no definida en .env.local'
  }

  return NextResponse.json(checks)
}

