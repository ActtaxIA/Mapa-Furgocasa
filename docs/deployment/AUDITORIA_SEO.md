# 🔍 Auditoría SEO - Mapa Furgocasa

## ❌ Problemas Encontrados

### 1. **Layout Principal (app/layout.tsx)**
```typescript
title: 'Mapa Furgocasa - Encuentra Áreas para Autocaravanas en España | +600 Ubicaciones'
description: 'Descubre más de 600 áreas...'
```
❌ **Problemas**:
- Dice "+600" cuando hay +1000 áreas
- Dice "en España" cuando es Europa
- OpenGraph también desactualizado

---

### 2. **Home Page (app/page.tsx)**
- ⚠️ Es 'use client', no tiene metadata propia
- Hereda del layout desactualizado

---

### 3. **Página de Áreas Individuales (app/(public)/area/[slug]/page.tsx)**
✅ **Correcto**: Ya tiene metadata dinámica con nombre del área

---

### 4. **Página Mapa (app/(public)/mapa/page.tsx)**
- ⚠️ Es 'use client', no tiene metadata
- Debería tener metadata específica

---

### 5. **Página Ruta (app/(public)/ruta/page.tsx)**
- ❓ Necesita revisión

---

### 6. **Página Contacto (app/(public)/contacto/page.tsx)**
```typescript
title: 'Contacto | Mapa Furgocasa'
description: 'Ponte en contacto con el equipo...'
```
✅ Básico pero correcto

---

### 7. **Página Sobre Nosotros (app/(public)/sobre-nosotros/page.tsx)**
- ⚠️ Es 'use client' ahora, perdió metadata

---

### 8. **Robots.txt**
✅ Correcto - Permite indexar páginas públicas

---

### 9. **Sitemap**
❓ Necesita revisión para incluir todas las páginas

---

## ✅ Plan de Corrección

### Prioridad ALTA

1. **Layout Principal**
   - Cambiar +600 → Dinámico o +1000
   - España → Europa
   - Actualizar OpenGraph y Twitter Cards

2. **Home Page**
   - Mantener como 'use client' pero agregar metadata en layout
   - O crear un layout específico para home

3. **Mapa Page**
   - Crear metadata específica optimizada para búsquedas

4. **Sobre Nosotros**
   - Recuperar metadata (ahora es 'use client')
   - Solución: Metadata en parent o layout anidado

### Prioridad MEDIA

5. **Ruta Page**
   - Revisar y optimizar metadata

6. **Sitemap**
   - Asegurar que incluye todas las áreas
   - Incluir sobre-nosotros y contacto

### Prioridad BAJA

7. **Manifest.json**
   - Actualizar descripciones

---

## 📝 Keywords Objetivo

### Principal
- "áreas autocaravanas europa"
- "mapa autocaravanas europa"
- "parkings autocaravanas francia portugal"

### Secundario
- "pernocta autocaravanas europa"
- "áreas ac españa portugal francia"
- "planificador rutas autocaravana europa"

### Long-tail
- "dónde dormir en autocaravana en francia"
- "áreas autocaravanas gratis portugal"
- "mapa áreas autocaravanas con servicios"

---

## 🎯 Estructura SEO Ideal

```
Layout (metadata base para Europa, +1000 áreas)
├── Home (Hero: "Más de 1000 áreas en Europa")
├── /mapa (Meta: "Mapa interactivo con +1000 áreas...")
├── /ruta (Meta: "Planifica tu ruta por Europa...")
├── /area/[slug] (Meta dinámica: "Nombre Área - Ciudad, País")
├── /sobre-nosotros (Meta: "Sobre Furgocasa - Líder en...")
├── /contacto (Meta: "Contacta con Furgocasa")
├── /privacidad (Meta actual OK)
└── /condiciones (Meta actual OK)
```

---

## 📊 Métricas Actuales vs Objetivo

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Áreas mencionadas | 600 | 1000+ |
| Cobertura geográfica | España | Europa |
| Páginas con metadata | 60% | 100% |
| Metadata dinámica | Solo /area/ | Todas posibles |


