import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones - Mapa Furgocasa",
  description: "Términos y condiciones de uso de Mapa Furgocasa",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="mb-8">
          <Link
            href="/auth/register"
            className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-2 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al registro
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600">
            Última actualización: 29 de enero de 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 mb-4">
              Al acceder y utilizar Mapa Furgocasa ("el Servicio"), aceptas
              estar legalmente vinculado por estos Términos y Condiciones. Si no
              estás de acuerdo con alguna parte de estos términos, no debes
              utilizar nuestro servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700 mb-4">
              Mapa Furgocasa es una aplicación web que proporciona información
              sobre áreas y servicios para autocaravanas en España y otros
              países. El servicio incluye:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Localización de áreas para autocaravanas</li>
              <li>Información sobre servicios disponibles</li>
              <li>Valoraciones y comentarios de usuarios</li>
              <li>Planificación de rutas</li>
              <li>Gestión de vehículos personales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Registro y Cuenta de Usuario
            </h2>
            <p className="text-gray-700 mb-4">
              Para utilizar ciertas funciones del servicio, deberás crear una
              cuenta. Te comprometes a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la seguridad de tu contraseña</li>
              <li>
                Notificarnos inmediatamente de cualquier uso no autorizado
              </li>
              <li>
                Ser responsable de todas las actividades que ocurran bajo tu
                cuenta
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Uso Aceptable
            </h2>
            <p className="text-gray-700 mb-4">
              Al utilizar el servicio, te comprometes a NO:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violar leyes o regulaciones aplicables</li>
              <li>Publicar contenido falso, engañoso o difamatorio</li>
              <li>Interferir con el funcionamiento del servicio</li>
              <li>Intentar acceder a áreas no autorizadas</li>
              <li>
                Utilizar el servicio para fines comerciales sin autorización
              </li>
              <li>
                Recopilar información de otros usuarios sin consentimiento
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Contenido del Usuario
            </h2>
            <p className="text-gray-700 mb-4">
              Al publicar contenido (comentarios, valoraciones, fotos),
              garantizas que:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Tienes los derechos necesarios sobre el contenido</li>
              <li>El contenido no infringe derechos de terceros</li>
              <li>
                Nos otorgas una licencia mundial, no exclusiva y libre de
                regalías para usar, modificar y distribuir tu contenido
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Nos reservamos el derecho de eliminar cualquier contenido que
              consideremos inapropiado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 mb-4">
              Todo el contenido del servicio (diseño, texto, gráficos,
              logotipos, código) es propiedad de Mapa Furgocasa o sus
              licenciantes y está protegido por leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Descargo de Responsabilidad
            </h2>
            <p className="text-gray-700 mb-4">
              El servicio se proporciona "tal cual" sin garantías de ningún
              tipo. No garantizamos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>La exactitud, integridad o actualidad de la información</li>
              <li>Que el servicio esté libre de errores o interrupciones</li>
              <li>La disponibilidad de las áreas o servicios mostrados</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>IMPORTANTE:</strong> Verifica siempre la información antes
              de viajar. Las condiciones de las áreas pueden cambiar sin previo
              aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 mb-4">
              En la medida permitida por la ley, Mapa Furgocasa no será
              responsable de:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Daños directos, indirectos, incidentales o consecuentes</li>
              <li>Pérdida de datos, beneficios o uso</li>
              <li>
                Problemas derivados del uso de la información proporcionada
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Modificaciones del Servicio
            </h2>
            <p className="text-gray-700 mb-4">Nos reservamos el derecho de:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modificar o discontinuar el servicio en cualquier momento</li>
              <li>Cambiar estos términos y condiciones</li>
              <li>Suspender o terminar cuentas que violen estos términos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Privacidad
            </h2>
            <p className="text-gray-700 mb-4">
              El uso de tu información personal está regido por nuestra{" "}
              <Link
                href="/privacidad"
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                Política de Privacidad
              </Link>
              , que forma parte integral de estos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Ley Aplicable
            </h2>
            <p className="text-gray-700 mb-4">
              Estos términos se rigen por las leyes de España. Cualquier disputa
              se resolverá en los tribunales de España.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-700 mb-4">
              Para cualquier pregunta sobre estos términos, contacta con
              nosotros en:
            </p>
            <p className="text-gray-700">
              Email:{" "}
              <a
                href="mailto:info@mapafurgocasa.com"
                className="text-sky-600 hover:text-sky-700"
              >
                info@mapafurgocasa.com
              </a>
            </p>
          </section>

          <div className="mt-12 p-6 bg-sky-50 border-l-4 border-sky-600 rounded">
            <p className="text-sm text-gray-700">
              <strong>Nota importante:</strong> Al hacer clic en "Crear Cuenta"
              en el formulario de registro, confirmas que has leído, entendido y
              aceptado estos Términos y Condiciones, así como nuestra Política
              de Privacidad.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/auth/register"
            className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Registro
          </Link>
        </div>
      </div>
    </div>
  );
}
