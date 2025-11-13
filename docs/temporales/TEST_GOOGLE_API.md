# Test de Google Places API

## Prueba Manual

Para verificar si tu API Key funciona correctamente, abre este enlace en tu navegador (reemplaza TU_API_KEY con tu clave):

```
https://maps.googleapis.com/maps/api/place/textsearch/json?query=areas+autocaravanas+madrid&key=AIzaSyBZv6d0szzbRUH7qmw0GGDI384CC5fPJgI&language=es&region=es
```

### Respuestas posibles:

1. **Si funciona correctamente**, verás un JSON con:
```json
{
  "html_attributions": [],
  "results": [ ... ],
  "status": "OK"
}
```

2. **Si la API no está habilitada**, verás:
```json
{
  "error_message": "This API project is not authorized to use this API.",
  "status": "REQUEST_DENIED"
}
```

3. **Si hay restricciones en la API Key**, verás:
```json
{
  "error_message": "The provided API key is invalid.",
  "status": "REQUEST_DENIED"
}
```

## Soluciones según el error:

### Error: "This API project is not authorized to use this API"

**Pasos para habilitar la API:**

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto
3. En el menú lateral, ve a **"APIs & Services"** → **"Library"**
4. Busca **"Places API"**
5. Haz clic en **"Places API"** (no "Places API (New)")
6. Clic en botón azul **"ENABLE"** / **"HABILITAR"**
7. Espera unos segundos a que se active

### Error: "API key not valid" o restricciones

**Pasos para quitar restricciones temporalmente:**

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Encuentra tu API Key en la lista
3. Haz clic en el nombre de la API Key
4. En **"Application restrictions"**: 
   - Selecciona **"None"**
5. En **"API restrictions"**:
   - Selecciona **"Don't restrict key"** (temporalmente para probar)
6. Clic en **"SAVE"** / **"GUARDAR"**
7. Espera 1-2 minutos para que se apliquen los cambios

### Error: "You must enable Billing"

Si tu cuenta de Google Cloud no tiene facturación habilitada:

1. Ve a: https://console.cloud.google.com/billing
2. Vincula o crea una cuenta de facturación
3. Google ofrece $300 de crédito gratuito para nuevos usuarios
4. Places API es gratis hasta 1,000 búsquedas al mes

## 📞 Siguiente paso

Por favor, prueba el enlace de arriba y dime qué respuesta obtienes. Así podré ayudarte mejor.

