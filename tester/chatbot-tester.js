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
    const filename = `screenshots/${Date.now()}-${name}.png`
    await this.page.screenshot({ path: filename, fullPage: true })
    this.screenshots.push(filename)
    this.log(`Screenshot guardado: ${filename}`, 'info')
    return filename
  }

  async login() {
    this.log('🔐 Iniciando sesión como admin...', 'test')
    
    try {
      // Ir a la home primero
      await this.page.goto(this.url, { waitUntil: 'networkidle2' })
      
      // Buscar y hacer clic en "Ya tengo cuenta" o "Iniciar sesión"
      const loginLinkClicked = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'))
        const loginLink = links.find(link => 
          link.textContent.includes('Ya tengo cuenta') ||
          link.textContent.includes('Iniciar sesión') ||
          link.textContent.includes('Iniciar Sesión') ||
          link.href.includes('/auth/login')
        )
        if (loginLink) {
          loginLink.click()
          return true
        }
        return false
      })
      
      if (!loginLinkClicked) {
        // Si no encontró el link, ir directo a /auth/login
        await this.page.goto(`${this.url}/auth/login`, { waitUntil: 'networkidle2' })
      } else {
        // Esperar navegación después del click
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
      }
      
      await this.screenshot('01-login-page')
      
      // Esperar formulario de login
      await this.page.waitForSelector('input[type="email"]', { timeout: 10000 })
      
      // Llenar formulario
      await this.page.type('input[type="email"]', this.testUser.email, { delay: 50 })
      await this.page.type('input[type="password"]', this.testUser.password, { delay: 50 })
      
      await this.screenshot('02-login-filled')
      
      // Click en login y esperar respuesta
      const [response] = await Promise.all([
        this.page.waitForResponse(response => 
          response.url().includes('/auth/') && response.request().method() === 'POST',
          { timeout: 10000 }
        ).catch(() => null),
        this.page.click('button[type="submit"]')
      ])
      
      // Esperar un poco
      await this.page.waitForTimeout(3000)
      
      await this.screenshot('03-after-login-attempt')
      
      // Verificar que estamos logueados
      const currentUrl = this.page.url()
      
      // Buscar mensajes de error en la página
      const errorMessage = await this.page.evaluate(() => {
        const errorElements = document.querySelectorAll('[role="alert"], .error, .text-red-600, .text-red-500')
        if (errorElements.length > 0) {
          return Array.from(errorElements).map(el => el.textContent).join('; ')
        }
        return null
      })
      
      if (errorMessage) {
        this.log(`Error de login visible: ${errorMessage}`, 'error')
      }
      
      if (currentUrl.includes('/auth/login')) {
        throw new Error(`Login falló - aún en /auth/login${errorMessage ? ` - ${errorMessage}` : ''}`)
      }
      
      this.log('Login exitoso', 'success')
      return true
      
    } catch (error) {
      this.log(`Error en login: ${error.message}`, 'error')
      this.log('⚠️  Continuando tests sin login (como usuario anónimo)', 'warning')
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
      await this.page.waitForTimeout(2000) // Esperar a que cargue completamente
      await this.screenshot('04-mapa-page')
      
      this.log('Buscando el widget del chatbot (esquina inferior derecha)...', 'info')
      
      // Esperar y buscar el botón flotante del chatbot
      // El chatbot está en la esquina inferior derecha, generalmente con position: fixed
      const chatbotOpened = await this.page.evaluate(() => {
        // Buscar todos los botones, especialmente los que están fixed/absolute
        const allButtons = Array.from(document.querySelectorAll('button, div[role="button"]'))
        
        // Buscar por:
        // 1. Texto que contenga "Tío", "Viajero", "Chat", etc
        // 2. Posición fixed o absolute en la esquina inferior derecha
        // 3. z-index alto (widgets flotantes)
        const chatButton = allButtons.find(btn => {
          const text = btn.textContent || ''
          const style = window.getComputedStyle(btn)
          const parent = btn.parentElement
          const parentStyle = parent ? window.getComputedStyle(parent) : null
          
          // Verificar si es el botón del chat
          const hasKeywords = text.includes('Tío') || 
                             text.includes('Viajero') || 
                             text.includes('Chat') ||
                             text.includes('IA') ||
                             btn.getAttribute('aria-label')?.toLowerCase().includes('chat')
          
          // Verificar si está posicionado como widget flotante (fixed, bottom, right)
          const isFloating = (style.position === 'fixed' || parentStyle?.position === 'fixed') &&
                            (style.bottom !== '' || parentStyle?.bottom !== '') &&
                            (style.right !== '' || parentStyle?.right !== '')
          
          const hasHighZIndex = parseInt(style.zIndex || '0') > 10 || 
                               parseInt(parentStyle?.zIndex || '0') > 10
          
          return (hasKeywords || isFloating || hasHighZIndex)
        })
        
        if (chatButton) {
          console.log('✅ Botón del chatbot encontrado:', chatButton.textContent)
          chatButton.click()
          return true
        }
        
        // Si no encontró, intentar buscar por clases comunes de chatbots
        const chatWidget = document.querySelector('[class*="chatbot"], [class*="chat-widget"], [id*="chatbot"]')
        if (chatWidget) {
          const btnInWidget = chatWidget.querySelector('button')
          if (btnInWidget) {
            console.log('✅ Botón dentro de widget encontrado')
            btnInWidget.click()
            return true
          }
        }
        
        return false
      })
      
      if (!chatbotOpened) {
        this.log('⚠️ No se encontró el botón del chatbot automáticamente', 'warning')
        this.log('Intentando hacer clic en esquina inferior derecha...', 'info')
        
        // Plan B: hacer clic en la esquina inferior derecha donde suelen estar los chatbots
        await this.page.mouse.click(1850, 1000) // Esquina inferior derecha
        await this.page.waitForTimeout(1000)
      }
      
      // Esperar que el chat se abra
      await this.page.waitForTimeout(2000)
      await this.screenshot('05-chatbot-opened')
      
      // Verificar que se abrió buscando el input del chat
      const chatIsOpen = await this.page.evaluate(() => {
        const chatInput = document.querySelector('input[placeholder*="mensaje"], textarea[placeholder*="mensaje"], input[type="text"]')
        return chatInput !== null
      })
      
      if (!chatIsOpen) {
        throw new Error('El chatbot no se abrió - no se encontró el input de mensajes')
      }
      
      this.log('Chatbot abierto correctamente', 'success')
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
    const reportPath = `reports/report-${Date.now()}.json`
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Generar reporte HTML
    const htmlReport = this.generateHTMLReport(report)
    const htmlPath = `reports/report-${Date.now()}.html`
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
    
    // Test 1: Login (opcional - continua sin login si falla)
    this.results.totalTests++
    const loginSuccess = await this.login()
    if (loginSuccess) {
      this.results.passed++
    } else {
      this.results.failed++
      this.log('⚠️  Login falló, continuando con tests del chatbot (puede requerir login)', 'warning')
      // NO abortar - intentar tests de API que no requieren login
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

