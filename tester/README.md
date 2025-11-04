# 🧪 Sistema de Testing Automatizado - Chatbot IA

Sistema completo de testing que simula usuarios reales interactuando con el chatbot, detecta errores automáticamente y genera reportes detallados.

## 🚀 Instalación

```bash
cd tester
npm install
```

## 📋 Uso

### Test completo
```bash
npm test
```

### Test con recarga automática (durante desarrollo)
```bash
npm run test:watch
```

### Test en modo headless (sin ventana del navegador)
```bash
npm run test:headless
```

## 🎯 Qué hace el tester

### 1. Login Automático
- Inicia sesión como admin (info@furgocasa.com)
- Captura screenshots de cada paso
- Detecta errores de autenticación

### 2. Navegación al Chatbot
- Navega al mapa
- Localiza y abre el widget del chatbot
- Verifica que se abre correctamente

### 3. Tests de Mensajes
- **Mensaje simple**: "Hola"
- **Búsqueda**: "Busco áreas en Barcelona"
- **Filtros**: "Quiero áreas gratis"
- **Detalles**: "Dime más sobre la primera"
- **Cierre**: "Gracias"

### 4. Test de API Directo
- Llama directamente al endpoint `/api/chatbot`
- Verifica respuesta y tiempos
- Captura errores de servidor

### 5. Monitoreo de Errores
- **Console logs** del navegador
- **Errores de JavaScript** en la página
- **Respuestas HTTP** fallidas
- **Timeouts** y problemas de red

### 6. Generación de Reportes
- **JSON completo** con todos los datos
- **HTML visual** con gráficos y screenshots
- **Screenshots** de cada paso crítico

## 📊 Reportes

Los reportes se generan automáticamente en:

```
tester/
├── reports/
│   ├── report-[timestamp].json    # Datos completos
│   └── report-[timestamp].html    # Reporte visual
└── screenshots/
    ├── 01-login-page.png
    ├── 02-login-filled.png
    ├── 03-after-login.png
    ├── 04-mapa-page.png
    ├── 05-chatbot-opened.png
    ├── 06-message-typed-[timestamp].png
    └── 07-response-received-[timestamp].png
```

## 🔍 Interpretación de Resultados

### ✅ Test Exitoso
```
═══════════════════════════════════
📊 RESUMEN FINAL
═══════════════════════════════════
Total Tests: 5
✅ Passed: 5
❌ Failed: 0
📈 Success Rate: 100.00%
⏱️  Duration: 45.32s
🐛 Errors: 0
═══════════════════════════════════
```

### ❌ Test Fallido
```
═══════════════════════════════════
📊 RESUMEN FINAL
═══════════════════════════════════
Total Tests: 5
✅ Passed: 2
❌ Failed: 3
📈 Success Rate: 40.00%
⏱️  Duration: 32.18s
🐛 Errors: 3
═══════════════════════════════════

Revisa: tester/reports/report-[timestamp].html
```

## 🐛 Debugging

Si un test falla:

1. **Revisa el reporte HTML** - Tiene screenshots de cada paso
2. **Busca errores en el JSON** - Contiene stack traces completos
3. **Ejecuta en modo visible** - Quita `headless: true` para ver el navegador
4. **Revisa los console logs** - Captura todos los mensajes del navegador

## 🔧 Configuración

Editar `chatbot-tester.js`:

```javascript
class ChatbotTester {
  constructor(config = {}) {
    this.url = config.url || 'https://www.mapafurgocasa.com'
    // ...
  }
}
```

Para probar en local:
```javascript
const tester = new ChatbotTester({
  url: 'http://localhost:3000'
})
```

## 📝 Logs en Tiempo Real

Durante la ejecución verás:

```
ℹ️  [2025-11-04T20:30:00.000Z] Iniciando navegador Chromium...
✅ [2025-11-04T20:30:01.500Z] Navegador iniciado correctamente
🧪 [2025-11-04T20:30:02.000Z] 🔐 Iniciando sesión como admin...
ℹ️  [2025-11-04T20:30:05.200Z] Screenshot guardado: tester/screenshots/01-login-page.png
✅ [2025-11-04T20:30:08.100Z] Login exitoso
🧪 [2025-11-04T20:30:08.500Z] 💬 Abriendo chatbot...
✅ [2025-11-04T20:30:10.200Z] Chatbot abierto
🧪 [2025-11-04T20:30:10.500Z] 📨 Enviando mensaje: "Hola"
⏳ [2025-11-04T20:30:12.000Z] Esperando respuesta del chatbot...
✅ [2025-11-04T20:30:15.300Z] Respuesta recibida: "¡Hola! 👋 Soy el Tío Viajero IA..."
```

## 🎯 Casos de Uso

### Desarrollo Local
```bash
# Probar cambios antes de commit
npm test
```

### CI/CD
```bash
# En GitHub Actions o similar
npm run test:headless
```

### Debugging de Errores
```bash
# Ver navegador en acción
# Editar chatbot-tester.js: headless: false
npm test
```

### Monitoreo Continuo
```bash
# Con nodemon, se reejecutará al cambiar código
npm run test:watch
```

## 🚨 Errores Comunes

### "Navigation timeout"
- El servidor está lento
- Verifica que la URL es correcta
- Aumenta los timeouts en el código

### "Element not found"
- La estructura HTML cambió
- Actualiza los selectores en el código
- Revisa los screenshots para ver qué pasó

### "Login failed"
- Verifica las credenciales
- Comprueba que el servidor está corriendo
- Revisa si hay CAPTCHA o 2FA

## 📈 Próximas Mejoras

- [ ] Tests de rendimiento (medir tiempos de respuesta)
- [ ] Tests de stress (múltiples usuarios simultáneos)
- [ ] Integración con CI/CD (GitHub Actions)
- [ ] Notificaciones (Slack/Email si tests fallan)
- [ ] Tests de regresión (comparar con versiones anteriores)
- [ ] Tests de accesibilidad (WCAG compliance)

## 🤝 Contribuir

Para agregar nuevos tests, edita el método `runAllTests()`:

```javascript
// Test 6: Tu nuevo test
this.results.totalTests++
const myTest = await this.myCustomTest()
if (myTest.success) {
  this.results.passed++
} else {
  this.results.failed++
}
```

---

**Desarrollado para Mapa Furgocasa** 🚐

