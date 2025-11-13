# 🔴 ENTORNO DE PRODUCCIÓN - MAPA FURGOCASA

**Fecha:** 7 de Noviembre, 2025  
**Estado:** ✅ PRODUCCIÓN ACTIVA

---

## ⚠️ IMPORTANTE: NO HAY ENTORNO DE DESARROLLO LOCAL

Esta aplicación **NO tiene servidor de desarrollo local**.

**Todos los cambios van directamente a PRODUCCIÓN** al hacer `git push origin main`.

---

## 🌐 Información de Producción

### URLs
- **Principal:** https://www.mapafurgocasa.com
- **Amplify:** https://main.d1wbtrilaad2yt.amplifyapp.com

### Plataforma
- **Hosting:** AWS Amplify
- **Framework:** Next.js 14 (SSR)
- **Branch principal:** `main`
- **Deploy:** Automático en cada push

---

## 🚀 Flujo de Trabajo

### 1. Hacer Cambios en el Código
```bash
# Editar archivos en el IDE
```

### 2. Commit y Push
```bash
git add <archivos>
git commit -m "Descripción del cambio"
git push origin main
```

### 3. Despliegue Automático
AWS Amplify detecta el push automáticamente y:
1. **Provisión** (30 seg) - Prepara el entorno
2. **Build** (2-3 min) - Ejecuta `npm ci` y `npm run build`
3. **Deploy** (1 min) - Sube archivos al CDN
4. **Verify** (30 seg) - Verifica funcionamiento

**⏱️ Tiempo total: 3-5 minutos**

### 4. Verificar en Producción
```
https://www.mapafurgocasa.com
```

---

## 🔧 Si Necesitas Ver el Estado del Deploy

1. Ve a **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. Selecciona la aplicación **Mapa Furgocasa**
3. Ve a la rama **main**
4. Verás el estado del último deployment

---

## ✅ Checklist Antes de Hacer Push

- [ ] ¿Los cambios están probados mentalmente?
- [ ] ¿El commit tiene un mensaje descriptivo?
- [ ] ¿Sabes qué impacto tendrá en producción?
- [ ] ¿Es un cambio crítico? (Si sí, hazlo con cuidado)

---

## 🆘 Si Algo Sale Mal

### Rollback Rápido
1. Ve a AWS Amplify Console
2. Selecciona un deployment anterior que funcionaba
3. Click en **"Redeploy this version"**
4. Espera 3-5 minutos

### Revertir Commit
```bash
git revert <commit-hash>
git push origin main
```

---

## 📊 Monitoring

### Ver Logs de Producción
- AWS Amplify Console → Build logs
- AWS CloudWatch (si configurado)

### Ver Errores de Usuario
- Supabase Dashboard → Logs
- Google Cloud Console → APIs & Services → Metrics

---

## 🔑 Variables de Entorno

Configuradas en **AWS Amplify Console → Environment variables**:

### Públicas (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_OPENAI_API_KEY_ADMIN`
- `NEXT_PUBLIC_SERPAPI_KEY_ADMIN`

### Privadas
- `SERPAPI_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Para cambiar variables:**
1. AWS Amplify Console → Environment variables
2. Editar/Añadir
3. Guardar (redesplegará automáticamente)

---

## 📝 Notas Importantes

1. **NO ejecutes `npm run dev`** - No hay servidor local
2. **NO uses `localhost:3000`** - Solo existe producción
3. **Cada push despliega automáticamente** - Ten cuidado
4. **Los cambios tardan 3-5 minutos** en estar disponibles
5. **Limpia caché del navegador** después de un deploy (Ctrl+F5)

---

## 📚 Documentación Relacionada

- [GUIA_DEPLOYMENT_AWS.md](./GUIA_DEPLOYMENT_AWS.md) - Guía completa de deployment
- [amplify.yml](./amplify.yml) - Configuración de build
- [README.md](./README.md) - Documentación general

---

**Última actualización:** 7 de Noviembre, 2025

