#!/bin/bash

# Script de deployment para versión 1.0.0

echo "🚀 Desplegando versión 1.0.0..."

# Add all changes
git add -A

# Commit with detailed message
git commit -m "feat: Version 1.0.0 - Sistema completo operativo

🎉 HITO: Primera version en produccion 100% funcional

CHATBOT TIO VIAJERO IA:
✅ Sistema completo operativo con GPT-4o-mini
✅ Function Calling con 3 funciones (search, details, by_country)
✅ Editor de prompts multiples en /admin/configuracion
✅ Variables de entorno configuradas en AWS Amplify
✅ Politicas RLS implementadas correctamente
✅ Links clicables en Google Maps
✅ Posicion movil ajustada (no tapa boton lista)

DOCUMENTACION:
✅ README.md actualizado a v1.0
✅ CHANGELOG.md completo con historial
✅ chatbot/VERSION_1.0_FEATURES.md con todas las features
✅ chatbot/PROBLEMA_RESUELTO.md documentado
✅ Migraciones SQL documentadas

MEJORAS UX:
✅ Widget del chatbot mas arriba en movil (bottom-24)
✅ No tapa boton de lista en mapa ni rutas
✅ Responsive md:bottom-6 para desktop

FIX:
- Posicion del widget flotante ajustada para movil
- Links de Google Maps ahora clicables
- Editor de prompts completamente funcional
- RLS policies correctamente configuradas"

# Push to main
git push origin main

echo "✅ Deploy completado!"

