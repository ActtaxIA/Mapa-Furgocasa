# 🚨 PROBLEMA CRÍTICO #1: Exposición de Stack Traces

## 🎯 ¿Qué está pasando?

Actualmente, cuando el chatbot tiene un error, **expone información sensible** en la respuesta:

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO VE ESTO:                         │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "error": "Error interno del servidor",                    │
│   "stack": "Error: ...\n                                    │
│       at POST (/app/api/chatbot/route.ts:687:5)\n          │
│       at async /node_modules/next/dist/...\n               │
│       at async eval (webpack-internal:///...)",            │
│   "fullError": "Error: Cannot read property 'id' of null"  │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ ¿Por qué es peligroso?

### 1. Expone rutas del servidor
```typescript
at POST (/app/api/chatbot/route.ts:687:5)
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      Un atacante sabe:
      - Estructura de carpetas
      - Nombres de archivos
      - Números de línea exactos
```

### 2. Expone tecnologías usadas
```typescript
at async /node_modules/next/dist/...
         ^^^^^^^^^^^^^^^^^^^^
         Sabe que usas:
         - Next.js
         - Versión específica
         - Dependencias
```

### 3. Revela errores internos
```typescript
"fullError": "Cannot read property 'id' of null"
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              Un atacante puede:
              - Enviar payloads sin 'id'
              - Explotar el null reference
              - Encontrar más vulnerabilidades
```

## 🎭 Escenario de Ataque Real

```
ATACANTE:
1. Envía mensaje malformado → Recibe stack trace completo
2. Analiza código desde stack trace
3. Identifica vulnerabilidades (ej: falta validación de 'id')
4. Envía payload específico explotando la vulnerabilidad
5. Acceso no autorizado / Fuga de datos / DDoS

COSTO ESTIMADO:
- Incident response: $5,000-$10,000
- Data breach (si hay): $50,000-$500,000
- Reputación: Incalculable
```

## 🛠️ Solución (5 minutos)

### Archivo: `app/api/chatbot/route.ts`

**LÍNEA 714-722: BUSCAR Y REEMPLAZAR**

```typescript
// ==========================================
// ❌ CÓDIGO ACTUAL (ELIMINAR)
// ==========================================
return NextResponse.json({
  error: 'Error interno del servidor',
  details: error.message || 'Error desconocido',
  errorName: error.name,
  errorCode: error.code,
  stack: error.stack, // 🔴 ELIMINAR ESTA LÍNEA
  fullError: String(error) // 🔴 ELIMINAR ESTA LÍNEA
}, { status: 500 })

// ==========================================
// ✅ CÓDIGO NUEVO (COPIAR Y PEGAR)
// ==========================================
return NextResponse.json({
  error: 'Error interno del servidor',
  message: 'Estamos trabajando en solucionarlo. Por favor, inténtalo de nuevo en unos momentos.',
  support: 'Si el problema persiste, contacta con soporte@mapafurgocasa.com',
  timestamp: new Date().toISOString(),
  // Solo en desarrollo: mostrar detalles
  ...(process.env.NODE_ENV === 'development' && {
    debug: {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    }
  })
}, { status: 500 })
```

## ✅ Resultado

### Antes (PELIGROSO):
```json
{
  "error": "Error interno del servidor",
  "stack": "Error: ...\n    at POST (/app/api/chatbot/route.ts:687:5)",
  "fullError": "Error: Cannot read property 'id' of null"
}
```
👆 **Atacante tiene toda la información**

### Después (SEGURO):
```json
{
  "error": "Error interno del servidor",
  "message": "Estamos trabajando en solucionarlo. Por favor, inténtalo de nuevo en unos momentos.",
  "support": "Si el problema persiste, contacta con soporte@mapafurgocasa.com",
  "timestamp": "2025-11-04T10:30:00.000Z"
}
```
👆 **Usuario recibe mensaje útil, atacante no obtiene nada**

### En desarrollo (local):
```json
{
  "error": "Error interno del servidor",
  "message": "Estamos trabajando...",
  "support": "Si el problema persiste...",
  "timestamp": "2025-11-04T10:30:00.000Z",
  "debug": {
    "message": "Cannot read property 'id' of null",
    "name": "TypeError",
    "code": "ERR_INVALID_ARG_TYPE",
    "stack": "Error: ...\n    at POST (/app/api/chatbot/route.ts:687:5)"
  }
}
```
👆 **Tú ves detalles completos para debugging**

## 📝 Checklist de Verificación

Después de hacer el cambio:

- [ ] Buscar TODAS las ocurrencias de `error.stack` en el código
- [ ] Verificar que NO hay `stack` en respuestas JSON
- [ ] Verificar que NO hay `fullError` en respuestas JSON
- [ ] Probar en local: `NODE_ENV=development` → Sí debe mostrar debug
- [ ] Probar en producción: `NODE_ENV=production` → NO debe mostrar debug
- [ ] Commit: `git commit -m "fix: remove sensitive error details from production responses"`
- [ ] Deploy inmediato

## 🔍 Verificación Post-Deploy

```bash
# En la consola del navegador (F12)
fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [] }) // Mensaje inválido a propósito
})
.then(r => r.json())
.then(console.log)

# ✅ DEBE ver:
# {
#   error: "Se requiere al menos un mensaje",
#   ...
# }

# ❌ NO DEBE ver:
# stack: "Error: ..."
# fullError: "..."
```

## 🎯 Prioridad

```
╔════════════════════════════════════════════════════════════╗
║  🚨 URGENCIA: CRÍTICA                                      ║
║  ⏱️  TIEMPO: 5 minutos                                     ║
║  💰 COSTO SI NO SE ARREGLA: $50K-$500K (data breach)      ║
║  ✅ DIFICULTAD: Muy fácil (copy-paste)                     ║
╚════════════════════════════════════════════════════════════╝
```

## 📞 Siguiente Paso

**HACER AHORA:**
1. Abrir `app/api/chatbot/route.ts`
2. Ir a línea 714
3. Copiar el "Código Nuevo" de arriba
4. Pegar (reemplazar el código actual)
5. Guardar
6. Commit y push
7. Deploy

**VERIFICAR:**
- [ ] En producción, probar endpoint con error
- [ ] Confirmar que NO se ve `stack` en la respuesta
- [ ] Confirmar que SÍ se ve mensaje amigable

---

## 🔒 Contexto de Seguridad

Este tipo de vulnerabilidad está listada en:
- **OWASP Top 10**: A09:2021 – Security Logging and Monitoring Failures
- **CWE-209**: Generation of Error Message Containing Sensitive Information

**Severidad:** ALTA  
**CVSS Score:** 7.5/10 (High)

**Referencias:**
- https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/
- https://cwe.mitre.org/data/definitions/209.html

---

**ACCIÓN REQUERIDA:** 🔴 INMEDIATA (hoy)

