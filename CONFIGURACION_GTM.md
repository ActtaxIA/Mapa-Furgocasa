# 🏷️ CONFIGURACIÓN GOOGLE TAG MANAGER

## 📋 Paso 1: Crear cuenta de Google Tag Manager

1. Ve a: https://tagmanager.google.com/
2. Clic en **"Crear cuenta"**
3. Configura:
   - **Nombre de la cuenta:** Mapa Furgocasa
   - **País:** España
   - **Nombre del contenedor:** www.mapafurgocasa.com
   - **Plataforma de destino:** Web
4. Acepta los términos y clic en **"Crear"**

---

## 🔑 Paso 2: Obtener tu ID de GTM

Después de crear, verás una ventana con tu código GTM:

```
GTM-XXXXXXX  ← Este es tu ID
```

**Copia ese ID** (ejemplo: `GTM-ABC1234`)

---

## ⚙️ Paso 3: Actualizar el código en Next.js

En el archivo `app/layout.tsx`, reemplaza `GTM-XXXXXXX` con tu ID real:

```typescript
// Busca estas 2 líneas:
})(window,document,'script','dataLayer','GTM-XXXXXXX');  ← Reemplazar aquí
                                                  ^^^^^^^^^^^

src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"  ← Y aquí
                                                      ^^^^^^^^^^^
```

---

## 📊 Paso 4: Configurar Google Analytics en GTM

### A) Añadir Google Analytics 4:

1. En GTM, ve a **"Etiquetas"** → **"Nueva"**
2. Nombre: `Google Analytics 4`
3. Tipo de etiqueta: **Google Analytics: Configuración de GA4**
4. ID de medición: `G-8E3JE5ZVET` (tu ID de Analytics)
5. Activación: **All Pages** (Todas las páginas)
6. Guardar

---

## ✅ Paso 5: Configurar verificación de Search Console

Hay 3 formas de verificar en Search Console sin código:

### **Opción 1: Verificación mediante Google Analytics (RECOMENDADO)**

1. Ve a: https://search.google.com/search-console/
2. Añadir propiedad → Tipo: **Prefijo de URL**
3. URL: `https://www.mapafurgocasa.com`
4. Método de verificación: **"Google Analytics"**
5. Requisitos:
   - ✅ Debes ser administrador en Google Analytics
   - ✅ El código de Analytics debe estar en el sitio (vía GTM)
6. Clic en **"Verificar"**

### **Opción 2: Verificación mediante dominio DNS**

1. En Search Console → **Verificar propiedad**
2. Método: **Registro DNS**
3. Te darán un registro TXT como:
   ```
   google-site-verification=abc123xyz...
   ```
4. Ve a tu proveedor de dominios (donde compraste mapafurgocasa.com)
5. Añade un registro TXT en DNS:
   - **Tipo:** TXT
   - **Nombre:** @ (o vacío)
   - **Valor:** `google-site-verification=abc123xyz...`
6. Espera 10-30 minutos y clic en **"Verificar"**

### **Opción 3: Verificación mediante archivo HTML (YA IMPLEMENTADO)**

Ya tienes el archivo `google1a3ec9faf90ba022.html` en el proyecto.

1. Despliega el código
2. Verifica que funcione: https://www.mapafurgocasa.com/google1a3ec9faf90ba022.html
3. En Search Console → Método: **Archivo HTML**
4. Clic en **"Verificar"**

---

## 🎯 Paso 6: Publicar contenedor de GTM

¡IMPORTANTE! Después de configurar todas las etiquetas en GTM:

1. Clic en **"Enviar"** (arriba a la derecha)
2. Nombre de versión: `v1 - Configuración inicial`
3. Descripción: `Google Analytics 4 + Search Console`
4. Clic en **"Publicar"**

**Sin publicar, GTM NO funcionará en producción.**

---

## 🧪 Paso 7: Verificar que funciona

### A) Verificar GTM:

1. Abre: https://www.mapafurgocasa.com
2. F12 → Console
3. Escribe: `dataLayer`
4. Deberías ver un array con eventos

### B) Verificar Google Analytics:

1. Ve a: https://analytics.google.com/
2. Reportes → Tiempo real
3. Abre tu sitio en otra pestaña
4. Deberías ver 1 usuario activo en tiempo real

### C) Verificar Search Console:

1. En Search Console, debería aparecer **"Propiedad verificada"** ✅
2. Espera 24-48 horas para ver datos de búsqueda

---

## 📌 Etiquetas adicionales que puedes añadir en GTM (futuro)

Una vez tengas GTM funcionando, puedes añadir **sin tocar código**:

1. **Facebook Pixel**
   - Tipo: Píxel de Facebook
   - ID: Tu Pixel ID
   - Activación: All Pages

2. **Google Ads Conversion**
   - Tipo: Conversión de Google Ads
   - ID de conversión: Tu ID
   - Activación: Páginas específicas

3. **Hotjar / Clarity**
   - Tipo: HTML personalizado
   - Código del proveedor
   - Activación: All Pages

4. **Event tracking personalizado**
   - Clic en botones
   - Formularios enviados
   - Scroll depth
   - Tiempo en página

---

## 🔧 Variables de entorno (opcional)

Si quieres cambiar el GTM ID sin editar código, puedes usar variables de entorno:

### En `app/layout.tsx`:
```typescript
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'
```

### En `.env.local`:
```bash
NEXT_PUBLIC_GTM_ID=GTM-ABC1234
```

### En AWS Amplify:
```
NEXT_PUBLIC_GTM_ID = GTM-ABC1234
```

---

## ✅ Checklist final

- [ ] Cuenta de GTM creada
- [ ] ID de GTM copiado
- [ ] `GTM-XXXXXXX` reemplazado en `app/layout.tsx` (2 lugares)
- [ ] Google Analytics 4 configurado en GTM
- [ ] Etiqueta GA4 activada en **All Pages**
- [ ] Contenedor de GTM publicado
- [ ] Search Console verificado (Analytics, DNS o HTML)
- [ ] Verificado en tiempo real que funciona

---

## 📚 Recursos útiles

- **GTM:** https://tagmanager.google.com/
- **Analytics:** https://analytics.google.com/
- **Search Console:** https://search.google.com/search-console/
- **Documentación GTM:** https://developers.google.com/tag-platform/tag-manager
- **Tutorial GTM:** https://support.google.com/tagmanager/answer/6103696

---

## 🆘 Problemas comunes

### 1. **GTM no carga**
- ✅ Verifica que el ID `GTM-XXXXXXX` sea correcto
- ✅ Asegúrate de haber **publicado** el contenedor en GTM
- ✅ Limpia caché del navegador

### 2. **Analytics no reporta datos**
- ✅ Verifica en GTM → Vista previa que la etiqueta GA4 se dispara
- ✅ Espera 24-48 horas para datos completos
- ✅ Verifica que el ID `G-8E3JE5ZVET` sea correcto

### 3. **Search Console no verifica**
- ✅ Opción 1 (Analytics): Verifica que seas admin en Analytics
- ✅ Opción 2 (DNS): Espera 30-60 min después de añadir registro TXT
- ✅ Opción 3 (HTML): Verifica que el archivo sea accesible públicamente

---

**¿Necesitas ayuda? Abre un issue en GitHub o contacta al equipo.**

