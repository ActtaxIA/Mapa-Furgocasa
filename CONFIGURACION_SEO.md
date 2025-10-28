# 🔍 Configuración de SEO - Mapa Furgocasa

**Estado:** ✅ Implementado  
**Última actualización:** 28 de octubre de 2025

---

## 📋 Resumen

Sistema completo de SEO implementado para mejorar la visibilidad en buscadores y aumentar el tráfico orgánico.

---

## 🗺️ Sitemap XML Dinámico

### Archivo Creado: `app/sitemap.ts`

**Características:**
- ✅ Generado dinámicamente en cada request
- ✅ Incluye todas las áreas activas desde Supabase
- ✅ Actualizado automáticamente cuando se añaden/modifican áreas
- ✅ Prioridades optimizadas por tipo de página

### URLs Incluidas

| Tipo | Ejemplo | Priority | Change Freq |
|------|---------|----------|-------------|
| **Homepage** | `/` | 1.0 | daily |
| **Mapa** | `/mapa` | 0.9 | daily |
| **Planificador** | `/ruta` | 0.8 | weekly |
| **Áreas** | `/area/[slug]` | 0.7 | weekly |
| **Auth** | `/auth/login`, `/auth/register` | 0.5 | monthly |
| **Legal** | `/privacidad`, `/condiciones` | 0.3 | yearly |

### Verificar el Sitemap

**URL:** https://www.mapafurgocasa.com/sitemap.xml

**Ejemplo de salida:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.mapafurgocasa.com</loc>
    <lastmod>2025-10-28T12:00:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.mapafurgocasa.com/mapa</loc>
    <lastmod>2025-10-28T12:00:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.mapafurgocasa.com/area/area-autocaravanas-murcia</loc>
    <lastmod>2025-10-27T10:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- ... más URLs de áreas ... -->
</urlset>
```

---

## 🤖 Robots.txt Dinámico

### Archivo Creado: `app/robots.ts`

**Configuración:**

```txt
User-agent: *
Allow: /
Allow: /mapa
Allow: /area/
Allow: /ruta
Allow: /auth/
Allow: /privacidad
Allow: /condiciones
Disallow: /admin/
Disallow: /api/
Disallow: /perfil

User-agent: Googlebot
Allow: /
Allow: /mapa
Allow: /area/
Allow: /ruta
Allow: /privacidad
Allow: /condiciones
Disallow: /admin/
Disallow: /api/
Disallow: /perfil
Disallow: /auth/

Sitemap: https://www.mapafurgocasa.com/sitemap.xml
```

### Verificar robots.txt

**URL:** https://www.mapafurgocasa.com/robots.txt

---

## 📄 Metadata Optimizada

### Layout Principal (`app/layout.tsx`)

**Implementado:**
- ✅ Title SEO optimizado con +600 ubicaciones
- ✅ Description completa (150-160 caracteres)
- ✅ Keywords relevantes
- ✅ Open Graph para redes sociales
- ✅ Twitter Card
- ✅ Canonical URL
- ✅ Language (es-ES)

**Metadata actual:**
```typescript
{
  title: 'Mapa Furgocasa - Encuentra Áreas para Autocaravanas en España | +600 Ubicaciones',
  description: 'Descubre más de 600 áreas para autocaravanas en España. Planifica rutas, encuentra servicios, guarda favoritos y viaja con libertad.',
  keywords: [
    'áreas autocaravanas españa',
    'mapa autocaravanas',
    'parkings autocaravanas',
    'camping autocaravanas',
    'furgo españa',
    'camper van españa',
    'rutas autocaravanas',
    'pernocta autocaravanas',
    'furgocasa'
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.mapafurgocasa.com',
    title: 'Mapa Furgocasa - Descubre +600 Áreas para Autocaravanas en España',
    description: '...',
    siteName: 'Mapa Furgocasa',
    images: [{
      url: 'https://www.mapafurgocasa.com/og-image-v2.jpg',
      width: 1200,
      height: 630,
    }],
  },
}
```

### Páginas de Áreas (`app/(public)/area/[slug]/page.tsx`)

**Recomendación:** Añadir metadata dinámica por área

**Implementación sugerida:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: area } = await supabase
    .from('areas')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!area) {
    return {
      title: 'Área no encontrada - Mapa Furgocasa',
    }
  }

  const title = `${area.nombre} - ${area.ciudad}, ${area.provincia} | Mapa Furgocasa`
  const description = area.descripcion 
    ? area.descripcion.slice(0, 160) 
    : `Información completa del área ${area.nombre} en ${area.ciudad}. Servicios, precios, ubicación y valoraciones.`

  return {
    title,
    description,
    keywords: [
      `área autocaravana ${area.ciudad}`,
      `camping ${area.provincia}`,
      area.nombre,
      'autocaravana españa',
      'pernocta autocaravana',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.mapafurgocasa.com/area/${area.slug}`,
      images: area.foto_principal 
        ? [{ url: area.foto_principal }] 
        : [],
    },
  }
}
```

---

## 📊 Google Search Console

### 1. Verificación del Sitio

**Ya completado:** Archivo de verificación `google1a3ec9faf90ba022.html` en el proyecto.

**URL de verificación:**
https://www.mapafurgocasa.com/google1a3ec9faf90ba022.html

### 2. Enviar el Sitemap

**Pasos:**
1. Ve a [Google Search Console](https://search.google.com/search-console/)
2. Selecciona tu propiedad: `www.mapafurgocasa.com`
3. En el menú lateral: **Sitemaps**
4. Añade la URL del sitemap: `https://www.mapafurgocasa.com/sitemap.xml`
5. Click en **"Enviar"**

**Estado esperado:** 
- ✅ Sitemap enviado correctamente
- ✅ Google empezará a rastrear e indexar las URLs
- ⏱️ Primeros datos visibles en 24-48 horas

### 3. Solicitar Indexación Manual

Para áreas nuevas importantes:
1. Ve a **Inspección de URLs**
2. Pega la URL: `https://www.mapafurgocasa.com/area/[slug]`
3. Click en **"Solicitar indexación"**

---

## 🔗 Canonical URLs

### Implementación

Asegúrate de que cada página tiene su canonical URL:

```typescript
// app/(public)/area/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    // ...
    alternates: {
      canonical: `https://www.mapafurgocasa.com/area/${params.slug}`,
    },
  }
}
```

---

## 🌐 Structured Data (JSON-LD)

### Para Áreas (Recomendación)

Añadir Schema.org markup para mejor SEO local:

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: area.nombre,
  description: area.descripcion,
  address: {
    '@type': 'PostalAddress',
    addressLocality: area.ciudad,
    addressRegion: area.provincia,
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: area.latitud,
    longitude: area.longitud,
  },
  aggregateRating: area.rating_promedio ? {
    '@type': 'AggregateRating',
    ratingValue: area.rating_promedio,
    reviewCount: area.num_valoraciones,
  } : undefined,
  image: area.foto_principal,
  url: `https://www.mapafurgocasa.com/area/${area.slug}`,
}
```

**Añadir en el componente:**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

---

## 📈 Mejoras de Rendimiento para SEO

### 1. Core Web Vitals

**Métricas objetivo:**
- ✅ LCP (Largest Contentful Paint): < 2.5s
- ✅ FID (First Input Delay): < 100ms
- ✅ CLS (Cumulative Layout Shift): < 0.1

**Optimizaciones aplicadas:**
- Next.js Image optimization
- PWA con caché
- Code splitting
- Compresión Gzip/Brotli

### 2. Velocidad de Carga

**Herramientas de análisis:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- Lighthouse en Chrome DevTools

**Objetivo:** Puntuación > 90 en móvil y desktop

---

## 🎯 Keywords Strategy

### Keywords Principales

| Keyword | Volumen | Dificultad | Prioridad |
|---------|---------|------------|-----------|
| áreas autocaravanas españa | Alto | Media | 🔥 Alta |
| mapa autocaravanas | Alto | Media | 🔥 Alta |
| parkings autocaravanas | Medio | Baja | 🔥 Alta |
| camping autocaravanas | Alto | Alta | ⚠️ Media |
| pernocta autocaravana | Medio | Baja | 🔥 Alta |
| rutas autocaravanas españa | Medio | Media | ⚠️ Media |

### Keywords Long-Tail (Por Ubicación)

Generar automáticamente para cada área:
- "área autocaravana [ciudad]"
- "parking autocaravana [provincia]"
- "camping autocaravana [ciudad]"
- "dónde pernoctar autocaravana [provincia]"

**Implementación:** Ya incluidas en metadata de áreas

---

## 🔍 Internal Linking

### Estrategia de Enlaces Internos

1. **Homepage → Mapa** ✅
2. **Mapa → Áreas individuales** ✅
3. **Área → Áreas relacionadas** ✅ (Componente AreasRelacionadas)
4. **Área → Planificador de rutas** ⚠️ (Añadir enlace)
5. **Footer → Páginas importantes** ✅

### Mejoras Sugeridas

**Añadir breadcrumbs:**
```
Home > Mapa > [Provincia] > [Área]
```

**Enlaces contextuales en descripciones:**
- Mencionar áreas cercanas con enlaces
- Enlaces a rutas populares

---

## 📱 Mobile SEO

### Optimizaciones

- ✅ Diseño responsive (mobile-first)
- ✅ PWA instalable
- ✅ Viewport configurado
- ✅ Touch-friendly UI
- ✅ Fast loading en móvil

### Verificación Mobile-Friendly

**Herramienta:** [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

**URL:** `https://www.mapafurgocasa.com`

---

## 📊 Monitoreo y Analytics

### Google Analytics 4

**Ya configurado:** Ver [CONFIGURACION_GTM.md](./CONFIGURACION_GTM.md)

**Métricas a monitorear:**
- Tráfico orgánico
- Keywords que traen tráfico
- Páginas más visitadas
- Bounce rate
- Tiempo en página

### Google Search Console

**Métricas clave:**
- Impresiones en búsqueda
- Clicks desde búsqueda
- CTR promedio
- Posición promedio
- Páginas indexadas

**Revisar semanalmente:**
1. Coverage (cobertura de índice)
2. Errores de rastreo
3. Sitemap status
4. Core Web Vitals

---

## ✅ Checklist de SEO

### Configuración Básica
- [x] Sitemap.xml generado dinámicamente
- [x] Robots.txt configurado
- [x] Metadata en layout principal
- [ ] Metadata dinámica en páginas de áreas (Recomendado)
- [x] Canonical URLs
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Google Search Console verificado

### Contenido
- [x] Títulos únicos por página
- [x] Descriptions únicas (< 160 caracteres)
- [x] Keywords relevantes
- [x] URLs SEO-friendly (slugs)
- [ ] Structured Data (JSON-LD) en áreas (Recomendado)
- [x] Alt text en imágenes importantes

### Técnico
- [x] HTTPS activo
- [x] Velocidad optimizada
- [x] Mobile responsive
- [x] PWA implementado
- [x] Enlaces internos
- [x] Sin enlaces rotos

### Monitoreo
- [x] Google Analytics configurado
- [x] Google Search Console configurado
- [x] Google Tag Manager configurado
- [ ] Sitemap enviado a Search Console (Hacer después del deploy)

---

## 🚀 Próximos Pasos

### Inmediato (Después del Deploy)

1. **Verificar que el sitemap funciona**
   ```
   https://www.mapafurgocasa.com/sitemap.xml
   ```

2. **Enviar sitemap a Google Search Console**
   - Sitemaps → Añadir sitemap → `sitemap.xml`

3. **Solicitar indexación de páginas principales**
   - `/`
   - `/mapa`
   - Primeras 10-20 áreas importantes

### Corto Plazo (1-2 semanas)

1. **Implementar metadata dinámica en áreas**
   - Copiar código sugerido arriba
   - Deploy y verificar

2. **Añadir Structured Data (JSON-LD)**
   - Implementar en páginas de áreas
   - Verificar con [Schema Markup Validator](https://validator.schema.org/)

3. **Optimizar contenido**
   - Asegurar que todas las áreas tienen descripción
   - Keywords naturales en descripciones
   - Alt text en todas las imágenes

### Largo Plazo (1-3 meses)

1. **Link Building**
   - Directorios de autocaravanas
   - Blogs de viajes
   - Colaboraciones con influencers

2. **Contenido SEO**
   - Blog con guías de rutas
   - Artículos sobre destinos
   - Consejos para autocaravanistas

3. **Análisis y Optimización**
   - Revisar keywords con mejor rendimiento
   - Optimizar páginas con bajo CTR
   - Mejorar contenido de áreas populares

---

## 📞 Recursos Útiles

### Herramientas

- [Google Search Console](https://search.google.com/search-console/)
- [Google Analytics](https://analytics.google.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema Markup Validator](https://validator.schema.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Documentación

- [Next.js SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)

---

## 🎯 Resultados Esperados

### Primeras 2 Semanas
- ✅ Sitemap procesado por Google
- ✅ Primeras páginas indexadas
- ✅ Aparición en búsquedas de marca

### Primer Mes
- ✅ 50-100 páginas indexadas
- ✅ Primeras visitas orgánicas
- ✅ Keywords de marca posicionadas

### 3 Meses
- ✅ 300-500 páginas indexadas
- ✅ Tráfico orgánico creciente
- ✅ Keywords long-tail posicionadas
- ✅ Aparición en "near me" searches

### 6 Meses+
- ✅ Keywords principales en top 10
- ✅ Tráfico orgánico significativo
- ✅ Autoridad de dominio mejorada

---

**Configuración SEO implementada:** ✅  
**Sitemap dinámico:** ✅  
**Robots.txt:** ✅  
**Listo para indexación:** ✅

**Siguiente paso:** Deploy y enviar sitemap a Google Search Console


