import { getJson } from 'serpapi'

export interface Comparable {
  titulo: string
  precio: number | null
  kilometros: number | null
  año: number | null
  url: string
  fuente: string
  descripcion: string
  relevancia: number // 0-100
}

export async function buscarComparables(
  marca: string,
  modelo: string,
  año: number,
  maxResultados: number = 8
): Promise<Comparable[]> {
  const comparables: Comparable[] = []
  
  // Queries optimizados para encontrar anuncios de venta
  const queries = [
    `${marca} ${modelo} ${año} venta segunda mano precio`,
    `site:coches.net ${marca} ${modelo} ${año - 1} ${año} ${año + 1}`,
    `site:autoscout24.es autocaravana ${marca} ${modelo}`,
    `site:milanuncios.com camper ${marca} ${modelo} venta`,
    `"${marca} ${modelo}" autocaravana segunda mano`,
  ]
  
  console.log(`🔍 Buscando comparables para ${marca} ${modelo} ${año}...`)
  
  for (const query of queries) {
    try {
      const response = await getJson({
        engine: "google",
        q: query,
        location: "Spain",
        google_domain: "google.es",
        gl: "es",
        hl: "es",
        num: 10,
        api_key: process.env.SERPAPI_KEY
      })
      
      const results = response.organic_results || []
      
      for (const result of results) {
        const comparable = parseResultado(result, marca, modelo, año)
        if (comparable && comparable.precio && comparable.precio > 5000) {
          comparables.push(comparable)
        }
      }
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 300))
      
    } catch (error) {
      console.error(`❌ Error en query "${query}":`, error)
    }
  }
  
  // Eliminar duplicados por URL
  const uniqueComparables = Array.from(
    new Map(comparables.map(c => [c.url, c])).values()
  )
  
  // Ordenar por relevancia
  const sorted = uniqueComparables.sort((a, b) => b.relevancia - a.relevancia)
  
  console.log(`✅ Encontrados ${sorted.length} comparables únicos`)
  
  return sorted.slice(0, maxResultados)
}

function parseResultado(result: any, marca: string, modelo: string, añoBuscado: number): Comparable | null {
  const titulo = result.title || ''
  const snippet = result.snippet || ''
  const url = result.link || ''
  const textoCompleto = `${titulo} ${snippet}`.toLowerCase()
  
  // Verificar que menciona la marca o modelo
  const mencionaMarca = textoCompleto.includes(marca.toLowerCase())
  const mencionaModelo = textoCompleto.includes(modelo.toLowerCase())
  
  if (!mencionaMarca && !mencionaModelo) {
    return null
  }
  
  // Extraer precio (múltiples formatos)
  let precio: number | null = null
  const precioPatterns = [
    /(\d{1,3}(?:\.\d{3})+)\s*€/g,
    /€\s*(\d{1,3}(?:\.\d{3})+)/g,
    /(\d{1,3}(?:\.\d{3})+)\s*euros?/gi,
    /precio:?\s*(\d{1,3}(?:\.\d{3})+)/gi
  ]
  
  for (const pattern of precioPatterns) {
    const matches = textoCompleto.matchAll(pattern)
    for (const match of matches) {
      const numeroStr = match[1].replace(/\./g, '')
      const num = parseInt(numeroStr)
      if (num >= 5000 && num <= 500000) {
        precio = num
        break
      }
    }
    if (precio) break
  }
  
  // Extraer kilometraje
  let kilometros: number | null = null
  const kmMatch = textoCompleto.match(/(\d{1,3}(?:\.\d{3})*)\s*km/i)
  if (kmMatch) {
    kilometros = parseInt(kmMatch[1].replace(/\./g, ''))
  }
  
  // Extraer año
  let año: number | null = null
  const añoMatch = textoCompleto.match(/\b(19\d{2}|20\d{2})\b/)
  if (añoMatch) {
    año = parseInt(añoMatch[1])
  }
  
  // Determinar fuente
  let fuente = 'Otro'
  if (url.includes('coches.net')) fuente = 'Coches.net'
  else if (url.includes('autoscout24')) fuente = 'AutoScout24'
  else if (url.includes('milanuncios')) fuente = 'Milanuncios'
  else if (url.includes('wallapop')) fuente = 'Wallapop'
  else if (url.includes('vibbo')) fuente = 'Vibbo'
  
  // Calcular relevancia
  let relevancia = 50
  if (mencionaMarca) relevancia += 20
  if (mencionaModelo) relevancia += 20
  if (precio) relevancia += 15
  if (año && Math.abs(año - añoBuscado) <= 2) relevancia += 15
  if (kilometros) relevancia += 10
  if (fuente !== 'Otro') relevancia += 10
  
  return {
    titulo: titulo.substring(0, 150),
    precio,
    kilometros,
    año,
    url,
    fuente,
    descripcion: snippet.substring(0, 200),
    relevancia: Math.min(relevancia, 100)
  }
}

