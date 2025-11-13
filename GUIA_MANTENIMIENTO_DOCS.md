# 📚 Guía de Mantenimiento de Documentación

**Versión:** 2.0  
**Última actualización:** 13 de noviembre de 2025

---

## 🎯 Objetivo de esta Guía

Proporcionar lineamientos claros para mantener la documentación del proyecto Mapa Furgocasa organizada, actualizada y útil.

---

## 📋 Principios Fundamentales

### 1. **Documentación Viva**
La documentación debe evolucionar con el código. Si cambias algo importante en el código, actualiza la documentación correspondiente.

### 2. **Un Solo Lugar para Cada Cosa**
Evita duplicar información. Si necesitas referenciar algo, usa enlaces a la documentación existente.

### 3. **Claridad Sobre Brevedad**
Es mejor ser claro y detallado que breve y confuso. Los futuros desarrolladores (incluido tú mismo) te lo agradecerán.

### 4. **Estado de Vigencia**
Marca claramente el estado de cada documento:
- ✅ **Vigente** - Información actual
- ⚠️ **Histórico** - Referencia histórica útil
- 📁 **Archivo** - Supersedido, pero conservado

---

## 🔄 Flujos de Trabajo

### Cuando Implementas una Nueva Funcionalidad

```
1. ¿Es un sistema completo?
   → Crea: docs/temporales/SISTEMA_[nombre].md
   
2. ¿Es una configuración?
   → Crea: docs/configuracion/CONFIGURACION_[nombre].md
   
3. ¿Es una mejora/optimización?
   → Crea: docs/mejoras/MEJORAS_[nombre].md
   
4. ¿Qué actualizar?
   ✓ El documento específico en la carpeta correspondiente
   ✓ README.md (si es funcionalidad principal)
   ✓ INDICE_DOCUMENTACION.md
   ✓ CHANGELOG.md
```

**Ejemplo:**
```markdown
# Acabas de implementar sistema de notificaciones push

1. Creas: docs/temporales/SISTEMA_NOTIFICACIONES_PUSH.md
2. Añades entrada en INDICE_DOCUMENTACION.md (categoría "Sistemas")
3. Actualizas README.md en "Características Principales"
4. Añades entrada en CHANGELOG.md
```

### Cuando Solucionas un Bug Importante

```
1. ¿Es un problema recurrente?
   → Crea: docs/temporales/SOLUCION_[problema].md
   
2. ¿Es un fix rápido?
   → Crea: docs/temporales/FIX_[problema].md
   
3. ¿Es un diagnóstico?
   → Crea: docs/diagnosticos/DIAGNOSTICO_[problema].md
   
4. ¿Qué actualizar?
   ✓ El documento de solución en la carpeta correspondiente
   ✓ INDICE_DOCUMENTACION.md (categoría apropiada)
   ✓ CHANGELOG.md
   ✓ docs/temporales/GUIA_DEBUGGING_IA.md si es problema de IA
```

**Ejemplo:**
```markdown
# Acabas de solucionar problema de caché en producción

1. Creas: docs/temporales/SOLUCION_CACHE_PRODUCCION.md
   - Describes el problema
   - Explicas la causa
   - Documentas la solución
   - Añades pasos de verificación

2. Añades en INDICE_DOCUMENTACION.md:
   | [docs/temporales/SOLUCION_CACHE_PRODUCCION.md] | Solución de problemas de caché | ✅ Vigente |

3. Actualizas CHANGELOG.md:
   ## [Patch 1.0.1] - 2025-XX-XX
   ### 🐛 Correcciones
   - Solucionado problema de caché en producción

4. Si aplica, referencias desde docs/deployment/GUIA_DEPLOYMENT_AWS.md en "Problemas Comunes"
```

### Cuando Haces un Refactor Grande

```
1. Documenta la razón del cambio
2. Actualiza CHANGELOG.md con sección "♻️ Refactor"
3. Actualiza documentos afectados
4. Si cambian rutas/nombres, actualiza TODOS los enlaces
5. Verifica que el INDICE_DOCUMENTACION.md esté actualizado
```

### Cuando un Documento Queda Obsoleto

```
NO LO BORRES - Márcalo como archivo histórico

1. Añade nota al principio del documento:
   > **⚠️ NOTA: Este documento es histórico.**  
   > La información actual está en: [nuevo-documento.md]

2. Actualiza INDICE_DOCUMENTACION.md:
   - Cambia estado a ⚠️ Histórico o 📁 Archivo
   
3. Actualiza CHANGELOG.md si es relevante

4. Mantén en su carpeta actual (docs/temporales/, docs/deployment/, etc.)
   Los documentos históricos se mantienen en sus carpetas originales
```

---

## 📝 Convenciones de Nombres

### Prefijos de Archivos

| Prefijo | Carpeta | Cuándo Usar | Ejemplo |
|---------|---------|-------------|---------|
| `SOLUCION_` | `docs/temporales/` | Solución definitiva de un problema | `docs/temporales/SOLUCION_ADMIN_AREAS_FINAL.md` |
| `FIX_` | `docs/temporales/` | Arreglo específico aplicado | `docs/temporales/FIX_IA_PRODUCCION.md` |
| `SISTEMA_` | `docs/temporales/` | Documentación de sistema completo | `docs/temporales/SISTEMA_DETECCION_DUPLICADOS.md` |
| `CONFIGURACION_` | `docs/configuracion/` | Guía de configuración | `docs/configuracion/CONFIGURACION_SUPABASE_URLS.md` |
| `DIAGNOSTICO_` | `docs/diagnosticos/` | Guía de diagnóstico | `docs/diagnosticos/DIAGNOSTICO_SESION_NO_PERSISTE.md` |
| `MEJORAS_` | `docs/mejoras/` | Mejoras y optimizaciones | `docs/mejoras/MEJORAS_COMPLETAS_SISTEMA_IA.md` |
| `GUIA_` | `docs/deployment/` o `docs/temporales/` | Guía paso a paso | `docs/deployment/GUIA_DEPLOYMENT_AWS.md` |
| (Sin prefijo) | Raíz | Documentos generales | `README.md`, `CHANGELOG.md` |

### Formato de Nombres

- **Mayúsculas** para archivos de documentación
- **Palabras separadas por guiones bajos** `_`
- **Descriptivo pero conciso**

**Buenos ejemplos:**
```
✅ docs/temporales/SISTEMA_NOTIFICACIONES_PUSH.md
✅ docs/temporales/SOLUCION_OAUTH_REDIRECT.md
✅ docs/configuracion/CONFIGURACION_ANALYTICS.md
✅ docs/temporales/FIX_DEPLOY_VARIABLES.md
✅ docs/mejoras/MEJORAS_RENDIMIENTO.md
✅ docs/diagnosticos/DIAGNOSTICO_CACHE.md
```

**Malos ejemplos:**
```
❌ sistema-notificaciones.md (minúsculas, sin carpeta)
❌ SOLUCION1.md (no descriptivo, sin carpeta)
❌ configuracion_de_google_analytics_y_tag_manager.md (demasiado largo)
❌ fix.md (demasiado genérico)
❌ docs/SISTEMA_NOTIFICACIONES.md (carpeta incorrecta)
```

---

## 📄 Estructura de Documentos

### Template Básico

```markdown
# [Emoji] Título del Documento

> **Estado:** ✅ Vigente / ⚠️ Histórico / 📁 Archivo  
> **Última actualización:** DD de mes de YYYY

---

## 🎯 Objetivo / Problema

[Descripción clara del propósito de este documento]

---

## [Secciones Principales]

[Contenido organizado con headers H2 y H3]

---

## ✅ Conclusión / Estado Final

[Resumen de lo documentado]

---

**[Información del autor/fecha si aplica]**
```

### Template para Soluciones

```markdown
# ✅ SOLUCIÓN: [Nombre del Problema]

**Estado:** ✅ Resuelto  
**Fecha:** DD de mes de YYYY

---

## 📋 Problema Identificado

[Descripción del problema]

### Síntomas:
- [Lista de síntomas observados]

---

## 🎯 Causa Raíz

[Explicación de por qué ocurre]

---

## ✅ Solución Implementada

[Descripción detallada de la solución]

### Archivos Modificados:
- [Lista de archivos]

### Pasos para Aplicar:
1. [Paso 1]
2. [Paso 2]
...

---

## 🧪 Verificación

[Cómo verificar que funciona]

---

## 📝 Notas Adicionales

[Información adicional relevante]

---

**Estado:** ✅ Completado y funcionando
```

### Template para Sistemas

```markdown
# 🔧 SISTEMA: [Nombre del Sistema]

**Versión:** 1.0  
**Última actualización:** DD de mes de YYYY

---

## 📋 Descripción

[Qué es y para qué sirve este sistema]

---

## 🏗️ Arquitectura

[Diagrama o descripción de componentes]

---

## 🔧 Implementación

[Detalles técnicos de cómo está implementado]

### Archivos Principales:
- [Lista de archivos]

### Base de Datos:
- [Tablas involucradas]

---

## 💡 Cómo Usar

[Instrucciones de uso]

---

## 🧪 Testing

[Cómo probar que funciona]

---

## 📝 Mantenimiento

[Consideraciones para mantener el sistema]

---

**Estado:** ✅ Operativo
```

---

## 🔍 Checklist de Revisión

### Antes de Crear un Nuevo Documento

- [ ] ¿Ya existe un documento similar?
- [ ] ¿Puedo añadir esta información a un doc existente?
- [ ] ¿He elegido el prefijo correcto?
- [ ] ¿El nombre es descriptivo?

### Al Crear un Documento

- [ ] Título claro con emoji apropiado
- [ ] Estado de vigencia indicado
- [ ] Fecha de creación/actualización
- [ ] Estructura organizada con headers
- [ ] Ejemplos donde sea necesario
- [ ] Referencias cruzadas a docs relacionados

### Después de Crear un Documento

- [ ] Añadido a INDICE_DOCUMENTACION.md
- [ ] Actualizado README.md (si es principal)
- [ ] Actualizado CHANGELOG.md
- [ ] Enlaces verificados
- [ ] Ortografía revisada

### Al Actualizar un Documento

- [ ] Fecha de actualización cambiada
- [ ] Información obsoleta eliminada o marcada
- [ ] Nuevos enlaces verificados
- [ ] Consistencia con otros docs
- [ ] CHANGELOG.md actualizado si es cambio significativo

---

## 🎨 Uso de Emojis

Los emojis ayudan a identificar rápidamente el tipo de información:

| Emoji | Uso |
|-------|-----|
| 📋 | Listas, índices |
| 🎯 | Objetivos, metas |
| ✅ | Completado, exitoso |
| ❌ | Error, fallo |
| ⚠️ | Advertencia, histórico |
| 🔧 | Configuración, herramientas |
| 🚀 | Deployment, lanzamiento |
| 🐛 | Bugs, problemas |
| 💡 | Tips, recomendaciones |
| 📊 | Estadísticas, tablas |
| 🔍 | Búsqueda, investigación |
| 📝 | Notas, documentación |
| 🎉 | Lanzamientos, celebraciones |
| 🔐 | Seguridad |
| 🗺️ | Mapas, navegación |
| 🤖 | IA, automatización |
| 📚 | Documentación, guías |

---

## 🔗 Enlaces y Referencias

### Formato de Enlaces

**Interno (mismo repositorio):**
```markdown
# Desde raíz
[Texto del enlace](./NOMBRE_ARCHIVO.md)
[docs/configuracion/CONFIGURACION_SEO.md](./docs/configuracion/CONFIGURACION_SEO.md)

# Desde dentro de docs/
[Texto del enlace](../README.md)
[Otra carpeta](../deployment/GUIA_DEPLOYMENT_AWS.md)

# Sección específica
[Sección específica](./ARCHIVO.md#seccion)
```

**Externo:**
```markdown
[Texto del enlace](https://url-completa.com)
```

### Mejores Prácticas

1. **Usa rutas relativas** para docs internos
2. **Verifica que los enlaces funcionen** antes de commit
3. **Actualiza TODOS los enlaces** si renombras un archivo
4. **Usa texto descriptivo** en lugar de "click aquí"

**Ejemplo bueno:**
```markdown
Consulta la [guía de deployment en AWS](./docs/deployment/GUIA_DEPLOYMENT_AWS.md) para más detalles.
```

**Ejemplo malo:**
```markdown
Para más información [click aquí](./GUIA_DEPLOYMENT_AWS.md).
```

---

## 📅 Frecuencia de Revisión

### Revisión Trimestral (Cada 3 meses)

- [ ] Revisar todos los documentos ✅ Vigentes
- [ ] Verificar que la información sigue siendo precisa
- [ ] Actualizar fechas de última revisión
- [ ] Marcar docs obsoletos como ⚠️ Histórico

### Revisión Anual

- [ ] Auditoría completa de documentación
- [ ] Reorganización si es necesario
- [ ] Actualización de INDICE_DOCUMENTACION.md
- [ ] Archivar documentos muy antiguos

### Después de Cada Release

- [ ] Actualizar README.md con nuevas features
- [ ] Actualizar CHANGELOG.md
- [ ] Crear RELEASE_NOTES si es major version
- [ ] Revisar docs de instalación y setup

---

## 🚨 Señales de que la Documentación Necesita Mantenimiento

- ❌ Hay múltiples docs con información similar
- ❌ Los desarrolladores nuevos tienen muchas preguntas sobre cosas "documentadas"
- ❌ Enlaces rotos en varios documentos
- ❌ Documentos con más de 6 meses sin actualizar
- ❌ Información contradictoria entre documentos
- ❌ El README está desactualizado respecto al código

**Acción:** Programa una sesión de mantenimiento de docs

---

## 💾 Backup y Versionado

### Git es tu Backup

La documentación está versionada con Git, lo que significa:
- ✅ Historial completo de cambios
- ✅ Puedes revertir cambios
- ✅ Puedes ver quién cambió qué y cuándo

### Tags para Releases

Cuando hagas un release importante, usa tags:
```bash
git tag -a v1.0.0 -m "Release BETA 1.0"
git push origin v1.0.0
```

---

## 🎓 Recursos Adicionales

### Markdown
- [Guía de Markdown](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

### Escritura Técnica
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Microsoft Writing Style Guide](https://docs.microsoft.com/en-us/style-guide/)

### Organización
- [Documentation System by Divio](https://documentation.divio.com/)

---

## ✅ Checklist Final

Al finalizar cualquier cambio en documentación:

- [ ] Documentos nuevos añadidos al índice
- [ ] README.md actualizado si es necesario
- [ ] CHANGELOG.md actualizado
- [ ] Enlaces verificados y funcionales
- [ ] Ortografía y gramática revisadas
- [ ] Consistencia con convenciones del proyecto
- [ ] Fecha de actualización modificada
- [ ] Commit descriptivo realizado

---

## 📞 ¿Dudas?

Si tienes dudas sobre cómo documentar algo:

1. Consulta documentos similares existentes
2. Revisa esta guía
3. Consulta el [INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md)
4. En caso de duda, documenta de más que de menos

**Recuerda:** Es mejor tener documentación imperfecta que no tener documentación.

---

**Guía creada:** 28 de octubre de 2025  
**Última actualización:** 13 de noviembre de 2025  
**Mantenedor:** Equipo Mapa Furgocasa  
**Versión:** 2.0


