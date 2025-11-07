# PASOS PARA ARREGLAR AWS AMPLIFY

> ⚠️ **NOTA:** Este documento es de referencia histórica para solución de problemas.
> La aplicación está actualmente en **PRODUCCIÓN** y funcionando correctamente.

## El Problema (RESUELTO)
Las APIs devuelven HTML en lugar de JSON → Error 500

## Solución

### 1. Verificar en AWS Amplify Console

Ve a: **AWS Amplify Console > Tu App > Build Settings**

Verifica que tenga:
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
```

### 2. Verificar Platform en App Settings

Ve a: **App Settings > General**

Debe decir:
- **Platform:** Next.js - SSR
- **Next.js version:** 14.x

Si dice "Web" o "Next.js - Static", **CÁMBIALO a "Next.js - SSR"**

### 3. Redesplegar

Después de cambiar a SSR:
- Ve a la rama `main`
- Click en **"Redeploy this version"**
- Espera 3-5 minutos

### 4. Verificar que funcione

Después del deploy, prueba:
```
https://mapafurgocasa.com/api/admin/ia-config
```

Debe devolver JSON, no HTML.

## Si Sigue Fallando

Posible causa: Next.js 14 + App Router no es compatible con Amplify Hosting Gen 1.

**Solución:** Migrar a **Amplify Hosting Gen 2** o usar **Vercel**

