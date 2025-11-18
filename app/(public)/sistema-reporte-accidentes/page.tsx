import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Sistema de Reporte de Accidentes | Furgocasa",
  description:
    "Sistema colaborativo de alertas y reportes de incidentes para autocaravanistas. Comparte y recibe notificaciones en tiempo real sobre accidentes, robos, problemas en carretera y zonas peligrosas.",
  keywords:
    "reportar accidente autocaravana, alerta robo camper, incidentes furgoneta, seguridad viaje autocaravana, mapa accidentes, avisos tiempo real, comunidad autocaravanistas",
  openGraph: {
    title: "Sistema de Reporte de Accidentes | Furgocasa",
    description:
      "Comunidad colaborativa de autocaravanistas. Reporta y recibe alertas en tiempo real sobre accidentes, robos e incidentes en tu ruta.",
    type: "website",
    url: "https://www.mapafurgocasa.com/sistema-reporte-accidentes",
    images: [
      {
        url: "https://www.mapafurgocasa.com/og-reporte-accidentes.jpg",
        width: 1200,
        height: 630,
        alt: "Sistema de Reporte de Accidentes Furgocasa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Reporte de Accidentes | Furgocasa",
    description:
      "Comunidad colaborativa de autocaravanistas. Reporta y recibe alertas sobre incidentes en tu ruta.",
    images: ["https://www.mapafurgocasa.com/og-reporte-accidentes.jpg"],
  },
};

export default function ReporteAccidentesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <BellAlertIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Alertas en Tiempo Real</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Sistema Colaborativo de Reporte de Incidentes
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Una comunidad unida para viajar más seguros. Reporta accidentes, robos y problemas en tu ruta para avisar a otros autocaravanistas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/accidente"
                className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
              >
                <ExclamationTriangleIcon className="w-6 h-6" />
                Reportar Incidente Ahora
              </Link>
              <Link
                href="/perfil"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Ver Mis Reportes
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Reportes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Qué puedes reportar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cualquier incidente que pueda afectar a otros viajeros en autocaravana
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Tipo 1 */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-100 hover:shadow-lg transition-shadow">
              <div className="bg-red-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <ExclamationTriangleIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Accidentes
              </h3>
              <p className="text-gray-700 text-sm">
                Choques, volcamientos, incidentes graves que bloqueen carreteras o representen peligro.
              </p>
            </div>

            {/* Tipo 2 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-100 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Robos y Seguridad
              </h3>
              <p className="text-gray-700 text-sm">
                Intentos de robo, zonas inseguras, vandalismo o actividad sospechosa en áreas de pernocta.
              </p>
            </div>

            {/* Tipo 3 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-100 hover:shadow-lg transition-shadow">
              <div className="bg-orange-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <MapPinIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Problemas de Ruta
              </h3>
              <p className="text-gray-700 text-sm">
                Carreteras cortadas, obras, caminos intransitables, restricciones de altura o peso.
              </p>
            </div>

            {/* Tipo 4 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100 hover:shadow-lg transition-shadow">
              <div className="bg-amber-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <BellAlertIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Otros Incidentes
              </h3>
              <p className="text-gray-700 text-sm">
                Averías peligrosas, condiciones climáticas extremas, animales sueltos, alertas generales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona el sistema?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, rápido y diseñado para ayudarte en momentos críticos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Paso 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-6 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mt-2">
                  <MapPinIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Reporta el Incidente
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Presiona el botón "Reportar Accidente" en cualquier momento. El sistema captura automáticamente tu ubicación GPS y la fecha/hora del incidente.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-6 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mt-2">
                  <DocumentTextIcon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Añade Detalles
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Describe qué sucedió, selecciona el tipo de incidente, añade fotos si es posible y proporciona información útil para otros viajeros.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-6 bg-amber-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mt-2">
                  <BellAlertIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Alerta a la Comunidad
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Tu reporte aparece inmediatamente en el mapa y notifica a usuarios cercanos. Todos los autocaravanistas pueden verlo y tomar precauciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características del Sistema */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Características del Sistema
              </h2>
              <p className="text-xl text-gray-600">
                Diseñado por viajeros para viajeros
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
                <MapPinIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Geolocalización Automática</h3>
                  <p className="text-gray-600">
                    No pierdas tiempo escribiendo direcciones. Tu ubicación se captura automáticamente con GPS.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
                <ClockIcon className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Alertas en Tiempo Real</h3>
                  <p className="text-gray-600">
                    Recibe notificaciones instantáneas de incidentes en tu ruta o cerca de tu posición actual.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100">
                <PhotoIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Adjuntar Fotos</h3>
                  <p className="text-gray-600">
                    Añade imágenes del incidente para que otros viajeros sepan exactamente qué esperar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-100">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Comentarios y Seguimiento</h3>
                  <p className="text-gray-600">
                    Otros usuarios pueden comentar con actualizaciones o información adicional.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-100">
                <GlobeAltIcon className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Mapa Interactivo</h3>
                  <p className="text-gray-600">
                    Visualiza todos los incidentes activos en un mapa para planificar tu ruta de forma segura.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-100">
                <ShieldCheckIcon className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Privacidad y Seguridad</h3>
                  <p className="text-gray-600">
                    Tus datos personales están protegidos. Solo se comparte la información necesaria del incidente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios para la Comunidad */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <UserGroupIcon className="w-5 h-5" />
                  <span className="text-sm font-semibold">Comunidad Colaborativa</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Juntos Viajamos Más Seguros
                </h2>
                <p className="text-lg text-orange-100 mb-6">
                  Cada reporte que haces puede salvar el viaje (o incluso la vida) de otro autocaravanista. Esta es la fuerza de nuestra comunidad.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span>Evita zonas peligrosas o con problemas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span>Planifica rutas alternativas informadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span>Ayuda a otros en situaciones difíciles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span>Recibe alertas de lo que sucede en tu ruta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span>Comunidad unida y solidaria 24/7</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/30">
                  <div className="flex items-center gap-3 mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                    <div>
                      <div className="font-bold">Reportes Activos</div>
                      <div className="text-sm text-orange-200">En tu zona</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-500/30 rounded-lg p-3 border border-red-300/50">
                      <div className="flex items-center gap-2 mb-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <div className="text-sm font-bold">Accidente - A-7 km 245</div>
                      </div>
                      <div className="text-xs text-orange-100">Hace 15 min • 8.3 km de ti</div>
                    </div>
                    <div className="bg-yellow-500/30 rounded-lg p-3 border border-yellow-300/50">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <div className="text-sm font-bold">Robo reportado - Parking</div>
                      </div>
                      <div className="text-xs text-orange-100">Hace 2h • 15 km de ti</div>
                    </div>
                    <div className="bg-orange-500/30 rounded-lg p-3 border border-orange-300/50">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPinIcon className="w-4 h-4" />
                        <div className="text-sm font-bold">Carretera cortada - N-340</div>
                      </div>
                      <div className="text-xs text-orange-100">Hace 4h • 22 km de ti</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Panel de Control */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Gestiona tus Reportes
              </h2>
              <p className="text-xl text-gray-600">
                Desde tu perfil puedes ver, editar y actualizar todos tus reportes
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Historial Completo</h3>
                  <p className="text-sm text-gray-600">
                    Accede a todos tus reportes anteriores con fecha, ubicación y estado.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Actualizar Estado</h3>
                  <p className="text-sm text-gray-600">
                    Marca incidentes como resueltos o añade información actualizada.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellAlertIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Notificaciones</h3>
                  <p className="text-sm text-gray-600">
                    Recibe avisos cuando alguien comenta en tus reportes o hay actualizaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Forma parte de la comunidad más solidaria
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Regístrate gratis y empieza a reportar incidentes o recibir alertas en tu ruta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-5 rounded-lg font-bold text-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                <UserGroupIcon className="w-6 h-6" />
                Unirme Ahora Gratis
              </Link>
              <Link
                href="/accidente"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 px-10 py-5 rounded-lg font-bold text-xl hover:bg-red-50 transition-all"
              >
                <ExclamationTriangleIcon className="w-6 h-6" />
                Reportar Incidente
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              ✅ Gratis para siempre • 🌍 Europa y LATAM • 🚐 Miles de autocaravanistas unidos
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

