# 🚀 Guía Completa de Deployment en AWS Amplify

**Estado:** ✅ PRODUCCIÓN ACTIVA EN AWS AMPLIFY  
**Última actualización:** 7 de noviembre de 2025

> ⚠️ **IMPORTANTE:** Esta aplicación está en PRODUCCIÓN en AWS Amplify.
> NO hay servidor de desarrollo local. Todos los cambios se despliegan automáticamente al hacer push a `main`.

---

## 📋 Información del Deployment

### URLs de Producción
- **Dominio principal:** https://www.mapafurgocasa.com
- **Dominio Amplify:** https://main.d1wbtrilaad2yt.amplifyapp.com

### Configuración de la Aplicación
- **Plataforma:** Next.js 14 - SSR (Server Side Rendering)
- **Branch:** `main`
- **Deploy automático:** ✅ Activado en cada push a main

---

## ⚙️ Variables de Entorno en AWS Amplify

### Variables Públicas (Disponibles en el cliente)
```env
NEXT_PUBLIC_SUPABASE_URL=https://dkqnemjcmcnyhuvstosf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBZv6d0szzbRUH7qmw0GGDI384CC5fPJgI
NEXT_PUBLIC_OPENAI_API_KEY_ADMIN=sk-proj-...
NEXT_PUBLIC_SERPAPI_KEY_ADMIN=c35780c...
```

### Variables Privadas (Solo servidor)
```env
SERPAPI_KEY=c35780c715f23ed8718c6cb9fca5f74a98ba20b5eb97f88988102181ba1230b9
OPENAI_API_KEY=sk-proj-... (backup, las funciones IA usan la pública)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cómo Añadir Variables
1. Ve a **AWS Amplify Console**
2. Selecciona tu aplicación
3. **App settings** → **Environment variables**
4. Click en **"Manage variables"**
5. Añade las variables necesarias
6. **Guarda** - Amplify redesplegará automáticamente

---

## 🔧 Configuración de Build (amplify.yml)

El proyecto usa este archivo de configuración:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**Ubicación:** `amplify.yml` en la raíz del proyecto

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: APIs Devuelven HTML en Lugar de JSON

**Síntoma:**
```
Error 500
Las APIs en /api/* devuelven HTML
```

**Causa:** Plataforma configurada incorrectamente

**Solución:**
1. Ve a **App Settings** → **General**
2. Verifica que **Platform** sea: **Next.js - SSR**
3. Si dice "Web" o "Next.js - Static", cámbialo a "Next.js - SSR"
4. Redesplega

**Archivo relacionado:** [PASOS_ARREGLAR_AWS.md](./PASOS_ARREGLAR_AWS.md)

---

### Problema 2: Variables de Entorno No Funcionan

**Síntoma:**
```
Las funciones de IA fallan
Error: "OPENAI_API_KEY no configurada"
```

**Causa:** Variables no configuradas en Amplify

**Solución:**
1. Verifica que las variables estén en **Environment variables**
2. Asegúrate de que las variables públicas tengan el prefijo `NEXT_PUBLIC_`
3. Redesplega después de añadir variables
4. Espera 3-5 minutos para que se apliquen

**Archivo relacionado:** [FIX_IA_PRODUCCION.md](./FIX_IA_PRODUCCION.md)

---

### Problema 3: Error de TypeScript en el Build

**Síntoma:**
```
Type error: 'valoraciones' is possibly 'null'
Type error: 'galeria_fotos' no existe
```

**Causa:** Errores de tipos en el código

**Solución:**
1. Revisa los **logs del build** en Amplify
2. Identifica el archivo y línea del error
3. Corrige el error localmente
4. Verifica con `npm run build`
5. Haz commit y push

**Archivos relacionados:**
- [AWS_DEPLOYMENT_FIX.md](./AWS_DEPLOYMENT_FIX.md)
- [AWS_DEPLOYMENT_PROGRESS.md](./AWS_DEPLOYMENT_PROGRESS.md)

---

### Problema 4: OAuth Redirige a Localhost

**Síntoma:**
```
Después del login con Google, redirige a localhost en lugar de producción
```

**Causa:** Lógica condicional de localhost en el código

**Solución:**
Ya está solucionado. El código actual SIEMPRE redirige a producción.

**Archivo relacionado:** [OAUTH_GOOGLE_SOLUCION_FINAL.md](./OAUTH_GOOGLE_SOLUCION_FINAL.md)

---

## 📊 Flujo de Deployment

### Deployment Automático

```mermaid
graph LR
    A[Git Push] --> B[GitHub]
    B --> C[AWS Amplify detecta cambios]
    C --> D[Clona repositorio]
    D --> E[npm ci]
    E --> F[npm run build]
    F --> G{Build exitoso?}
    G -->|Sí| H[Deploy a CDN]
    G -->|No| I[Notificar error]
    H --> J[Disponible en producción]
```

### Pasos del Build
1. **Provisión** - AWS crea el entorno
2. **Build** - Ejecuta `npm ci` y `npm run build`
3. **Deploy** - Sube archivos al CDN
4. **Verify** - Verifica que todo funcione

**Tiempo estimado:** 3-5 minutos

---

## ✅ Checklist de Deployment

Antes de hacer deploy a producción:

### Código
- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin errores críticos
- [ ] Probado localmente todas las funcionalidades
- [ ] Commits descriptivos con emojis

### Base de Datos
- [ ] Scripts SQL ejecutados en Supabase producción
- [ ] RLS policies actualizadas
- [ ] Migraciones aplicadas

### Variables de Entorno
- [ ] Todas las `NEXT_PUBLIC_*` configuradas en Amplify
- [ ] Variables privadas configuradas
- [ ] API Keys válidas y no caducadas

### Google Cloud
- [ ] URLs de producción en "Authorized redirect URIs"
- [ ] APIs habilitadas (Maps, Places, Directions)
- [ ] Cuotas verificadas

### Supabase
- [ ] URLs de producción en "Redirect URLs"
- [ ] Site URL configurada
- [ ] OAuth providers configurados

---

## 🔍 Verificación Post-Deployment

### 1. Funcionalidad Básica
```bash
✅ https://www.mapafurgocasa.com carga correctamente
✅ /mapa muestra el mapa con áreas
✅ /auth/login funciona
✅ OAuth Google funciona y redirige bien
```

### 2. Panel de Administración
```bash
✅ /admin carga (solo admin)
✅ /admin/areas lista áreas
✅ /admin/configuracion carga
✅ Funciones de IA funcionan
```

### 3. APIs
```bash
✅ /api/admin/ia-config devuelve JSON (no HTML)
✅ /api/admin/check-config devuelve estado de APIs
```

### 4. Base de Datos
```bash
✅ Supabase conecta correctamente
✅ RLS policies permiten las operaciones necesarias
✅ Autenticación funciona
```

---

## 📝 Logs y Debugging

### Ver Logs en AWS Amplify
1. Ve a tu aplicación en Amplify
2. Click en el último build
3. Revisa cada fase:
   - **Provision** - Setup del entorno
   - **Build** - Logs de npm y build
   - **Deploy** - Subida de archivos
   - **Verify** - Verificación final

### Logs Comunes de Error

#### Error: "Module not found"
```
ERROR: Cannot find module 'xxxxx'
```
**Solución:** Añade la dependencia a `package.json` y haz commit

#### Error: "Type error"
```
Type error: Type 'X' is not assignable to type 'Y'
```
**Solución:** Corrige el error de TypeScript localmente

#### Error: "Variables de entorno undefined"
```
ReferenceError: process is not defined
o
TypeError: Cannot read property 'NEXT_PUBLIC_...' of undefined
```
**Solución:** Añade las variables en Amplify Environment variables

---

## 🚀 Redeploy Manual

Si necesitas redesplegar sin hacer cambios en Git:

1. Ve a AWS Amplify Console
2. Selecciona tu app
3. Ve al branch `main`
4. Click en **"Redeploy this version"**
5. Espera 3-5 minutos

**Cuándo usarlo:**
- Después de cambiar variables de entorno
- Después de cambiar configuración de Amplify
- Para aplicar cambios de plataforma

---

## 📞 Soporte y Recursos

### Documentación Oficial
- [AWS Amplify Docs](https://docs.amplify.aws/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Deployment](https://supabase.com/docs/guides/platform/deploy)

### Documentación Interna
- [README.md](./README.md) - Visión general del proyecto
- [INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md) - Índice de toda la documentación
- [FIX_IA_PRODUCCION.md](./FIX_IA_PRODUCCION.md) - Solución de variables de entorno
- [PASOS_ARREGLAR_AWS.md](./PASOS_ARREGLAR_AWS.md) - APIs devuelven HTML
- [OAUTH_GOOGLE_SOLUCION_FINAL.md](./OAUTH_GOOGLE_SOLUCION_FINAL.md) - OAuth redirect

---

## 🎯 Mejores Prácticas

### Antes de Deploy
1. **Prueba localmente** con `npm run build`
2. **Revisa el CHANGELOG.md** para documentar cambios
3. **Actualiza versión** si es un release
4. **Commit descriptivo** con emoji relevante

### Durante Deploy
1. **Monitorea el build** en tiempo real
2. **Revisa los logs** si falla
3. **No hagas múltiples push** mientras está desplegando

### Después de Deploy
1. **Verifica funcionalidad básica** en producción
2. **Prueba funciones críticas** (login, admin, IA)
3. **Revisa logs de errores** en Supabase y AWS
4. **Notifica** si hay cambios importantes para usuarios

---

## 📊 Historial de Deploys Importantes

### Deploy: Migración IA a Cliente (28 Oct 2025)
- **Cambio:** Funciones de IA ejecutadas en cliente
- **Motivo:** Variables de entorno no disponibles en servidor
- **Commits:** `feat: Migrar funciones de IA de admin al cliente`
- **Resultado:** ✅ Exitoso

### Deploy: Fix OAuth Redirect (28 Oct 2025)
- **Cambio:** Eliminada lógica de localhost
- **Motivo:** OAuth redirigía a localhost en producción
- **Commits:** `fix: Eliminar referencias a localhost en OAuth`
- **Resultado:** ✅ Exitoso

### Deploy: Fix TypeScript Errors (28 Oct 2025)
- **Cambio:** Corregidos errores de tipos
- **Motivo:** Build fallaba en AWS
- **Commits:** `fix: TypeScript error en perfil y cambio de galeria_fotos a fotos_urls`
- **Resultado:** ✅ Exitoso

---

## ✅ Estado Actual

**Último deploy exitoso:** 28 de octubre de 2025  
**Versión:** BETA 1.0  
**Platform:** Next.js - SSR  
**Build time:** ~4 minutos  
**Status:** 🟢 Funcionando correctamente

**Funcionalidades operativas:**
- ✅ Mapa interactivo
- ✅ Autenticación (email + OAuth Google)
- ✅ Panel de administración
- ✅ Funciones de IA (desde cliente)
- ✅ Planificador de rutas
- ✅ Dashboard de perfil
- ✅ Sistema de valoraciones y visitas

---

**¿Necesitas ayuda con el deployment?**  
Consulta [INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md) para encontrar documentación específica por tema.


