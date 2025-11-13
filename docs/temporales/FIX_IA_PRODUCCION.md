# 🔧 SOLUCIÓN: Funciones de IA Rotas en Producción

## 📋 PROBLEMA IDENTIFICADO

Las funciones de IA funcionaban antes del deploy pero ahora fallan en producción:

1. **❌ Enriquecer Imágenes** - Error: "nombre no encontrado"
2. **❌ Configuración de IA** - Error 500 al cargar `/admin/configuracion`
3. **❌ Enriquecer Textos** - Probablemente falla también
4. **❌ Actualizar Servicios** - Probablemente falla también

### Causa Raíz

Las **variables de entorno** NO están configuradas en AWS Amplify. Las APIs necesitan:
- `OPENAI_API_KEY` - Para llamadas a OpenAI GPT
- `SERPAPI_KEY` - Para búsquedas web de imágenes y textos
- `NEXT_PUBLIC_SUPABASE_URL` - URL de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave pública de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave secreta de Supabase

---

## ✅ SOLUCIÓN: Añadir Variables de Entorno en AWS Amplify

### Paso 1: Acceder a Variables de Entorno

Ya tienes abierta la pestaña de AWS Amplify. Debes ir a:

```
AWS Amplify Console
→ Tu aplicación "Mapa-Furgocasa"
→ Menú lateral: "Alojamiento" > "Variables de entorno"
→ Botón "Administrar las variables"
```

### Paso 2: Añadir las Variables

Añade TODAS estas variables (copia desde tu `.env.local`):

| Variable | Valor | Nota |
|----------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dkqnemjcmqyhuvstosf.supabase.co` | ✅ Ya configurada |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | ✅ Ya configurada |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...Y6wc` | ⚠️ Verificar si está |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSyB...` | ✅ Ya configurada |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | `AIzaSyB...` | ⚠️ Verificar si está |
| `OPENAI_API_KEY` | `sk-proj-9b8...` | ❌ FALTA - Crítico para IA |
| `SERPAPI_KEY` | `c5578b...` | ❌ FALTA - Crítico para búsquedas |

### Paso 3: Guardar y Redesplegar

1. **Guardar las variables** en AWS Amplify
2. **NO es necesario hacer commit** en Git
3. AWS Amplify automáticamente **redesplegará la app**
4. Espera 3-5 minutos a que termine el build

---

## 🔍 VERIFICACIÓN

### Errores Específicos que se Solucionarán

#### 1. Error en `/admin/configuracion`
**Antes:**
```
Failed to load resource: the server responded with a status of 500
Error cargando configuración: SyntaxError: Unexpected token '<'
```

**Después:**
✅ La página cargará correctamente con los prompts configurables

#### 2. Error en Enriquecer Imágenes
**Antes:**
```
Buscando 39 áreas...
❌ nombre no encontrado (repetido)
```

**Después:**
✅ Buscará imágenes correctamente en Google Images y Park4night

#### 3. Código de Validación en las APIs

Todas las APIs tienen validación de API keys:

**`/api/admin/scrape-images/route.ts`** (línea 16):
```typescript
if (!process.env.SERPAPI_KEY) {
  return NextResponse.json({
    error: 'SERPAPI_KEY no configurada',
    errorType: 'CONFIG_ERROR'
  }, { status: 500 })
}
```

**`/api/admin/enrich-description/route.ts`** (líneas 25-41):
```typescript
if (!process.env.OPENAI_API_KEY) {
  return NextResponse.json({
    error: 'OPENAI_API_KEY no configurada',
    errorType: 'CONFIG_ERROR'
  }, { status: 500 })
}

if (!process.env.SERPAPI_KEY) {
  return NextResponse.json({
    error: 'SERPAPI_KEY no configurada',
    errorType: 'CONFIG_ERROR'
  }, { status: 500 })
}
```

**`/api/admin/scrape-services/route.ts`** (líneas 32-46):
```typescript
if (!process.env.OPENAI_API_KEY) {
  return NextResponse.json({
    error: 'OPENAI_API_KEY no configurada',
    errorType: 'CONFIG_ERROR'
  }, { status: 500 })
}

if (!process.env.SERPAPI_KEY) {
  return NextResponse.json({
    error: 'SERPAPI_KEY no configurada',
    errorType: 'CONFIG_ERROR'
  }, { status: 500 })
}
```

---

## 🎯 RESUMEN DE ACCIÓN INMEDIATA

### Variables CRÍTICAS que DEBES añadir en AWS Amplify:

```env
OPENAI_API_KEY=sk-proj-XXXXXXXXXX (tu clave de OpenAI)

SERPAPI_KEY=XXXXXXXXXX (tu clave de SerpAPI)
```

**Copia estas claves desde tu `.env.local` local**

### Variables que probablemente ya tienes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dkqnemjcmqyhuvstosf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...Y6wc
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBzb6d0zz8D0zUHT4qmwGsGD184ZCSfJgJ
```

---

## ⚠️ IMPORTANTE: Seguridad

- **NUNCA subas estas claves a Git**
- Las variables en AWS Amplify están **encriptadas y seguras**
- AWS Amplify las inyecta automáticamente durante el build
- El `.env.local` está en `.gitignore` (correcto)

---

## ✅ CHECKLIST

- [ ] Abrir AWS Amplify Console
- [ ] Ir a "Variables de entorno"
- [ ] Añadir `OPENAI_API_KEY`
- [ ] Añadir `SERPAPI_KEY`
- [ ] Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- [ ] Guardar cambios
- [ ] Esperar a que redesplegue (3-5 min)
- [ ] Probar `/admin/configuracion` → Debe cargar
- [ ] Probar "Enriquecer Imágenes" → Debe funcionar
- [ ] Probar "Enriquecer Textos" → Debe funcionar
- [ ] Probar "Actualizar Servicios" → Debe funcionar

---

## 📞 SOPORTE

Si después de añadir las variables sigue fallando:

1. Verifica en los **Logs de AWS Amplify** si hay errores
2. Asegúrate de que las API keys son **válidas** (no caducadas)
3. Verifica que no haya espacios extra al copiar/pegar las claves

---

## 🎉 RESULTADO ESPERADO

Después de configurar las variables:

✅ **Configuración de IA** (`/admin/configuracion`) carga correctamente
✅ **Enriquecer Imágenes** busca y guarda imágenes de Google/Park4night
✅ **Enriquecer Textos** genera descripciones con OpenAI
✅ **Actualizar Servicios** detecta servicios con IA
✅ Todos los agentes funcionan como en local

