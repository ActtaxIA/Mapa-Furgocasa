# 🔍 Guía Completa: Google Search Console para Mapa Furgocasa

## 📋 Índice
1. [¿Qué es Google Search Console?](#qué-es-google-search-console)
2. [Configuración Inicial](#configuración-inicial)
3. [Verificar Propiedad del Sitio](#verificar-propiedad-del-sitio)
4. [Enviar Sitemap](#enviar-sitemap)
5. [Solicitar Indexación](#solicitar-indexación)
6. [Configuraciones Recomendadas](#configuraciones-recomendadas)
7. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 🎯 ¿Qué es Google Search Console?

Google Search Console es una herramienta **GRATUITA** de Google que te permite:
- ✅ Decirle a Google qué páginas indexar
- ✅ Ver cómo Google ve tu sitio
- ✅ Monitorear el rendimiento en búsquedas
- ✅ Detectar errores de indexación
- ✅ Ver qué búsquedas llevan tráfico a tu sitio

**Es ESENCIAL para SEO** y debe configurarse INMEDIATAMENTE después del deploy.

---

## 🚀 Configuración Inicial

### Paso 1: Acceder a Google Search Console

1. Ve a: **https://search.google.com/search-console**
2. Inicia sesión con tu cuenta de Google (usa la cuenta de Furgocasa)
3. Haz clic en **"Añadir propiedad"** o **"Add Property"**

### Paso 2: Elegir Tipo de Propiedad

Tienes dos opciones:

#### ✅ OPCIÓN RECOMENDADA: Propiedad de Dominio
```
mapafurgocasa.com
```
**Ventajas:**
- Incluye automáticamente: www, https, http, subdominios
- Más completo y profesional
- Solo necesitas configurar una vez

**Verificación:** Requiere añadir un registro TXT en tu DNS

#### Alternativa: Propiedad de Prefijo URL
```
https://www.mapafurgocasa.com
```
**Ventajas:**
- Más fácil de verificar
- No requiere acceso al DNS

**Desventaja:**
- Solo verifica ese prefijo exacto

---

## ✅ Verificar Propiedad del Sitio

### Método 1: Verificación por DNS (RECOMENDADO)

1. **En Google Search Console:**
   - Selecciona "Propiedad de dominio"
   - Ingresa: `mapafurgocasa.com`
   - Google te dará un código TXT como:
   ```
   google-site-verification=ABC123XYZ456...
   ```

2. **En tu Proveedor de DNS** (donde compraste el dominio):
   - Ve a configuración de DNS
   - Añade un registro TXT:
     - **Tipo:** TXT
     - **Nombre/Host:** @ o dejar vacío
     - **Valor:** El código que te dio Google
     - **TTL:** 3600 (o el mínimo disponible)

3. **De vuelta en Google Search Console:**
   - Espera 5-10 minutos (propagación DNS)
   - Haz clic en **"Verificar"**
   - ✅ ¡Listo! Ya está verificado

### Método 2: Verificación por HTML (Alternativa)

1. Google te dará un archivo HTML como: `google1234567890abcdef.html`

2. **Coloca el archivo en tu proyecto:**
   ```
   /public/google1234567890abcdef.html
   ```

3. **Verifica que sea accesible:**
   ```
   https://www.mapafurgocasa.com/google1234567890abcdef.html
   ```

4. Haz clic en **"Verificar"** en Google Search Console

### Método 3: Verificación por Meta Tag

1. Google te dará un meta tag como:
   ```html
   <meta name="google-site-verification" content="ABC123..." />
   ```

2. **Añádelo en `app/layout.tsx`:**
   ```typescript
   export const metadata: Metadata = {
     // ... otras metadata
     verification: {
       google: 'ABC123...',
     },
   };
   ```

3. Deploy y verifica en Google Search Console

---

## 📤 Enviar Sitemap

### Paso 1: Verificar que el Sitemap Funciona

Antes de enviarlo a Google, verifica que funciona:

1. **Accede a tu sitemap:**
   ```
   https://www.mapafurgocasa.com/sitemap.xml
   ```

2. **Deberías ver:**
   - XML bien formateado
   - Lista de todas tus páginas
   - Fechas de última modificación
   - Prioridades

3. **Si ves un error o HTML en lugar de XML:**
   - Verifica que `app/sitemap.ts` exista
   - Verifica las variables de entorno de Supabase
   - Revisa los logs de AWS Amplify

### Paso 2: Enviar el Sitemap a Google

1. **En Google Search Console:**
   - Ve a la sección **"Sitemaps"** en el menú lateral
   - Haz clic en **"Añadir un nuevo sitemap"**

2. **Introduce SOLO el nombre del archivo:**
   ```
   sitemap.xml
   ```
   ⚠️ **NO pongas la URL completa**, solo: `sitemap.xml`

3. **Haz clic en "Enviar"**

4. **Espera 24-48 horas:**
   - Google procesará el sitemap
   - Verás el estado cambiar a: "Correcto" ✅
   - Verás el número de URLs descubiertas (debería ser ~610+)

### Paso 3: Verificar el Estado del Sitemap

Después de 24-48 horas:

```
Estado: Correcto ✅
URLs enviadas: ~610
URLs indexadas: (irá aumentando gradualmente)
```

**Si ves errores:**
- Verifica que el sitemap sea accesible
- Revisa que el XML esté bien formado
- Comprueba que no haya errores 404 en las URLs

---

## 🔍 Solicitar Indexación

Google indexará tu sitio automáticamente, pero puedes acelerar el proceso:

### Indexación de Páginas Principales

1. **En Google Search Console:**
   - Ve a **"Inspección de URLs"** (arriba)
   - Introduce cada URL importante:

2. **URLs a solicitar primero:**
   ```
   https://www.mapafurgocasa.com/
   https://www.mapafurgocasa.com/mapa
   https://www.mapafurgocasa.com/ruta
   ```

3. **Para cada URL:**
   - Pega la URL
   - Haz clic en "Enter"
   - Si dice "La URL no está en Google":
     - Haz clic en **"Solicitar indexación"**
     - Espera 1-2 minutos (Google rastrea la página)
     - ✅ Confirmación: "Solicitud de indexación enviada"

### Indexación de Áreas (Opcional)

Puedes solicitar indexación de áreas específicas importantes:

```
https://www.mapafurgocasa.com/area/area-autocaravanas-murcia
https://www.mapafurgocasa.com/area/area-autocaravanas-barcelona
https://www.mapafurgocasa.com/area/area-autocaravanas-valencia
```

**Nota:** No necesitas hacer esto para todas las áreas. Google las descubrirá automáticamente a través del sitemap y del mapa principal.

---

## ⚙️ Configuraciones Recomendadas

### 1. Configurar País de Segmentación

1. Ve a **"Configuración"** → **"Segmentación internacional"**
2. Selecciona **"España"** como país de destino
3. Idioma: **"es"** (español)

### 2. Rastreo de Parámetros de URL

1. Ve a **"Configuración"** → **"Rastreo"**
2. **Parámetros de URL a ignorar:**
   - `utm_source`
   - `utm_medium`
   - `utm_campaign`
   - `fbclid`
   - `gclid`

Esto evita que Google indexe la misma página múltiples veces con diferentes parámetros de seguimiento.

### 3. Frecuencia de Rastreo

- Google ajustará automáticamente la frecuencia
- Si tu sitio es nuevo, será lento al principio
- A medida que añadas contenido y obtengas enlaces, aumentará

---

## 📊 Monitoreo y Mantenimiento

### Qué Revisar Semanalmente

#### 1. Cobertura de Indexación
```
Secciones → Cobertura → Ver detalles
```
**Verifica:**
- ✅ URLs válidas indexadas (debe aumentar)
- ⚠️ Errores 404
- ⚠️ Errores de servidor (500)
- ⚠️ URLs excluidas

#### 2. Rendimiento
```
Secciones → Rendimiento
```
**Métricas importantes:**
- **Clics:** Visitas desde Google
- **Impresiones:** Veces que apareció tu sitio
- **CTR:** % de impresiones que resultaron en clic
- **Posición media:** Posición promedio en resultados

**Consultas importantes a monitorear:**
- "area autocaravanas [ciudad]"
- "pernocta autocaravanas [ciudad]"
- "camping autocaravanas [ciudad]"
- "parking autocaravanas [ciudad]"

#### 3. Experiencia
```
Secciones → Experiencia
```
- **Core Web Vitals:** Velocidad y UX
- **Usabilidad móvil:** Errores en móvil
- **HTTPS:** Seguridad

### Qué Revisar Mensualmente

1. **Sitemaps:**
   - Verifica que no haya errores
   - Comprueba que las URLs aumenten si añades áreas

2. **Enlaces:**
   - Revisa qué sitios enlazan al tuyo
   - Identifica oportunidades de link building

3. **Consultas de búsqueda:**
   - Identifica búsquedas con muchas impresiones pero pocos clics
   - Optimiza títulos y descripciones para mejorar CTR

---

## 🎯 Objetivos de SEO para Mapa Furgocasa

### Mes 1-2 (Indexación)
- ✅ Todas las páginas indexadas (610+ URLs)
- ✅ Sin errores en Search Console
- ✅ Aparición en búsquedas de marca: "mapa furgocasa"

### Mes 3-6 (Posicionamiento Local)
- 🎯 Top 10 para "area autocaravanas [ciudad principal]"
- 🎯 Aumentar tráfico orgánico a 100+ visitas/mes
- 🎯 CTR > 2% en búsquedas principales

### Mes 6-12 (Consolidación)
- 🎯 Top 5 para búsquedas locales
- 🎯 Tráfico orgánico > 500 visitas/mes
- 🎯 Aparición en featured snippets de Google

---

## 📝 Checklist de Configuración

Usa esta lista para verificar que todo está configurado:

### Antes del Deploy
- [ ] `app/sitemap.ts` creado
- [ ] `app/robots.ts` creado
- [ ] Metadata optimizada en páginas principales
- [ ] URLs canónicas configuradas
- [ ] Open Graph tags añadidos

### Después del Deploy
- [ ] Sitemap accesible: `https://www.mapafurgocasa.com/sitemap.xml`
- [ ] Robots.txt accesible: `https://www.mapafurgocasa.com/robots.txt`
- [ ] Sitemap contiene ~610+ URLs
- [ ] Sin errores 404 en páginas principales

### En Google Search Console
- [ ] Propiedad verificada
- [ ] Sitemap enviado
- [ ] Indexación solicitada para homepage
- [ ] Indexación solicitada para /mapa
- [ ] Indexación solicitada para /ruta
- [ ] País de segmentación: España
- [ ] Sin errores de cobertura críticos

### Monitoreo Configurado
- [ ] Google Analytics conectado (si aplica)
- [ ] Alertas de errores activadas
- [ ] Revisión semanal agendada

---

## 🆘 Problemas Comunes y Soluciones

### Problema: "La URL no está indexada"
**Solución:**
- Normal para sitios nuevos
- Espera 1-2 semanas después de solicitar indexación
- Google rastrea sitios nuevos más lentamente

### Problema: "Sitemap no se puede leer"
**Solución:**
```bash
# Verifica el sitemap localmente
curl https://www.mapafurgocasa.com/sitemap.xml

# Debe devolver XML, no HTML
```
- Si devuelve HTML, hay un error en `app/sitemap.ts`
- Verifica los logs de AWS Amplify

### Problema: "URLs bloqueadas por robots.txt"
**Solución:**
- Verifica `app/robots.ts`
- Asegúrate de que no bloquea rutas públicas
- Solo deben estar bloqueadas: `/admin`, `/api`, `/perfil`

### Problema: "Errores 404 en sitemap"
**Solución:**
- Verifica que las URLs en el sitemap existan
- Comprueba que las áreas en Supabase tengan `activo = true`
- Verifica que los slugs sean correctos

---

## 🔗 Recursos Adicionales

- **Google Search Console:** https://search.google.com/search-console
- **Documentación oficial:** https://support.google.com/webmasters
- **SEO del proyecto:** [CONFIGURACION_SEO.md](./CONFIGURACION_SEO.md)
- **Guía de deployment:** [GUIA_DEPLOYMENT_AWS.md](./GUIA_DEPLOYMENT_AWS.md)

---

## 📅 Última Actualización

**Fecha:** 28 de octubre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Vigente

---

**¿Necesitas ayuda?** Consulta [CONFIGURACION_SEO.md](./CONFIGURACION_SEO.md) para más detalles técnicos sobre el sitemap y robots.txt.

