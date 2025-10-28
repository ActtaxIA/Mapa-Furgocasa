# 🚀 Guía Rápida de Instalación - Mapa Furgocasa

## ⚡ Instalación en 5 pasos

### 1️⃣ Instalar dependencias

```bash
cd "C:\Users\NARCISOPARDOBUENDA\Desktop\NEW MAPA FURGOCASA"
npm install --legacy-peer-deps
```

### 2️⃣ Configurar Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea un proyecto
2. Ve a **SQL Editor** en el panel de Supabase
3. Copia y pega el contenido de `supabase/schema.sql`
4. Ejecuta el script (botón "Run")
5. Copia tus credenciales:
   - Ve a **Settings** → **API**
   - Copia la **URL** y la **anon/public key**
   - Copia también la **service_role key** (para admin)

### 3️⃣ Configurar Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita estas APIs:
   - Maps JavaScript API
   - Places API  
   - Geocoding API
4. Crea una API Key:
   - Ve a **APIs & Services** → **Credentials**
   - Crea una nueva API Key
   - Restringe por dominio (añade `localhost:3000` para desarrollo)
5. Copia la API Key

### 4️⃣ Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
copy .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase (paso 2)
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Google Maps (paso 3)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
GOOGLE_PLACES_API_KEY=tu-google-maps-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 5️⃣ Iniciar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador 🎉

---

## 📱 Probar la PWA en móvil

### En tu red local:

1. Averigua tu IP local:
   ```bash
   ipconfig
   ```
   Busca la "Dirección IPv4" (ej: 192.168.1.100)

2. En tu móvil, abre el navegador y ve a:
   ```
   http://192.168.1.100:3000
   ```

3. **En Chrome (Android)**:
   - Menú → "Añadir a pantalla de inicio"

4. **En Safari (iOS)**:
   - Botón compartir → "Añadir a pantalla de inicio"

---

## 🎨 Personalización

### Cambiar colores

Edita `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#TU_COLOR_PRINCIPAL',
    600: '#TU_COLOR_PRINCIPAL_OSCURO',
  }
}
```

### Cambiar nombre e iconos PWA

1. Edita `public/manifest.json`
2. Genera iconos en [https://realfavicongenerator.net](https://realfavicongenerator.net)
3. Coloca los iconos en `public/icons/`

---

## 🗄️ Añadir datos de ejemplo

Ve a Supabase SQL Editor y ejecuta:

```sql
INSERT INTO public.areas (
  nombre, slug, descripcion, latitud, longitud,
  ciudad, provincia, tipo_area, precio_noche, verificado, activo
) VALUES 
(
  'Área de Autocaravanas Madrid Centro',
  'area-autocaravanas-madrid-centro',
  'Área completamente equipada en el centro de Madrid',
  40.4168,
  -3.7038,
  'Madrid',
  'Madrid',
  'publica',
  15.00,
  true,
  true
);
```

---

## 🐛 Solución de problemas

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: "Supabase connection failed"
- Verifica que las URLs en `.env.local` sean correctas
- Asegúrate de que el schema SQL se ejecutó correctamente

### Error: "Google Maps not loading"
- Verifica que la API Key sea correcta
- Comprueba que has habilitado las APIs necesarias
- Revisa las restricciones de dominio

### La PWA no se instala
- Asegúrate de estar usando HTTPS (o localhost)
- Verifica que `public/manifest.json` exista
- Comprueba que los iconos estén en `public/icons/`

---

## 📚 Próximos pasos

1. **Añadir áreas**: Ve a `/admin` (cuando lo implementes)
2. **Personalizar diseño**: Edita componentes en `components/`
3. **Añadir funcionalidades**: Consulta el README principal
4. **Desplegar**: Sigue la guía de deployment en el README

---

## 🆘 Necesitas ayuda

Si encuentras problemas:

1. Revisa la documentación completa en `README.md`
2. Verifica los logs de la consola del navegador (F12)
3. Comprueba los logs del servidor en la terminal

---

✨ **¡Tu app está lista! Ahora puedes empezar a desarrollar** ✨
