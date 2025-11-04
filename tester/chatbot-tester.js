/**
 * 🧪 CHATBOT TESTER AUTOMATIZADO
 * Sistema que simula usuarios reales, detecta errores y genera reportes
 * 
 * Uso: node tester/chatbot-tester.js
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

class ChatbotTester {
  constructor(config = {}) {
    this.url = config.url || 'https://www.mapafurgocasa.com'
    this.testUser = {
      email: 'info@furgocasa.com',
      password: 'Fur2022casa@'
    }
    this.logs = []
    this.errors = []
    this.screenshots = []
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0,
      startTime: null,
      endTime: null
    }
    this.browser = null
    this.page = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, type, message }
    this.logs.push(logEntry)
    
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪',
      network: '🌐',
      console: '📝'
    }[type] || 'ℹ️'
    
    console.log(`${emoji} [${timestamp}] ${message}`)
  }

  async init() {
    this.log('Iniciando navegador Chromium...', 'info')
    
    this.browser = await puppeteer.launch({
      headless: false, // Cambiar a true para ejecución silenciosa
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    })
    
    this.page = await this.browser.newPage()
    
    // Configurar viewport
    await this.page.setViewport({ width: 1920, height: 1080 })
    
    // Capturar logs de consola del navegador
    this.page.on('console', msg => {
      const type = msg.type()
      if (type === 'error' || type === 'warning') {
        this.log(`Browser Console [${type}]: ${msg.text()}`, 'console')
        if (type === 'error') {
          this.errors.push({
            timestamp: new Date().toISOString(),
            source: 'browser_console',
            message: msg.text()
          })
        }
      }
    })
    
    // Capturar errores de página
    this.page.on('pageerror', error => {
      this.log(`Page Error: ${error.message}`, 'error')
      this.errors.push({
        timestamp: new Date().toISOString(),
        source: 'page_error',
        message: error.message,
        stack: error.stack
      })
    })
    
    // Capturar respuestas de red
    this.page.on('response', async response => {
      const url = response.url()
      const status = response.status()
      
      // Solo logear APIs importantes
      if (url.includes('/api/chatbot')) {
        const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌'
        this.log(`${statusEmoji} API Response: ${status} - ${url}`, 'network')
        
        if (status >= 400) {
          try {
            const body = await response.json()
            this.errors.push({
              timestamp: new Date().toISOString(),
              source: 'api_error',
              url,
              status,
              body
            })
          } catch (e) {
            // No se pudo parsear el body
          }
        }
      }
    })
    
    this.log('Navegador iniciado correctamente', 'success')
  }

  async screenshot(name) {
    const filename = `tester/screenshots/${Date.now()}-${name}.png`
    await this.page.screenshot({ path: filename, fullPage: true })
    this.screenshots.push(filename)
    this.log(`Screenshot guardado: ${filename}`, 'info')
    return filename
  }

  async login() {
    this.log('🔐 Iniciando sesión como admin...', 'test')
    
    try {
      // Ir a la página de login
      await this.page.goto(`${this.url}/auth/login`, { waitUntil: 'networkidle2' })
      await this.screenshot('01-login-page')
      
      // Esperar formulario
      await this.page.waitForSelector('input[type="email"]', { timeout: 10000 })
      
      // Llenar formulario
      await this.page.type('input[type="email"]', this.testUser.email, { delay: 50 })
      await this.page.type('input[type="password"]', this.testUser.password, { delay: 50 })
      
      await this.screenshot('02-login-filled')
      
      // Click en login
      await this.page.click('button[type="submit"]')
      
      // Esperar navegación
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
      
      await this.screenshot('03-after-login')
      
      // Verificar que estamos logueados
      const currentUrl = this.page.url()
      if (currentUrl.includes('/auth/login')) {
        throw new Error('Login falló - aún estamos en /auth/login')
      }
      
      this.log('Login exitoso', 'success')
      return true
      
    } catch (error) {
      this.log(`Error en login: ${error.message}`, 'error')
      await this.screenshot('error-login')
      this.errors.push({
        timestamp: new Date().toISOString(),
        test: 'login',
        error: error.message,
        stack: error.stack
      })
      return false
    }
  }

  async openChatbot() {
    this.log('💬 Abriendo chatbot...', 'test')
    
    try {
      // Ir al mapa (donde está el chatbot)
      await this.page.goto(`${this.url}/mapa`, { waitUntil: 'networkidle2' })
      await this.screenshot('04-mapa-page')
      
      // Esperar que el botón del chatbot esté visible
      await this.page.waitForSelector('[data-testid="chatbot-button"], button[aria-label*="chat"], button:has-text("Tío Viajero")', { 
        timeout: 10000 
      })
      
      // Click en el botón del chatbot (buscar varios selectores posibles)
      const chatbotOpened = await this.page.evaluate(() => {
        // Buscar botón por texto
        const buttons = Array.from(document.querySelectorAll('button'))
        const chatButton = buttons.find(btn => 
          btn.textContent.includes('Tío Viajero') || 
          btn.textContent.includes('Chat') ||
          btn.getAttribute('aria-label')?.includes('chat')
        )
        
        if (chatButton) {
          chatButton.click()
          return true
        }
        return false
      })
      
      if (!chatbotOpened) {
        throw new Error('No se encontró el botón del chatbot')
      }
      
      // Esperar que el chat se abra
      await this.page.waitForTimeout(1000)
      await this.screenshot('05-chatbot-opened')
      
      this.log('Chatbot abierto', 'success')
      return true
      
    } catch (error) {
      this.log(`Error abriendo chatbot: ${error.message}`, 'error')
      await this.screenshot('error-open-chatbot')
      this.errors.push({
        timestamp: new Date().toISOString(),
        test: 'open_chatbot',
        error: error.message
      })
      return false
    }
  }

  async sendMessage(message) {
    this.log(`📨 Enviando mensaje: "${message}"`, 'test')
    
    try {
      // Buscar el input del chat
      const inputSelector = 'input[placeholder*="mensaje"], textarea[placeholder*="mensaje"], input[type="text"]'
      await this.page.waitForSelector(inputSelector, { timeout: 5000 })
      
      // Escribir mensaje
      await this.page.type(inputSelector, message, { delay: 50 })
      
      await this.screenshot(`06-message-typed-${Date.now()}`)
      
      // Buscar botón de enviar
      const sent = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const sendButton = buttons.find(btn => 
          btn.textContent.includes('Enviar') ||
          btn.querySelector('svg') || // Botón con icono
          btn.type === 'submit'
        )
        
        if (sendButton) {
          sendButton.click()
          return true
        }
        return false
      })
      
      if (!sent) {
        // Intentar con Enter
        await this.page.keyboard.press('Enter')
      }
      
      // Esperar respuesta (máximo 15 segundos)
      this.log('⏳ Esperando respuesta del chatbot...', 'info')
      
      await this.page.waitForTimeout(2000) // Esperar a que aparezca "Escribiendo..."
      
      // Esperar a que termine de escribir (el mensaje de respuesta aparezca)
      let attempts = 0
      let responseReceived = false
      
      while (attempts < 30 && !responseReceived) {
        await this.page.waitForTimeout(1000)
        attempts++
        
        // Verificar si hay respuesta del asistente
        responseReceived = await this.page.evaluate(() => {
          const messages = Array.from(document.querySelectorAll('[data-role="assistant"], .assistant-message, .message'))
          return messages.length > 0 && messages[messages.length - 1].textContent.length > 10
        })
        
        if (attempts % 5 === 0) {
          this.log(`⏳ Esperando respuesta... (${attempts}s)`, 'info')
        }
      }
      
      if (!responseReceived) {
        throw new Error('Timeout esperando respuesta del chatbot (30s)')
      }
      
      // Capturar la respuesta
      const response = await this.page.evaluate(() => {
        const messages = Array.from(document.querySelectorAll('[data-role="assistant"], .assistant-message, .message'))
        const lastMessage = messages[messages.length - 1]
        return lastMessage ? lastMessage.textContent : null
      })
      
      await this.screenshot(`07-response-received-${Date.now()}`)
      
      this.log(`✅ Respuesta recibida: "${response?.substring(0, 100)}..."`, 'success')
      
      return {
        success: true,
        message,
        response,
        duration: attempts * 1000
      }
      
    } catch (error) {
      this.log(`Error enviando mensaje: ${error.message}`, 'error')
      await this.screenshot(`error-send-message-${Date.now()}`)
      this.errors.push({
        timestamp: new Date().toISOString(),
        test: 'send_message',
        message,
        error: error.message
      })
      return {
        success: false,
        message,
        error: error.message
      }
    }
  }

  async testMultipleMessages() {
    this.log('🔄 Probando conversación múltiple...', 'test')
    
    const messages = [
      'Hola',
      'Busco áreas en Barcelona',
      'Quiero áreas gratis',
      'Dime más sobre la primera',
      'Gracias'
    ]
    
    const results = []
    
    for (const msg of messages) {
      const result = await this.sendMessage(msg)
      results.push(result)
      
      if (!result.success) {
        this.log(`❌ Test falló en mensaje: "${msg}"`, 'error')
        break
      }
      
      // Pausa entre mensajes
      await this.page.waitForTimeout(2000)
    }
    
    return results
  }

  async testAPIDirectly() {
    this.log('🌐 Probando API directamente...', 'test')
    
    try {
      const response = await fetch('https://www.mapafurgocasa.com/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hola, ¿funciona el chatbot?' }
          ]
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        this.log('✅ API responde correctamente', 'success')
        this.log(`Respuesta: ${data.message?.substring(0, 100)}...`, 'info')
        return { success: true, data }
      } else {
        this.log(`❌ API error ${response.status}`, 'error')
        this.errors.push({
          timestamp: new Date().toISOString(),
          test: 'api_direct',
          status: response.status,
          error: data
        })
        return { success: false, status: response.status, data }
      }
      
    } catch (error) {
      this.log(`❌ Error llamando API: ${error.message}`, 'error')
      return { success: false, error: error.message }
    }
  }

  async generateReport() {
    this.log('📊 Generando reporte...', 'info')
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: this.results.duration,
      results: this.results,
      logs: this.logs,
      errors: this.errors,
      screenshots: this.screenshots,
      summary: {
        totalTests: this.results.totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${((this.results.passed / this.results.totalTests) * 100).toFixed(2)}%`,
        totalErrors: this.errors.length
      }
    }
    
    // Guardar reporte JSON
    const reportPath = `tester/reports/report-${Date.now()}.json`
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Generar reporte HTML
    const htmlReport = this.generateHTMLReport(report)
    const htmlPath = `tester/reports/report-${Date.now()}.html`
    fs.writeFileSync(htmlPath, htmlReport)
    
    this.log(`✅ Reporte guardado: ${reportPath}`, 'success')
    this.log(`✅ Reporte HTML: ${htmlPath}`, 'success')
    
    return report
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot Test Report - ${new Date(report.timestamp).toLocaleString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .card.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .card.error { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
    .card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
    .card .value { font-size: 32px; font-weight: bold; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .log-entry { padding: 10px; border-left: 3px solid #ddd; margin-bottom: 5px; background: #f9f9f9; }
    .log-entry.error { border-left-color: #e74c3c; background: #fee; }
    .log-entry.success { border-left-color: #2ecc71; background: #efe; }
    .log-entry.warning { border-left-color: #f39c12; background: #fef9e7; }
    .error-box { background: #fee; border: 1px solid #e74c3c; padding: 15px; border-radius: 5px; margin-bottom: 10px; }
    .error-box pre { background: white; padding: 10px; overflow-x: auto; font-size: 12px; }
    .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .screenshot { border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
    .screenshot img { width: 100%; display: block; }
    .screenshot-name { padding: 10px; background: #f5f5f5; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Chatbot Test Report</h1>
    <p><strong>Fecha:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    <p><strong>Duración:</strong> ${(report.duration / 1000).toFixed(2)}s</p>
    
    <div class="summary">
      <div class="card">
        <h3>Total Tests</h3>
        <div class="value">${report.summary.totalTests}</div>
      </div>
      <div class="card success">
        <h3>Passed</h3>
        <div class="value">${report.summary.passed}</div>
      </div>
      <div class="card error">
        <h3>Failed</h3>
        <div class="value">${report.summary.failed}</div>
      </div>
      <div class="card">
        <h3>Success Rate</h3>
        <div class="value">${report.summary.successRate}</div>
      </div>
    </div>
    
    ${report.errors.length > 0 ? `
    <div class="section">
      <h2>❌ Errores Encontrados (${report.errors.length})</h2>
      ${report.errors.map(error => `
        <div class="error-box">
          <p><strong>Timestamp:</strong> ${error.timestamp}</p>
          <p><strong>Source:</strong> ${error.source || error.test || 'unknown'}</p>
          <p><strong>Message:</strong> ${error.message || error.error}</p>
          ${error.stack ? `<pre>${error.stack}</pre>` : ''}
          ${error.body ? `<pre>${JSON.stringify(error.body, null, 2)}</pre>` : ''}
        </div>
      `).join('')}
    </div>
    ` : '<div class="section"><h2>✅ No se encontraron errores</h2></div>'}
    
    <div class="section">
      <h2>📝 Logs (${report.logs.length})</h2>
      ${report.logs.map(log => `
        <div class="log-entry ${log.type}">
          <span style="opacity: 0.7; font-size: 12px;">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span style="font-weight: 500;">${log.type.toUpperCase()}</span>: ${log.message}
        </div>
      `).join('')}
    </div>
    
    ${report.screenshots.length > 0 ? `
    <div class="section">
      <h2>📸 Screenshots (${report.screenshots.length})</h2>
      <div class="screenshots">
        ${report.screenshots.map(screenshot => `
          <div class="screenshot">
            <img src="../${screenshot}" alt="Screenshot">
            <div class="screenshot-name">${path.basename(screenshot)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
    `
  }

  async runAllTests() {
    this.results.startTime = Date.now()
    this.log('🚀 Iniciando suite de tests...', 'info')
    
    await this.init()
    
    // Test 1: Login
    this.results.totalTests++
    if (await this.login()) {
      this.results.passed++
    } else {
      this.results.failed++
      this.log('❌ Tests abortados - login falló', 'error')
      await this.cleanup()
      return
    }
    
    // Test 2: Abrir chatbot
    this.results.totalTests++
    if (await this.openChatbot()) {
      this.results.passed++
    } else {
      this.results.failed++
    }
    
    // Test 3: Enviar mensaje simple
    this.results.totalTests++
    const simpleMessage = await this.sendMessage('Hola')
    if (simpleMessage.success) {
      this.results.passed++
    } else {
      this.results.failed++
    }
    
    // Test 4: Conversación múltiple
    this.results.totalTests++
    const multipleMessages = await this.testMultipleMessages()
    if (multipleMessages.every(r => r.success)) {
      this.results.passed++
    } else {
      this.results.failed++
    }
    
    // Test 5: API directa
    this.results.totalTests++
    const apiTest = await this.testAPIDirectly()
    if (apiTest.success) {
      this.results.passed++
    } else {
      this.results.failed++
    }
    
    this.results.endTime = Date.now()
    this.results.duration = this.results.endTime - this.results.startTime
    
    await this.cleanup()
    
    const report = await this.generateReport()
    
    this.log('', 'info')
    this.log('═══════════════════════════════════', 'info')
    this.log('📊 RESUMEN FINAL', 'info')
    this.log('═══════════════════════════════════', 'info')
    this.log(`Total Tests: ${report.summary.totalTests}`, 'info')
    this.log(`✅ Passed: ${report.summary.passed}`, 'success')
    this.log(`❌ Failed: ${report.summary.failed}`, 'error')
    this.log(`📈 Success Rate: ${report.summary.successRate}`, 'info')
    this.log(`⏱️  Duration: ${(this.results.duration / 1000).toFixed(2)}s`, 'info')
    this.log(`🐛 Errors: ${report.summary.totalErrors}`, report.summary.totalErrors > 0 ? 'error' : 'success')
    this.log('═══════════════════════════════════', 'info')
    
    return report
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
      this.log('Navegador cerrado', 'info')
    }
  }
}

// Ejecutar tests
if (require.main === module) {
  const tester = new ChatbotTester()
  
  tester.runAllTests()
    .then(report => {
      console.log('\n✅ Tests completados')
      process.exit(report.summary.failed === 0 ? 0 : 1)
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error)
      process.exit(1)
    })
}

module.exports = ChatbotTester

