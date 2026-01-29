# 📧 Guía de Configuración de Plantillas de Email en Supabase

## 🎯 Plantillas Creadas

He creado **2 versiones** del email de confirmación:

### Versión 1: Completa (Recomendada)
- **Archivo:** `mail_mapas/email-confirmacion-signup.html`
- **Características:**
  - Diseño profesional con gradiente
  - Header con logo
  - Lista de beneficios
  - Footer completo con links
  - Optimizada para móvil
  - Compatible con Outlook

### Versión 2: Simple (Alternativa)
- **Archivo:** `mail_mapas/email-confirmacion-signup-simple.html`
- **Características:**
  - Diseño minimalista
  - Más ligera
  - Carga más rápida
  - Ideal si la completa da problemas

---

## 🔧 CÓMO CONFIGURARLO EN SUPABASE

### Paso 1: Abrir Editor de Plantillas

```
1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: dkqnemjcmcnyhuvstosf
3. Ir a: Authentication → Email Templates
4. Seleccionar: "Confirm signup"
```

### Paso 2: Copiar el HTML

1. **Abrir el archivo** que quieras usar:
   - `mail_mapas/email-confirmacion-signup.html` (completa)
   - O `mail_mapas/email-confirmacion-signup-simple.html` (simple)

2. **Copiar TODO el contenido** del archivo

3. **Pegar en Supabase** en el campo de HTML

### Paso 3: Variables de Supabase

**IMPORTANTE:** El código ya incluye la variable correcta:

```html
{{ .ConfirmationURL }}
```

Esta variable se reemplazará automáticamente por Supabase con el enlace único de confirmación.

### Paso 4: Configurar Subject (Asunto)

En Supabase, también configura el asunto del email:

```
Subject: ✓ Confirma tu cuenta en Mapa Furgocasa
```

O alternativamente:

```
Subject: 🚐 Bienvenido a Mapa Furgocasa - Confirma tu cuenta
```

### Paso 5: Guardar y Probar

1. Click **"Save"**
2. Click **"Send test email"** para ver cómo se ve
3. Revisar en tu email que se vea bien

---

## 🎨 PERSONALIZACIÓN (Opcional)

Si quieres cambiar el logo, busca esta línea en el HTML:

```html
<h1 style="margin: 0; color: #0284c7; font-size: 28px;">
    🚐 FURGOCASA
</h1>
```

Y reemplázala con tu imagen real:

```html
<img src="https://www.mapafurgocasa.com/logo-negro.png" 
     alt="Mapa Furgocasa" 
     style="max-width: 200px; height: auto;" />
```

---

## 📱 OTRAS PLANTILLAS QUE PUEDES PERSONALIZAR

En Supabase también puedes personalizar:

### 1. Magic Link (Login sin contraseña)
- **Template:** "Magic Link"
- **Cuando se usa:** Login con link por email
- **Variable:** `{{ .Token }}`

### 2. Change Email Address
- **Template:** "Change Email Address"
- **Cuando se usa:** Usuario cambia su email
- **Variable:** `{{ .ConfirmationURL }}`

### 3. Reset Password
- **Template:** "Reset Password"
- **Cuando se usa:** Recuperación de contraseña
- **Variable:** `{{ .Token }}`

### 4. Invite User
- **Template:** "Invite User"
- **Cuando se usa:** Invitaciones de usuario
- **Variable:** `{{ .ConfirmationURL }}`

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] SMTP configurado con OVHcloud (ssl0.ovh.net)
- [ ] Cuenta noreply@furgocasa.com creada
- [ ] Plantilla "Confirm signup" actualizada con nuevo HTML
- [ ] Subject del email configurado
- [ ] Test email enviado y recibido correctamente
- [ ] Email se ve bien en móvil
- [ ] Email se ve bien en Outlook/Gmail
- [ ] Botón de confirmación funciona
- [ ] Enlace alternativo funciona

---

## 🧪 CÓMO PROBAR

### Test 1: Email de prueba en Supabase

```
1. En Email Templates → Confirm signup
2. Click "Send test email"
3. Introducir tu email
4. Verificar que llega y se ve bien
```

### Test 2: Registro real

```
1. Ir a: https://www.mapafurgocasa.com/auth/register
2. Registrarse con email de prueba
3. Verificar que llega el email
4. Hacer clic en el botón
5. Confirmar que redirige correctamente
```

---

## 🎨 COLORES USADOS (Por si quieres cambiarlos)

```css
Azul principal:  #0ea5e9
Azul oscuro:     #0284c7
Verde éxito:     #10b981
Gris texto:      #374151
Gris claro:      #6b7280
Gris muy claro:  #9ca3af
Fondo:           #f3f4f6
```

---

## 🆘 TROUBLESHOOTING

### El email no se ve bien en Gmail
- **Causa:** CSS no soportado
- **Solución:** Usa la versión simple

### El email no se ve bien en Outlook
- **Causa:** Outlook usa renderizado antiguo
- **Solución:** El código ya está optimizado con `<!--[if mso]-->`

### El enlace no funciona
- **Causa:** Variable incorrecta
- **Solución:** Verifica que sea `{{ .ConfirmationURL }}` exactamente

### Los colores no se ven
- **Causa:** Cliente de email bloqueando CSS
- **Solución:** Normal, los estilos inline funcionan mejor

---

## 📄 EJEMPLO DE SUBJECT LINES

Elige el que más te guste:

```
✓ Confirma tu cuenta en Mapa Furgocasa
🚐 Bienvenido a Mapa Furgocasa - Confirma tu cuenta
Confirma tu registro en Mapa Furgocasa
Un último paso para unirte a Mapa Furgocasa
¡Ya casi estás! Confirma tu cuenta
```

---

## 🎉 RESULTADO FINAL

Después de configurar:

✅ Emails profesionales con tu marca  
✅ Diseño responsive (móvil y desktop)  
✅ Compatible con todos los clientes de email  
✅ Botón CTA claro y visible  
✅ Enlace alternativo por si el botón no funciona  
✅ Footer con información legal  

---

**Tiempo estimado:** 5-10 minutos  
**Dificultad:** Fácil (copiar y pegar)  
**Impacto:** Alta profesionalidad en emails
