/**
 * Script para probar el API del chatbot
 * Ejecutar: node scripts/test-chatbot-api.js
 */

async function testChatbot() {
  const url = 'https://www.mapafurgocasa.com/api/chatbot'
  
  console.log('🧪 Probando chatbot API...\n')
  console.log('URL:', url)
  console.log('\n1️⃣ Verificando estado (GET)...\n')
  
  // Test 1: GET para ver estado
  try {
    const response = await fetch(url)
    const data = await response.json()
    console.log('✅ Respuesta GET:')
    console.log(JSON.stringify(data, null, 2))
    console.log('\n')
  } catch (error) {
    console.error('❌ Error en GET:', error.message)
  }
  
  console.log('2️⃣ Enviando mensaje de prueba (POST)...\n')
  
  // Test 2: POST con mensaje simple
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Hola'
          }
        ]
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Respuesta exitosa:')
      console.log('  - Mensaje:', data.message?.substring(0, 100) + '...')
      console.log('  - Modelo:', data.modelo)
      console.log('  - Tokens:', data.tokensUsados)
    } else {
      console.error('❌ Error del servidor:')
      console.error('  - Status:', response.status)
      console.error('  - Error:', data.error)
      console.error('  - Message:', data.message)
      console.error('\n📋 Respuesta completa:')
      console.error(JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error('❌ Error en POST:', error.message)
  }
}

testChatbot()

