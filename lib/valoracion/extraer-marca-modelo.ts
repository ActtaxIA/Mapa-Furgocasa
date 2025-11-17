/**
 * Extrae marca y modelo de un título de anuncio de autocaravana
 * 
 * Uso: Para guardar comparables con marca/modelo precisos en datos_mercado_autocaravanas
 */

// Lista completa de marcas conocidas de autocaravanas
const MARCAS_CONOCIDAS = [
  // Marcas principales
  'adria', 'weinsberg', 'giottivan', 'dreamer', 'pilote', 'knaus',
  'hymer', 'bürstner', 'burstner', 'carado', 'challenger', 'chausson',
  'ci', 'dethleffs', 'elddis', 'elnagh', 'etrusco', 'fendt',
  'font vendome', 'font-vendome', 'frankia', 'hobby', 'itineo', 'joint',
  'karmann', 'la strada', 'laika', 'mclouis', 'mc louis', 'mobilvetta',
  'niesmann', 'pössl', 'possl', 'rapido', 'roller team', 'sun living',
  'sunlight', 'trigano', 'westfalia', 'wildax',
  
  // Marcas españolas
  'benimar', 'autostar', 'sterckeman', 'campereve',
  
  // Marcas de furgonetas camper base
  'volkswagen', 'vw', 'mercedes', 'ford', 'fiat', 'ducato', 'peugeot',
  'renault', 'citroen', 'citroën', 'iveco', 'nissan', 'toyota',
  
  // Marcas de lujo
  'carthago', 'concorde', 'morelo', 'niesmann+bischoff'
]

// Patrones comunes de modelos (para mejorar extracción)
const PATRONES_MODELO = [
  // Formatos alfanuméricos
  /\b([a-z]+[-\s]?\d{2,4}[a-z]*)\b/gi,         // "twin-600" "V600S" "54T"
  /\b([a-z]+\s+[a-z]+\s+\d{2,4})\b/gi,         // "twin plus 600"
  /\b([a-z]+\s+[a-z]+)\b/gi,                   // "twin plus" "fun living"
]

export interface MarcaModelo {
  marca: string
  modelo: string
  confianza: number // 0-100
}

/**
 * Extrae marca y modelo de un título de anuncio
 * 
 * @param titulo - Título del anuncio (ej: "Adria Twin Plus 600 SPT 2023")
 * @param snippet - Snippet opcional para contexto adicional
 * @returns Objeto con marca, modelo y nivel de confianza
 */
export function extraerMarcaModelo(titulo: string, snippet?: string): MarcaModelo {
  const textoCompleto = `${titulo} ${snippet || ''}`.toLowerCase()
  const tituloLimpio = titulo.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .trim()
  
  let marcaEncontrada: string | null = null
  let confianza = 0
  
  // 1. Buscar marca conocida en el título
  for (const marca of MARCAS_CONOCIDAS) {
    const marcaNormalizada = marca
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    
    if (tituloLimpio.includes(marcaNormalizada)) {
      marcaEncontrada = marca
      confianza = 80
      break
    }
  }
  
  // Si no encontramos marca, intentar en snippet
  if (!marcaEncontrada && snippet) {
    const snippetLimpio = snippet.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    
    for (const marca of MARCAS_CONOCIDAS) {
      const marcaNormalizada = marca
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
      
      if (snippetLimpio.includes(marcaNormalizada)) {
        marcaEncontrada = marca
        confianza = 60
        break
      }
    }
  }
  
  // Si aún no hay marca, usar primera palabra como marca genérica
  if (!marcaEncontrada) {
    const primeraPalabra = tituloLimpio.split(/\s+/)[0]
    if (primeraPalabra && primeraPalabra.length >= 3) {
      marcaEncontrada = primeraPalabra
      confianza = 30
    } else {
      marcaEncontrada = 'Desconocido'
      confianza = 0
    }
  }
  
  // 2. Extraer modelo (texto después de la marca)
  let modeloEncontrado = 'Desconocido'
  
  if (marcaEncontrada && marcaEncontrada !== 'Desconocido') {
    const marcaNormalizada = marcaEncontrada
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    
    const indiceMarca = tituloLimpio.indexOf(marcaNormalizada)
    
    if (indiceMarca !== -1) {
      // Obtener texto después de la marca
      const textoDepuesMarca = tituloLimpio
        .substring(indiceMarca + marcaNormalizada.length)
        .trim()
      
      // Limpiar el texto (remover año, precio, kms)
      const textoLimpio = textoDepuesMarca
        .replace(/\b(19|20)\d{2}\b/g, '')     // Quitar años
        .replace(/\d{1,3}[.,]?\d{3}\s*€/g, '') // Quitar precios
        .replace(/\d{1,3}[.,]?\d{3}\s*km/gi, '') // Quitar kilometraje
        .replace(/[^\w\s-]/g, ' ')             // Quitar símbolos extraños
        .replace(/\s+/g, ' ')                  // Normalizar espacios
        .trim()
      
      // Tomar primeras 3-4 palabras como modelo
      const palabras = textoLimpio
        .split(/\s+/)
        .filter(p => p.length > 1) // Filtrar palabras muy cortas
        .slice(0, 4)
      
      if (palabras.length > 0) {
        modeloEncontrado = palabras.join(' ')
        confianza = Math.min(confianza + 10, 100)
      }
    }
  }
  
  // 3. Capitalizar para presentación
  const marcaCapitalizada = capitalizarMarca(marcaEncontrada || 'Desconocido')
  const modeloCapitalizado = capitalizarModelo(modeloEncontrado)
  
  return {
    marca: marcaCapitalizada,
    modelo: modeloCapitalizado,
    confianza
  }
}

/**
 * Capitaliza una marca correctamente
 */
function capitalizarMarca(marca: string): string {
  // Casos especiales
  const casosEspeciales: Record<string, string> = {
    'vw': 'VW',
    'ci': 'CI',
    'mc louis': 'Mc Louis',
    'mclouis': 'McLouis',
    'font vendome': 'Font Vendome',
    'la strada': 'La Strada',
    'roller team': 'Roller Team',
    'sun living': 'Sun Living',
    'possl': 'Pössl',
    'burstner': 'Bürstner'
  }
  
  const marcaLower = marca.toLowerCase()
  if (casosEspeciales[marcaLower]) {
    return casosEspeciales[marcaLower]
  }
  
  // Capitalización estándar
  return marca
    .split(/[\s-]+/)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Capitaliza un modelo correctamente
 */
function capitalizarModelo(modelo: string): string {
  // Mantener números y códigos en mayúsculas
  return modelo
    .split(/\s+/)
    .map(palabra => {
      // Si tiene números o es código alfanumérico corto, mantener como está
      if (/\d/.test(palabra) || palabra.length <= 3) {
        return palabra.toUpperCase()
      }
      // Sino, capitalizar primera letra
      return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Valida si marca y modelo son razonables
 */
export function validarMarcaModelo(marca: string, modelo: string): boolean {
  // Marca debe tener al menos 2 caracteres
  if (!marca || marca.length < 2 || marca === 'Desconocido') {
    return false
  }
  
  // Modelo debe tener al menos 1 carácter
  if (!modelo || modelo.length < 1 || modelo === 'Desconocido') {
    return false
  }
  
  // No deben ser iguales
  if (marca.toLowerCase() === modelo.toLowerCase()) {
    return false
  }
  
  return true
}

