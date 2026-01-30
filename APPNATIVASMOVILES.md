# 📱 Plan de Implementación: App Nativa Móvil Mapa Furgocasa

> **Estado:** Planificado para futuro próximo  
> **Fecha documento:** 21 de Noviembre de 2025  
> **Tecnología seleccionada:** React Native + Expo  

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Decisión Estratégica](#decisión-estratégica)
3. [Tecnología: Por qué React Native](#tecnología-por-qué-react-native)
4. [Arquitectura Propuesta](#arquitectura-propuesta)
5. [Ventajas sobre PWA](#ventajas-sobre-pwa)
6. [Funcionalidades Nativas](#funcionalidades-nativas)
7. [Plan de Implementación Paso a Paso](#plan-de-implementación-paso-a-paso)
8. [Estructura de Carpetas](#estructura-de-carpetas)
9. [Componentes Compartidos](#componentes-compartidos)
10. [Costes y Tiempos](#costes-y-tiempos)
11. [Publicación en Tiendas](#publicación-en-tiendas)
12. [Mantenimiento y Actualizaciones](#mantenimiento-y-actualizaciones)
13. [Checklist Pre-desarrollo](#checklist-pre-desarrollo)

---

## 🎯 Resumen Ejecutivo

**Objetivo:** Crear una aplicación móvil nativa para iOS y Android que complemente la versión web actual (PWA), proporcionando capacidades nativas avanzadas que una PWA no puede ofrecer.

**Enfoque decidido:**
- ✅ Mantener PWA como base durante 3-6 meses
- ✅ Desarrollar app nativa en paralelo sin afectar la web
- ✅ Compartir máximo código entre web y móvil
- ✅ Publicar en App Store y Google Play cuando esté lista

**No se hará:**
- ❌ Versión Electron para escritorio (usuarios usarán la web)
- ❌ Eliminar la PWA (convivirán ambas versiones)

---

## 🤔 Decisión Estratégica

### Contexto de la Decisión

Durante la evaluación, se consideraron tres opciones:

1. **Electron** → Descartado (solo funciona en Windows/Mac/Linux, no en móviles)
2. **PWA mejorada** → Actual (funciona pero con limitaciones nativas)
3. **React Native** → ✅ Seleccionada (app nativa con capacidades completas)

### Por qué NO Electron

Aunque Electron ofrece capacidades nativas excelentes, **solo funciona en escritorio**:
- ✅ Windows, macOS, Linux
- ❌ iOS, Android

Como el objetivo principal es **móviles** y los usuarios de escritorio pueden usar la web sin problemas, Electron no es la solución adecuada.

### Por qué React Native

React Native es el "Electron de los móviles":
- ✅ Genera apps nativas reales para iOS y Android
- ✅ Usa React (mismo framework que nuestra app web)
- ✅ Permite compartir ~70% del código con la web
- ✅ Acceso completo a APIs nativas del sistema operativo
- ✅ Auto-actualizaciones OTA (Over The Air) sin pasar por tiendas
- ✅ Comunidad enorme y mantenimiento activo

---

## 🔧 Tecnología: Por qué React Native

### Comparación con Alternativas

| Característica | PWA Actual | React Native | Capacitor | Flutter |
|----------------|-----------|--------------|-----------|---------|
| **Lenguaje** | JavaScript/React | JavaScript/React | JavaScript/React | Dart |
| **Rendimiento** | Bueno | Excelente | Bueno | Excelente |
| **Acceso nativo** | ⚠️ Limitado | ✅ Total | ✅ Total | ✅ Total |
| **Reutilizar código web** | 100% | ~70% | ~90% | 0% |
| **Curva aprendizaje** | Ninguna | Baja | Muy baja | Alta |
| **Tamaño app** | 2 MB | 40-60 MB | 30-50 MB | 15-30 MB |
| **Comunidad** | Grande | Enorme | Mediana | Grande |
| **Mantenimiento** | Fácil | Medio | Medio | Medio |
| **Hot Reload** | ✅ | ✅ | ⚠️ | ✅ |

**Decisión:** React Native + Expo por:
1. Balance perfecto entre rendimiento y reutilización de código
2. Usa React (ya lo dominamos)
3. Expo facilita enormemente el desarrollo y deployment
4. Actualizaciones OTA incluidas de serie

---

## 🏗️ Arquitectura Propuesta

### Ecosistema Completo Mapa Furgocasa

```
┌─────────────────────────────────────────────────────────────┐
│                  MAPA FURGOCASA ECOSYSTEM                    │
└─────────────────────────────────────────────────────────────┘

                        ┌─────────────┐
                        │   SUPABASE  │
                        │  (Backend)  │
                        └──────┬──────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼──────┐
         │  WEB (PWA) │ │   iOS App  │ │ Android   │
         │   Next.js  │ │React Native│ │   App     │
         └────────────┘ └────────────┘ └───────────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
                        ┌──────▼──────┐
                        │   SHARED    │
                        │ Components  │
                        │  & Logic    │
                        └─────────────┘
```

### Flujo de Datos

```
Usuario Móvil
    ↓
React Native App
    ↓
Shared Business Logic ←→ Supabase API
    ↓
UI Components (Platform-specific)
    ↓
Native APIs (GPS, Files, Camera, etc.)
```

---

## ⚡ Ventajas sobre PWA

### Capacidades que PWA NO tiene

| Funcionalidad | PWA | React Native | Impacto en Mapa Furgocasa |
|---------------|-----|--------------|---------------------------|
| **GPS en segundo plano** | ❌ | ✅ | Tracking de rutas mientras app está cerrada |
| **Almacenamiento ilimitado** | ⚠️ ~50MB | ✅ Ilimitado | Guardar mapas offline completos |
| **Sistema de archivos real** | ❌ | ✅ | Exportar/importar GPX, guardar fotos |
| **Notificaciones enriquecidas** | ⚠️ Básicas | ✅ Completas | Alertas con imágenes, acciones, sonidos |
| **Biometría (Face ID/Huella)** | ❌ | ✅ | Login seguro instantáneo |
| **Cámara avanzada** | ⚠️ Básica | ✅ | Scanner QR, fotos con metadatos GPS |
| **Offline total** | ⚠️ Cache | ✅ SQLite | Base de datos completa offline |
| **Pagos in-app** | ⚠️ Web | ✅ Nativos | Suscripciones con Apple/Google Pay |
| **Compartir nativo** | ❌ | ✅ | Compartir áreas a otras apps |
| **Widgets** | ❌ | ✅ | Widget en pantalla inicio con áreas cercanas |
| **Deep linking** | ⚠️ Limitado | ✅ | Abrir área específica desde cualquier app |
| **Rendimiento** | Bueno | Excelente | Mapas más fluidos, sin lag |

---

## 🚀 Funcionalidades Nativas

### Funcionalidades Prioritarias (MVP)

#### 1. **Tracking GPS en Segundo Plano**
```javascript
// Ejemplo de implementación
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask('background-location', ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  const { locations } = data;
  // Guardar ruta incluso con app cerrada
  guardarPuntosRuta(locations);
});

await Location.startLocationUpdatesAsync('background-location', {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000,
  distanceInterval: 10
});
```

**Casos de uso:**
- Grabar ruta automáticamente durante viaje
- Alertar cuando hay áreas cercanas
- Generar estadísticas de kilómetros recorridos

---

#### 2. **Mapas Offline Completos**
```javascript
import * as FileSystem from 'expo-file-system';

// Descargar tiles de mapa para uso offline
const descargarMapaOffline = async (region) => {
  const tiles = calcularTilesNecesarios(region);
  
  for (const tile of tiles) {
    const uri = `https://maps.googleapis.com/tile/${tile}`;
    const localUri = `${FileSystem.documentDirectory}mapas/${tile}.png`;
    await FileSystem.downloadAsync(uri, localUri);
  }
};
```

**Casos de uso:**
- Viajar sin datos móviles
- Uso en zonas sin cobertura
- Reducir consumo de datos

---

#### 3. **Sincronización Inteligente**
```javascript
import NetInfo from '@react-native-community/netinfo';

// Sincronizar solo con WiFi para ahorrar datos
const sincronizarAutomatico = async () => {
  const state = await NetInfo.fetch();
  
  if (state.type === 'wifi' && state.isConnected) {
    await sincronizarAreas();
    await descargarImagenesAreasPendientes();
    await subirValoracionesPendientes();
  }
};
```

---

#### 4. **Almacenamiento Seguro de Credenciales**
```javascript
import * as SecureStore from 'expo-secure-store';

// Equivalente a Electron's safeStorage
// Usa Keychain (iOS) y Keystore (Android)
const guardarCredenciales = async (token) => {
  await SecureStore.setItemAsync('auth_token', token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED
  });
};
```

---

#### 5. **Exportar/Importar GPX con Sistema de Archivos**
```javascript
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

// Importar ruta GPX
const importarGPX = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/gpx+xml'
  });
  
  if (result.type === 'success') {
    const content = await FileSystem.readAsStringAsync(result.uri);
    procesarRutaGPX(content);
  }
};

// Exportar ruta
const exportarRuta = async (gpxData) => {
  const uri = FileSystem.cacheDirectory + 'mi_ruta.gpx';
  await FileSystem.writeAsStringAsync(uri, gpxData);
  await Sharing.shareAsync(uri);
};
```

---

#### 6. **Cámara con Metadatos GPS**
```javascript
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const tomarFotoArea = async () => {
  const foto = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    exif: true // Incluir metadatos GPS
  });
  
  const location = await Location.getCurrentPositionAsync();
  
  guardarFotoConUbicacion({
    uri: foto.uri,
    coordenadas: location.coords,
    timestamp: Date.now()
  });
};
```

---

#### 7. **Notificaciones Push Nativas**
```javascript
import * as Notifications from 'expo-notifications';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notificar nueva área cercana
const notificarAreaCercana = async (area) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📍 Área cercana',
      body: `${area.nombre} a ${area.distancia}km`,
      data: { areaId: area.id },
      sound: true,
      badge: 1,
    },
    trigger: null, // Inmediata
  });
};
```

---

#### 8. **Biometría para Login**
```javascript
import * as LocalAuthentication from 'expo-local-authentication';

const loginBiometrico = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const guardado = await LocalAuthentication.isEnrolledAsync();
  
  if (compatible && guardado) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Accede a Mapa Furgocasa',
      fallbackLabel: 'Usar contraseña',
    });
    
    if (result.success) {
      // Recuperar token guardado de forma segura
      const token = await SecureStore.getItemAsync('auth_token');
      iniciarSesion(token);
    }
  }
};
```

---

### Funcionalidades Avanzadas (Fase 2)

#### 9. **Widget en Pantalla de Inicio**
```javascript
// iOS Widget (Swift UI) + Android Widget
// Mostrar área más cercana sin abrir app
```

#### 10. **Apple CarPlay / Android Auto**
```javascript
// Integración con sistemas de coche
// Navegación directa a áreas desde la pantalla del coche
```

#### 11. **Modo Offline First**
```javascript
// Base de datos SQLite local
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mapafurgocasa.db');

// Sincronización bidireccional con Supabase
const sincronizarBidireccional = async () => {
  // 1. Subir cambios locales
  // 2. Descargar cambios remotos
  // 3. Resolver conflictos
};
```

---

## 📐 Plan de Implementación Paso a Paso

### Fase 0: Preparación (1 semana)

**Objetivos:**
- Configurar cuentas de desarrollador
- Preparar estructura de proyecto
- Refactorizar componentes para ser compartibles

**Tareas:**
- [ ] Registrarse en Apple Developer Program ($99/año)
- [ ] Registrarse en Google Play Console ($25 una vez)
- [ ] Instalar Xcode (Mac necesario para iOS)
- [ ] Instalar Android Studio
- [ ] Configurar Expo CLI
- [ ] Crear nuevo proyecto Expo
- [ ] Configurar repositorio Git (puede ser mismo repo)

**Comandos:**
```bash
# Instalar herramientas
npm install -g expo-cli eas-cli

# Crear proyecto
npx create-expo-app@latest mapa-furgocasa-mobile --template blank-typescript

# Inicializar EAS (Expo Application Services)
cd mapa-furgocasa-mobile
eas init
eas build:configure
```

---

### Fase 1: Estructura Base (1 semana)

**Objetivos:**
- Crear estructura de carpetas
- Configurar navegación
- Implementar autenticación básica

**Tareas:**
- [ ] Configurar React Navigation
- [ ] Crear pantallas principales (Mapa, Listado, Perfil)
- [ ] Integrar Supabase Auth
- [ ] Implementar almacenamiento seguro de tokens
- [ ] Configurar variables de entorno

**Estructura:**
```
mobile-app/
├── app.json                 # Config Expo
├── App.tsx                  # Entry point
├── src/
│   ├── screens/            # Pantallas
│   │   ├── MapaScreen.tsx
│   │   ├── ListadoAreasScreen.tsx
│   │   ├── DetalleAreaScreen.tsx
│   │   ├── PerfilScreen.tsx
│   │   └── LoginScreen.tsx
│   ├── navigation/         # Navegación
│   │   └── RootNavigator.tsx
│   ├── services/           # APIs
│   │   ├── supabase.ts
│   │   ├── location.ts
│   │   └── storage.ts
│   ├── hooks/              # Hooks reutilizables
│   └── types/              # TypeScript types
└── shared/                 # ⬅️ Enlazado desde ../
    ├── components/
    ├── utils/
    └── constants/
```

---

### Fase 2: Funcionalidades Core (2 semanas)

**Objetivos:**
- Mapa interactivo funcionando
- Listado de áreas
- Detalle de área con imágenes

**Tareas:**
- [ ] Integrar React Native Maps
- [ ] Implementar marcadores de áreas
- [ ] Clustering de marcadores
- [ ] Sistema de filtros (compartido con web)
- [ ] Detalle de área con galería
- [ ] Sistema de valoraciones

**Dependencias clave:**
```json
{
  "dependencies": {
    "react-native-maps": "^1.7.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "expo-location": "~16.0.0",
    "expo-secure-store": "~12.0.0",
    "expo-file-system": "~15.0.0"
  }
}
```

---

### Fase 3: Funcionalidades Nativas (2 semanas)

**Objetivos:**
- GPS en segundo plano
- Almacenamiento offline
- Notificaciones push

**Tareas:**
- [ ] Tracking GPS background
- [ ] Descargar mapas offline
- [ ] Base de datos SQLite local
- [ ] Sincronización Supabase ↔ SQLite
- [ ] Notificaciones push con Expo
- [ ] Gestión de permisos nativos

---

### Fase 4: Features Avanzadas (2 semanas)

**Objetivos:**
- Exportar/importar GPX
- Cámara con geotagging
- Biometría
- Compartir nativo

**Tareas:**
- [ ] Lector/escritor GPX
- [ ] Cámara con metadatos GPS
- [ ] Login con Face ID/Huella
- [ ] Compartir áreas a otras apps
- [ ] Deep linking (abrir área desde link)
- [ ] Modo oscuro

---

### Fase 5: Testing y Optimización (1 semana)

**Objetivos:**
- Testing en dispositivos reales
- Optimización de rendimiento
- Fix de bugs

**Tareas:**
- [ ] Testear en iPhone físico (iOS)
- [ ] Testear en Android físico
- [ ] Optimizar consumo de batería
- [ ] Optimizar uso de memoria
- [ ] Reducir tamaño de app
- [ ] Testing offline completo

---

### Fase 6: Preparación para Tiendas (1 semana)

**Objetivos:**
- Screenshots y assets
- Descripciones en tiendas
- Videos promocionales

**Tareas:**
- [ ] Capturas de pantalla (iPhone, iPad, Android)
- [ ] Icono app en todas las resoluciones
- [ ] Splash screen
- [ ] Descripción App Store (ES/EN)
- [ ] Descripción Google Play (ES/EN)
- [ ] Video preview (opcional)
- [ ] Política de privacidad
- [ ] Términos y condiciones

---

### Fase 7: Publicación (1-2 semanas)

**Objetivos:**
- Subir a tiendas
- Superar revisiones

**Tareas:**
- [ ] Build de producción iOS
- [ ] Build de producción Android
- [ ] Subir a App Store Connect
- [ ] Subir a Google Play Console
- [ ] Esperar revisión (1-3 días Google, 1-7 días Apple)
- [ ] Publicar cuando se apruebe

---

## 📁 Estructura de Carpetas

### Estructura Completa del Proyecto

```
NEW MAPA FURGOCASA/
│
├── 🌐 WEB (Next.js) - ACTUAL, NO TOCAR
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── 📱 MOBILE (React Native) - NUEVO
│   ├── mobile-app/
│   │   ├── app.json
│   │   ├── App.tsx
│   │   ├── eas.json
│   │   ├── package.json
│   │   │
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── mapa/
│   │   │   │   │   ├── MapaScreen.tsx
│   │   │   │   │   └── MapaOfflineScreen.tsx
│   │   │   │   ├── areas/
│   │   │   │   │   ├── ListadoAreasScreen.tsx
│   │   │   │   │   ├── DetalleAreaScreen.tsx
│   │   │   │   │   └── NuevaAreaScreen.tsx
│   │   │   │   ├── rutas/
│   │   │   │   │   ├── MisRutasScreen.tsx
│   │   │   │   │   ├── CrearRutaScreen.tsx
│   │   │   │   │   └── TrackingScreen.tsx
│   │   │   │   ├── perfil/
│   │   │   │   │   ├── PerfilScreen.tsx
│   │   │   │   │   ├── ConfiguracionScreen.tsx
│   │   │   │   │   └── MisVehiculosScreen.tsx
│   │   │   │   └── auth/
│   │   │   │       ├── LoginScreen.tsx
│   │   │   │       └── RegisterScreen.tsx
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   ├── RootNavigator.tsx
│   │   │   │   ├── TabNavigator.tsx
│   │   │   │   └── StackNavigators.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── mapa/
│   │   │   │   │   ├── MapView.tsx
│   │   │   │   │   ├── AreaMarker.tsx
│   │   │   │   │   └── ClusterMarker.tsx
│   │   │   │   ├── areas/
│   │   │   │   │   ├── AreaCard.tsx
│   │   │   │   │   ├── AreaGallery.tsx
│   │   │   │   │   └── FiltrosAreas.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Card.tsx
│   │   │   │       └── Input.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── supabase/
│   │   │   │   │   ├── client.ts
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   ├── areas.ts
│   │   │   │   │   └── sync.ts
│   │   │   │   ├── storage/
│   │   │   │   │   ├── secureStore.ts
│   │   │   │   │   ├── fileSystem.ts
│   │   │   │   │   └── database.ts
│   │   │   │   ├── location/
│   │   │   │   │   ├── gps.ts
│   │   │   │   │   ├── backgroundTracking.ts
│   │   │   │   │   └── geofencing.ts
│   │   │   │   ├── notifications/
│   │   │   │   │   └── pushNotifications.ts
│   │   │   │   └── maps/
│   │   │   │       └── offlineTiles.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useLocation.ts
│   │   │   │   ├── useAreas.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useOfflineSync.ts
│   │   │   │   └── useBiometrics.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── useStore.ts         # Zustand store
│   │   │   │   ├── slices/
│   │   │   │   │   ├── authSlice.ts
│   │   │   │   │   ├── areasSlice.ts
│   │   │   │   │   └── settingsSlice.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── gpx.ts
│   │   │   │   ├── geocoding.ts
│   │   │   │   └── formatters.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── area.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── navigation.ts
│   │   │   │
│   │   │   └── constants/
│   │   │       ├── config.ts
│   │   │       └── theme.ts
│   │   │
│   │   └── assets/
│   │       ├── images/
│   │       ├── fonts/
│   │       └── icons/
│   │
│   └── docs/
│       └── MOBILE_DEV_GUIDE.md
│
└── 🔄 SHARED (Código compartido) - NUEVO
    ├── shared/
    │   ├── components/          # Componentes UI cross-platform
    │   │   ├── AreaInfo.tsx
    │   │   ├── Filtros.tsx
    │   │   └── Valoracion.tsx
    │   │
    │   ├── business-logic/      # Lógica de negocio
    │   │   ├── calcularDistancia.ts
    │   │   ├── validarArea.ts
    │   │   └── formatearDatos.ts
    │   │
    │   ├── types/               # Types TypeScript compartidos
    │   │   ├── database.ts
    │   │   ├── api.ts
    │   │   └── models.ts
    │   │
    │   ├── utils/               # Utilidades compartidas
    │   │   ├── dates.ts
    │   │   ├── strings.ts
    │   │   └── validation.ts
    │   │
    │   └── constants/
    │       ├── paises.ts
    │       └── servicios.ts
    │
    └── README_SHARED.md
```

---

## 🔄 Componentes Compartidos

### Estrategia de Código Compartido

**Objetivo:** Compartir ~70% del código entre web y móvil.

#### Qué SÍ se puede compartir:

✅ **Lógica de negocio** (100% compartible)
```typescript
// shared/business-logic/calcularRuta.ts
export const calcularDistanciaTotal = (puntos: Coordenada[]): number => {
  // Funciona igual en web y móvil
};
```

✅ **Validaciones** (100% compartible)
```typescript
// shared/utils/validation.ts
export const validarCoordenadasEspana = (lat: number, lng: number): boolean => {
  return lat >= 36 && lat <= 43.8 && lng >= -9.3 && lng <= 3.3;
};
```

✅ **Types TypeScript** (100% compartible)
```typescript
// shared/types/area.ts
export interface Area {
  id: string;
  nombre: string;
  coordenadas: { lat: number; lng: number };
  servicios: string[];
  // ...
}
```

✅ **Constantes** (100% compartible)
```typescript
// shared/constants/servicios.ts
export const SERVICIOS_DISPONIBLES = [
  'agua',
  'electricidad',
  'vaciado_grises',
  // ...
];
```

✅ **API Calls** (95% compartible)
```typescript
// shared/services/areasAPI.ts
export const obtenerAreas = async (filtros: Filtros): Promise<Area[]> => {
  const { data } = await supabase
    .from('areas')
    .select('*')
    .eq('pais', filtros.pais);
  return data;
};
```

⚠️ **Componentes UI** (30-50% compartible con adaptaciones)
```typescript
// shared/components/AreaCard.tsx
// Necesita adaptación según plataforma

// Web: usa divs y CSS
// Móvil: usa View y StyleSheet
```

❌ **No compartible:**
- Navegación (diferente entre Next.js y React Navigation)
- Componentes nativos específicos (Maps, Camera, etc.)
- Estilos (CSS vs StyleSheet)

---

### Ejemplo de Componente Compartido

```typescript
// shared/components/AreaInfo/AreaInfo.tsx
import React from 'react';
import { Area } from '../../types/area';

// Props compartidas
interface AreaInfoProps {
  area: Area;
  onPress?: () => void;
}

// Lógica compartida
export const useAreaInfo = (area: Area) => {
  const distancia = calcularDistancia(userLocation, area.coordenadas);
  const serviciosFormateados = formatearServicios(area.servicios);
  
  return { distancia, serviciosFormateados };
};

// Exportar solo la lógica
export type { AreaInfoProps };
```

```tsx
// Web: app/components/AreaCard.tsx
import { useAreaInfo, AreaInfoProps } from '@shared/components/AreaInfo';

export const AreaCard: React.FC<AreaInfoProps> = ({ area }) => {
  const { distancia, serviciosFormateados } = useAreaInfo(area);
  
  return (
    <div className="card">
      <h3>{area.nombre}</h3>
      <p>{distancia} km</p>
      {/* ... */}
    </div>
  );
};
```

```tsx
// Móvil: mobile-app/src/components/AreaCard.tsx
import { View, Text } from 'react-native';
import { useAreaInfo, AreaInfoProps } from '@shared/components/AreaInfo';

export const AreaCard: React.FC<AreaInfoProps> = ({ area }) => {
  const { distancia, serviciosFormateados } = useAreaInfo(area);
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{area.nombre}</Text>
      <Text>{distancia} km</Text>
      {/* ... */}
    </View>
  );
};
```

---

## 💰 Costes y Tiempos

### Costes Iniciales

| Concepto | Coste | Frecuencia | Obligatorio |
|----------|-------|------------|-------------|
| **Apple Developer** | $99 | Anual | ✅ Sí (iOS) |
| **Google Play** | $25 | Única vez | ✅ Sí (Android) |
| **Mac (para iOS)** | €0* | - | ✅ Sí** |
| **Expo EAS Build*** | $0 | - | ❌ No (plan gratuito suficiente) |

\* Asumiendo que ya tienes Mac  
\** Puedes usar Mac Cloud (Expo, GitHub Actions) pero más lento  
\*** Expo EAS: 1 build iOS + 1 Android gratis/mes, suficiente para desarrollo

**Total mínimo:** $124 primer año, $99/año siguientes

---

### Costes Opcionales (Recomendados)

| Concepto | Coste | Beneficio |
|----------|-------|-----------|
| **Expo Pro Plan** | $29/mes | Builds ilimitadas + soporte prioritario |
| **CodePush/EAS Updates** | Incluido | Actualizaciones instantáneas sin App Store |
| **Sentry (errores)** | $0-26/mes | Monitoreo de crashes en producción |
| **App Store Optimization** | €300-1000 | Marketing, más descargas |

---

### Tiempos de Desarrollo

| Fase | Duración | Acumulado |
|------|----------|-----------|
| Fase 0: Preparación | 1 semana | 1 semana |
| Fase 1: Estructura Base | 1 semana | 2 semanas |
| Fase 2: Funcionalidades Core | 2 semanas | 4 semanas |
| Fase 3: Funcionalidades Nativas | 2 semanas | 6 semanas |
| Fase 4: Features Avanzadas | 2 semanas | 8 semanas |
| Fase 5: Testing | 1 semana | 9 semanas |
| Fase 6: Preparación Tiendas | 1 semana | 10 semanas |
| Fase 7: Publicación + Revisión | 1-2 semanas | 11-12 semanas |

**Total: ~3 meses** (con 1 desarrollador a tiempo completo)

---

### Desglose por Rol

Si se contrata equipo:

| Rol | Tiempo | Coste (España, aprox) |
|-----|--------|----------------------|
| **Desarrollador React Native Senior** | 3 meses | €15.000 - €24.000 |
| **Diseñador UI/UX Mobile** | 2 semanas | €2.000 - €4.000 |
| **QA Tester** | 2 semanas | €1.500 - €3.000 |

**Total con equipo:** €18.500 - €31.000

**Alternativa:** Desarrollar internamente (coste = tiempo del equipo)

---

## 📲 Publicación en Tiendas

### App Store (iOS)

#### Requisitos Previos
1. **Apple Developer Account** ($99/año)
2. **Mac con Xcode** (obligatorio)
3. **Certificados y Provisioning Profiles** (Expo EAS los maneja automáticamente)

#### Proceso Paso a Paso

1. **Preparar Assets**
```bash
# Generar iconos en todos los tamaños requeridos
# App Icon: 1024x1024 px (sin transparencia)
# Splash Screen: varios tamaños
```

2. **Build de Producción**
```bash
# Con Expo EAS
eas build --platform ios --profile production

# Esto genera un .ipa que se sube automáticamente a App Store Connect
```

3. **Completar Información en App Store Connect**
   - **Nombre de la app:** "Mapa Furgocasa"
   - **Subtítulo:** "Áreas para Autocaravanas"
   - **Categoría:** Viajes
   - **Capturas de pantalla:**
     - iPhone 6.7": 5 capturas mínimo
     - iPhone 6.5": 5 capturas mínimo
     - iPad Pro 12.9": 5 capturas (opcional pero recomendado)
   - **Descripción:** (max 4000 caracteres)
   - **Palabras clave:** "autocaravana, camper, áreas, españa, viajes"
   - **URL soporte:** https://www.mapafurgocasa.com/soporte
   - **URL privacidad:** https://www.mapafurgocasa.com/privacidad

4. **Información de Revisión**
   - **Cuenta de prueba:** Crear usuario demo con datos de prueba
   - **Notas para el revisor:** Explicar funcionalidades principales
   - **Permisos:** Justificar por qué se pide GPS, cámara, etc.

5. **Enviar a Revisión**
   - Primera revisión: 1-7 días (típicamente 24-48h)
   - Re-envíos: 1-2 días

6. **Posibles Rechazos Comunes y Soluciones**
   - ❌ "App crashes on launch" → Testear en todos los dispositivos
   - ❌ "Location permission not justified" → Añadir mensaje claro
   - ❌ "Incomplete functionality" → Asegurar que todo funciona en demo

---

### Google Play (Android)

#### Requisitos Previos
1. **Google Play Console Account** ($25 pago único)
2. **Ningún hardware específico necesario**

#### Proceso Paso a Paso

1. **Build de Producción**
```bash
# Con Expo EAS
eas build --platform android --profile production

# Esto genera un .aab (Android App Bundle)
```

2. **Crear App en Google Play Console**
   - **Nombre:** "Mapa Furgocasa"
   - **Descripción corta:** (max 80 caracteres)
   - **Descripción completa:** (max 4000 caracteres)
   - **Categoría:** Viajes y lugares
   - **Capturas de pantalla:**
     - Teléfono: mínimo 2 (recomendado 8)
     - Tablet 7": opcional
     - Tablet 10": opcional
   - **Icono:** 512x512 px
   - **Feature graphic:** 1024x500 px (aparece en búsquedas)

3. **Configurar Producción**
   - **Países:** Seleccionar España + otros países de interés
   - **Clasificación de contenido:** Completar cuestionario
   - **Precio:** Gratis (o de pago si aplica)
   - **Público objetivo:** Mayores de 3 años
   - **Políticas de privacidad:** URL obligatoria

4. **Subir APK/AAB**
   - Subir a "Producción" o "Prueba cerrada" primero
   - Esperar análisis automático (minutos)

5. **Enviar a Revisión**
   - Primera revisión: 1-3 días (puede ser instantáneo)
   - Proceso más rápido que Apple

6. **Publicación Gradual**
   - Opción recomendada: 10% → 25% → 50% → 100% usuarios
   - Permite detectar bugs críticos sin afectar a todos

---

### Comparación de Tiendas

| Aspecto | App Store (iOS) | Google Play (Android) |
|---------|-----------------|----------------------|
| **Coste registro** | $99/año | $25 única vez |
| **Hardware necesario** | Mac obligatorio | Cualquier OS |
| **Tiempo revisión** | 1-7 días | 1-3 días (a veces instantáneo) |
| **Proceso** | Más estricto | Más flexible |
| **Rechazos comunes** | Frecuentes | Menos frecuentes |
| **Publicación gradual** | No (salvo TestFlight) | Sí (nativo) |
| **Actualizaciones OTA** | Posible (Expo) | Posible (Expo) |

---

## 🔄 Mantenimiento y Actualizaciones

### Actualizaciones Over-The-Air (OTA)

**Una de las mayores ventajas de Expo:** Actualizar la app SIN pasar por App Store/Google Play.

#### Qué se puede actualizar OTA:
✅ JavaScript / TypeScript (toda tu lógica)
✅ Cambios de UI
✅ Bug fixes
✅ Nuevas funcionalidades menores
✅ Assets (imágenes, fuentes)

#### Qué NO se puede actualizar OTA:
❌ Cambios en código nativo (módulos nativos nuevos)
❌ Actualizaciones de dependencias nativas
❌ Cambios en permisos (Info.plist, AndroidManifest.xml)

#### Proceso:
```bash
# 1. Hacer cambios en el código
# 2. Publicar actualización OTA
eas update --branch production --message "Fix bug valoraciones"

# 3. Los usuarios reciben la actualización automáticamente
# Sin descargar nada de la tienda
# En segundos/minutos
```

**Ventaja competitiva:** Puedes corregir bugs críticos en minutos, no días.

---

### Versionado Semántico

```
Versión: X.Y.Z (ej: 1.2.3)

X (Major): Cambios grandes, incompatibles con versión anterior
Y (Minor): Nuevas funcionalidades, compatible
Z (Patch): Bug fixes, mejoras menores
```

**Estrategia recomendada:**
- **Patch (OTA):** Cada 1-2 semanas (bugs, mejoras)
- **Minor (tienda):** Cada 1-2 meses (nuevas features)
- **Major (tienda):** Cada 6-12 meses (cambios grandes)

---

### Monitoreo y Analytics

#### Herramientas Recomendadas:

1. **Sentry** (Crash Reporting)
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN',
  environment: 'production',
});

// Captura automática de crashes
```

2. **Firebase Analytics** (Uso de la app)
```javascript
import analytics from '@react-native-firebase/analytics';

// Trackear eventos
await analytics().logEvent('area_visitada', {
  area_id: area.id,
  pais: area.pais,
});
```

3. **Expo Analytics** (Incluido gratis)
```javascript
// Métricas automáticas:
// - Descargas
// - Usuarios activos diarios/mensuales
// - Retención
// - Crashes
```

---

### Mantenimiento Continuo

#### Semanal:
- [ ] Revisar Sentry para nuevos crashes
- [ ] Monitorear reviews en App Store/Google Play
- [ ] Responder comentarios de usuarios

#### Mensual:
- [ ] Actualizar dependencias
- [ ] Revisar analytics y KPIs
- [ ] Planificar nuevas features según feedback

#### Trimestral:
- [ ] Actualizar a última versión de React Native/Expo
- [ ] Auditoría de seguridad
- [ ] Optimización de rendimiento

#### Anual:
- [ ] Renovar Apple Developer ($99)
- [ ] Revisar y actualizar políticas de privacidad
- [ ] Rediseño UI si es necesario

---

## ✅ Checklist Pre-desarrollo

### Antes de Empezar

#### Cuentas y Accesos
- [ ] Cuenta Apple Developer registrada y activa
- [ ] Cuenta Google Play Console registrada y activa
- [ ] Acceso a cuenta Supabase del proyecto
- [ ] Acceso repositorio GitHub
- [ ] API Keys de Google Maps (separadas de la web)

#### Hardware y Software
- [ ] Mac disponible (para builds iOS)
- [ ] Xcode instalado y actualizado
- [ ] Android Studio instalado
- [ ] Node.js 18+ instalado
- [ ] Git configurado

#### Preparación del Proyecto Web
- [ ] Identificar componentes compartibles
- [ ] Refactorizar lógica de negocio a funciones puras
- [ ] Extraer types TypeScript a archivos separados
- [ ] Documentar APIs de Supabase usadas
- [ ] Crear variables de entorno para móvil

#### Diseño
- [ ] Wireframes de pantallas principales
- [ ] Diseño UI adaptado a iOS/Android guidelines
- [ ] Iconos app en diferentes tamaños
- [ ] Splash screens
- [ ] Capturas de pantalla para tiendas

#### Legal y Compliance
- [ ] Política de privacidad actualizada (incluir móvil)
- [ ] Términos y condiciones
- [ ] Justificación de permisos nativos
- [ ] Declaración de uso de datos
- [ ] RGPD compliance verificado

#### Planning
- [ ] Roadmap de features definido
- [ ] Priorización de funcionalidades (MVP vs Nice-to-have)
- [ ] Timeline estimado
- [ ] Recursos asignados

---

## 📊 KPIs a Monitorear Post-Lanzamiento

### Métricas de Adopción
- **Descargas totales** (iOS + Android)
- **Usuarios activos diarios (DAU)**
- **Usuarios activos mensuales (MAU)**
- **Ratio DAU/MAU** (objetivo: >20%)
- **Retención D1, D7, D30** (día 1, día 7, día 30)

### Métricas de Uso
- **Sesiones por usuario**
- **Duración promedio sesión**
- **Áreas vistas por sesión**
- **Rutas creadas**
- **Valoraciones enviadas**

### Métricas Técnicas
- **Crash-free rate** (objetivo: >99%)
- **Tiempo de carga inicial**
- **Uso de batería**
- **Uso de datos móviles**
- **Tiempo para primera interacción**

### Métricas de Tiendas
- **Rating promedio** (objetivo: >4.5 estrellas)
- **Número de reviews**
- **Tasa de conversión** (impresiones → instalaciones)
- **Desinstalaciones**

---

## 🚀 Comandos Útiles

### Desarrollo Local

```bash
# Iniciar Expo
npm start

# Abrir en iOS Simulator
npm run ios

# Abrir en Android Emulator
npm run android

# Abrir en dispositivo físico (escanear QR)
# (automático con 'npm start')
```

### Builds de Producción

```bash
# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Build ambas plataformas
eas build --platform all --profile production
```

### Actualizaciones OTA

```bash
# Publicar actualización
eas update --branch production --message "Descripción cambios"

# Ver estado de updates
eas update:view

# Rollback a versión anterior
eas update:republish --branch production --update-id [UPDATE_ID]
```

### Testing

```bash
# Lint
npm run lint

# Type check
npm run type-check

# Tests unitarios
npm test

# Tests E2E (con Detox)
npm run test:e2e
```

---

## 📚 Recursos y Referencias

### Documentación Oficial
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)

### Guías Específicas
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

### Librerías Clave
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)

### Comunidad
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://www.reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

## 🎯 Conclusión

Este documento servirá como **guía completa** para cuando decidas implementar la app nativa móvil. El enfoque elegido (React Native + Expo) ofrece el mejor balance entre:

- ✅ **Reutilización de código** (compartir con web)
- ✅ **Capacidades nativas completas** (GPS, archivos, biometría)
- ✅ **Facilidad de desarrollo** (React, que ya conoces)
- ✅ **Rapidez de iteración** (actualizaciones OTA)
- ✅ **Coste razonable** (<$130 primer año)

**Próximos pasos cuando estés listo:**
1. Revisitar este documento
2. Configurar cuentas de desarrollador
3. Seguir Fase 0 del plan de implementación
4. Desarrollar MVP en 2-3 meses
5. Publicar en tiendas
6. Iterar según feedback de usuarios

---

**Creado:** 21 de Noviembre de 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo Mapa Furgocasa  
**Contacto:** https://www.mapafurgocasa.com

---

*Este documento se actualizará conforme evolucione el proyecto y las tecnologías.*



