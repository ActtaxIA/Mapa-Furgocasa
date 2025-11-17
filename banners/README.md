# 📢 Banners de Promoción - Mapa Furgocasa

Banners HTML listos para usar en el blog y artículos de Furgocasa.

---

## 📁 Archivos Disponibles

### 1. **mapa-furgocasa-banner.html** - Banner Principal
**Dimensiones:** Ancho completo (max 800px)  
**Altura:** ~400px  
**Uso recomendado:** Artículos destacados, página de inicio del blog

**Características:**
- ✨ Diseño premium con gradiente azul
- 🎯 Grid de características (4 items)
- 📊 Estadísticas en footer (+900 áreas, 15+ países)
- 📱 100% Responsive
- 🔘 2 CTAs (Explorar Mapa + Crear Cuenta)

**Vista previa:**
```
┌─────────────────────────────────────────┐
│ 🚐 Mapa Furgocasa                       │
│ Tu herramienta definitiva...            │
│─────────────────────────────────────────│
│ Descubre miles de áreas...              │
│ [🗺️ Mapa] [📍 +900] [🤖 IA] [🛣️ Rutas] │
│ [🚀 Explorar] [🔐 Crear Cuenta]         │
│─────────────────────────────────────────│
│ 📊 900+ Áreas | 🌍 15+ Países | ⭐ Gratis│
└─────────────────────────────────────────┘
```

---

### 2. **banner-compacto.html** - Banner Horizontal
**Dimensiones:** Ancho completo (max 700px)  
**Altura:** ~100px  
**Uso recomendado:** Entre párrafos, final de artículos

**Características:**
- 🎨 Diseño minimalista horizontal
- ⚡ Carga rápida
- 📱 Responsive (se vuelve vertical en móvil)
- 🔘 1 CTA (Ver Mapa)

**Vista previa:**
```
┌──────────────────────────────────────────────┐
│ 🚐 │ Mapa Furgocasa               │ [Ver Mapa] │
│    │ +900 áreas en Europa y LATAM │            │
└──────────────────────────────────────────────┘
```

---

### 3. **banner-lateral.html** - Banner Sidebar
**Dimensiones:** 350px ancho  
**Altura:** ~550px  
**Uso recomendado:** Barra lateral del blog, widgets

**Características:**
- 📋 Lista de 5 características principales
- 🎨 Diseño tipo tarjeta con borde
- 🔘 2 CTAs verticales
- 🏷️ Badge "BETA" incluido

**Vista previa:**
```
┌─────────────────────┐
│   🚐                │
│ Mapa Furgocasa     │
│ ─────────────────── │
│ 🗺️ Mapa interactivo│
│ 📍 Encuentra áreas  │
│ 🛣️ Planifica rutas │
│ 🤖 Chatbot IA      │
│ 💙 Guarda favoritos│
│ ─────────────────── │
│ [🚀 Explorar Mapa] │
│ [Crear Cuenta]     │
│ ─────────────────── │
│ 100% gratuito ✨    │
└─────────────────────┘
```

---

## 🚀 Cómo Usar

### Opción 1: Copiar y Pegar el HTML Completo

1. Abre el archivo `.html` que quieras usar
2. Copia TODO el contenido (incluye CSS inline)
3. Pégalo en tu artículo del blog (modo HTML/Código)
4. ¡Listo! El banner se mostrará con estilos incluidos

**Ejemplo en WordPress:**
```html
<!-- Tu contenido del artículo -->
<p>... texto del artículo ...</p>

<!-- PEGAR AQUÍ EL BANNER -->
<div class="furgocasa-banner">
    <!-- ... contenido del banner ... -->
</div>

<!-- Continuar con tu artículo -->
<p>... más contenido ...</p>
```

---

### Opción 2: Iframe (Si el blog no permite HTML directo)

Si tu plataforma de blog no permite HTML personalizado, usa iframe:

```html
<iframe 
    src="https://www.mapafurgocasa.com/banners/mapa-furgocasa-banner.html" 
    width="100%" 
    height="450" 
    frameborder="0" 
    scrolling="no"
    style="border: none; max-width: 800px; margin: 30px auto; display: block;">
</iframe>
```

*(Primero debes subir los archivos HTML a tu servidor o a /public de la app)*

---

## 🎨 Personalización

### Cambiar Colores

Busca estas líneas en el CSS de cada banner y modifica los valores:

```css
/* Color principal (azul) */
background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);

/* Cambiar por naranja de Furgocasa (si lo prefieres) */
background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
```

### Cambiar Textos

Busca el HTML dentro de cada archivo y modifica:
- Título: `<h2>Mapa Furgocasa</h2>`
- Descripción: `<p>Tu herramienta definitiva...</p>`
- Estadísticas: `<span class="stat-number">900+</span>`

### Cambiar URLs

Por defecto los botones apuntan a:
- Mapa: `https://www.mapafurgocasa.com/mapa`
- Login: `https://www.mapafurgocasa.com/auth/login`

Puedes añadir parámetros UTM para tracking:
```html
<a href="https://www.mapafurgocasa.com/mapa?utm_source=blog&utm_medium=banner&utm_campaign=articulo-X">
```

---

## 📊 Tracking de Conversiones

### Google Analytics

Añade eventos personalizados a los botones:

```html
<a href="..." 
   onclick="gtag('event', 'click', {
     'event_category': 'Banner',
     'event_label': 'Explorar Mapa'
   });">
```

### Facebook Pixel

```html
<a href="..." 
   onclick="fbq('track', 'ViewContent', {
     content_name: 'Banner Mapa Furgocasa'
   });">
```

---

## 🐛 Solución de Problemas

### El banner no se ve bien en móvil
- ✅ Todos los banners son responsive por defecto
- Asegúrate de tener el meta viewport en tu blog:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Los estilos se rompen / no se aplican
- El CSS está inline para evitar conflictos
- Si hay problemas, añade `!important` a los estilos críticos
- Ejemplo: `background: #0ea5e9 !important;`

### Los emojis no se ven
- Algunos navegadores antiguos no soportan emojis
- Alternativa: Reemplaza emojis por imágenes SVG o iconos Font Awesome

---

## 📝 Ejemplos de Uso

### Blog Post: "Mejores Rutas en Autocaravana por España"

**Inicio del artículo:**
```html
<!-- Banner compacto al inicio -->
[Usar: banner-compacto.html]

<h1>Mejores Rutas en Autocaravana por España</h1>
<p>Si estás planeando tu próxima aventura...</p>
```

**Mitad del artículo:**
```html
<h2>3. Ruta por la Costa Mediterránea</h2>
<p>... descripción de la ruta ...</p>

<!-- Banner lateral en sidebar -->
[Usar: banner-lateral.html]
```

**Final del artículo:**
```html
<h2>Conclusión</h2>
<p>Estas rutas son perfectas para...</p>

<!-- Banner principal al final -->
[Usar: mapa-furgocasa-banner.html]
```

---

## 🎯 Mejores Prácticas

1. **No satures**: Usa máximo 1-2 banners por artículo
2. **Posicionamiento estratégico**:
   - Banner compacto: Entre párrafos naturalmente
   - Banner principal: Al final del artículo (mejor conversión)
   - Banner lateral: Sidebar persistente
3. **A/B Testing**: Prueba diferentes versiones y posiciones
4. **Mobile First**: Verifica siempre en móvil (70% del tráfico)

---

## 📈 Métricas Esperadas

Basado en banners similares:
- **CTR esperado**: 2-5% (artículos relevantes)
- **Mejor posición**: Final del artículo (post-lectura)
- **Mejor día**: Viernes-Domingo (planificación de viajes)

---

## 🔄 Actualizaciones

**Versión 1.0** - 7 Noviembre 2025
- ✅ 3 tipos de banners creados
- ✅ Responsive design
- ✅ CSS inline (plug & play)
- ✅ Animaciones hover

---

## 📞 Soporte

Si necesitas personalizar algo más o tienes problemas:
- Email: soporte@furgocasa.com
- Revisar este README primero 😊

---

**¡Feliz promoción!** 🚐✨














