import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Solo para debugging - NO dejar en producción
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
    SERPAPI_KEY: process.env.SERPAPI_KEY ? 'SET' : 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || 
      key.includes('OPENAI') || 
      key.includes('SERP')
    )
  }

  return NextResponse.json(env)
}

