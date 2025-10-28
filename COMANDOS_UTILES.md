# 🛠️ Comandos Útiles - Mapa Furgocasa

## 📦 NPM Scripts

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en un puerto específico
npm run dev -- -p 3001

# Mostrar el build
npm run build

# Iniciar servidor de producción
npm run start

# Linter
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

---

## 🗄️ Supabase - Comandos SQL Útiles

### Ver todas las áreas
```sql
SELECT id, nombre, ciudad, provincia, tipo_area, verificado, activo
FROM public.areas
ORDER BY nombre;
```

### Contar áreas por provincia
```sql
SELECT provincia, COUNT(*) as total
FROM public.areas
WHERE activo = true
GROUP BY provincia
ORDER BY total DESC;
```

### Buscar áreas cercanas a Madrid (50km)
```sql
SELECT * FROM public.areas_cercanas(40.4168, -3.7038, 50);
```

### Insertar área de ejemplo
```sql
INSERT INTO public.areas (
  nombre, slug, descripcion, latitud, longitud,
  ciudad, provincia, comunidad, tipo_area,
  precio_noche, acceso_24h, verificado, activo
) VALUES (
  'Área de Autocaravanas Ejemplo',
  'area-autocaravanas-ejemplo',
  'Área completamente equipada con todos los servicios',
  40.4168,
  -3.7038,
  'Madrid',
  'Madrid',
  'Comunidad de Madrid',
  'publica',
  15.00,
  true,
  true,
  true
);
```

### Ver favoritos de un usuario
```sql
SELECT 
  f.created_at,
  a.nombre,
  a.ciudad,
  a.provincia
FROM public.favoritos f
JOIN public.areas a ON f.area_id = a.id
WHERE f.user_id = 'tu-user-id'
ORDER BY f.created_at DESC;
```

### Estadísticas de valoraciones
```sql
SELECT 
  a.nombre,
  COUNT(v.id) as num_valoraciones,
  AVG(v.rating)::NUMERIC(3,2) as rating_promedio
FROM public.areas a
LEFT JOIN public.valoraciones v ON a.id = v.area_id
GROUP BY a.id, a.nombre
HAVING COUNT(v.id) > 0
ORDER BY rating_promedio DESC, num_valoraciones DESC
LIMIT 10;
```

### Analytics - Eventos más frecuentes
```sql
SELECT 
  event_type,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM public.user_analytics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY total DESC;
```

---

## 🔧 Git - Comandos Esenciales

### Inicial
```bash
# Inicializar repositorio
git init

# Primer commit
git add .
git commit -m "🎉 Initial commit - Proyecto Mapa Furgocasa"

# Conectar con remoto
git remote add origin https://github.com/tu-usuario/mapa-furgocasa.git
git push -u origin main
```

### Desarrollo
```bash
# Ver estado
git status

# Crear rama feature
git checkout -b feature/nombre-feature

# Commit con emoji
git commit -m "✨ Add: nueva funcionalidad"
git commit -m "🐛 Fix: corrección de bug"
git commit -m "📝 Docs: actualizar documentación"
git commit -m "♻️ Refactor: mejorar código"
git commit -m "🎨 Style: mejorar UI"

# Merge feature a main
git checkout main
git merge feature/nombre-feature

# Push
git push origin main
```

### Emojis Git Útiles
- 🎉 `:tada:` - Commit inicial
- ✨ `:sparkles:` - Nueva funcionalidad
- 🐛 `:bug:` - Fix de bug
- 📝 `:memo:` - Documentación
- 🎨 `:art:` - Mejorar UI/UX
- ♻️ `:recycle:` - Refactoring
- 🚀 `:rocket:` - Mejorar performance
- 🔒 `:lock:` - Seguridad
- 🌐 `:globe_with_meridians:` - i18n
- ✅ `:white_check_mark:` - Tests

---

## 🎨 Tailwind - Clases Útiles

### Layout
```jsx
<div className="container mx-auto px-4">          // Container responsive
<div className="flex items-center justify-between"> // Flexbox centrado
<div className="grid grid-cols-1 md:grid-cols-3 gap-4"> // Grid responsive
```

### Responsive
```jsx
<div className="w-full md:w-1/2 lg:w-1/3">       // Ancho responsive
<div className="text-sm md:text-base lg:text-lg"> // Texto responsive
<div className="hidden md:block">                 // Mostrar en desktop
<div className="md:hidden">                       // Mostrar en móvil
```

### Colores del Proyecto
```jsx
<div className="bg-primary-600">                  // Azul principal
<div className="text-camper-orange">              // Naranja camper
<div className="bg-camper-green">                 // Verde camper
<div className="text-camper-blue">                // Azul marino
```

### Efectos
```jsx
<button className="hover:scale-105 transition-transform"> // Zoom hover
<div className="shadow-mobile">                           // Sombra móvil
<div className="animate-fade-in">                         // Fade in
<div className="safe-bottom">                             // Safe area
```

---

## 🚀 Vercel - Deploy Rápido

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (primera vez)
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Ver dominios
vercel domains ls

# Añadir dominio personalizado
vercel domains add tudominio.com
```

---

## 📱 PWA - Testing

### Chrome DevTools (F12)
```
1. Application tab
2. Manifest → Ver manifest.json
3. Service Workers → Ver estado
4. Storage → Ver caché
```

### Lighthouse
```
1. F12 → Lighthouse tab
2. Select: Performance, Accessibility, Best Practices, SEO, PWA
3. Click "Generate report"
```

### Probar instalación
```
1. Abrir en Chrome móvil
2. Menú → "Añadir a pantalla de inicio"
3. Verificar que se instala como app
```

---

## 🐛 Debugging

### Ver logs del servidor
```bash
# Terminal donde corre npm run dev
# Los console.log aparecen aquí
```

### Ver logs del cliente
```javascript
// En el navegador: F12 → Console

console.log('Debug:', variable)
console.table(array)
console.error('Error:', error)
```

### Debugging Supabase
```javascript
// Activar logs detallados
const supabase = createClient(url, key, {
  auth: { debug: true }
})
```

### Network debugging
```
1. F12 → Network tab
2. Filter: Fetch/XHR
3. Ver requests a Supabase y Google Maps
```

---

## 🔑 Variables de Entorno

### Desarrollo (.env.local)
```bash
# Copiar ejemplo
copy .env.example .env.local

# Editar
notepad .env.local
```

### Producción (Vercel)
```bash
# Añadir variable
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Listar variables
vercel env ls

# Pull de producción
vercel env pull .env.local
```

---

## 📊 Performance

### Analizar bundle
```bash
# Instalar analyzer
npm install @next/bundle-analyzer

# Añadir a next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# Analizar
ANALYZE=true npm run build
```

### Lighthouse CI
```bash
npm install -g @lhci/cli

lhci autorun
```

---

## 🧪 Testing (Futuro)

### Jest (Unit tests)
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom

npm test
```

### Cypress (E2E tests)
```bash
npm install -D cypress

npx cypress open
```

---

## 📚 Recursos Rápidos

### Next.js
- Docs: https://nextjs.org/docs
- Learn: https://nextjs.org/learn

### Supabase
- Docs: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard

### Tailwind
- Docs: https://tailwindcss.com/docs
- Cheatsheet: https://nerdcave.com/tailwind-cheat-sheet

### Google Maps
- Docs: https://developers.google.com/maps/documentation
- API Console: https://console.cloud.google.com

---

## 💡 Tips

### Hot Reload no funciona
```bash
# Limpiar caché
rm -rf .next
npm run dev
```

### Error de tipos
```bash
# Regenerar tipos
npm run type-check
```

### Build falla
```bash
# Limpiar todo
rm -rf .next node_modules
npm install
npm run build
```

### PWA no actualiza
```bash
# Limpiar Service Worker
1. F12 → Application → Service Workers
2. Click "Unregister"
3. Hard refresh: Ctrl + Shift + R
```

---

✨ **¡Guarda este archivo para consultarlo!** ✨
