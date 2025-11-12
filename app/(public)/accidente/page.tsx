"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Loader } from "@googlemaps/js-api-loader";

// Tipos simplificados para Google Maps (se cargan dinámicamente)
type GoogleMap = any;
type GoogleMarker = any;
type GoogleGeocoder = any;

export default function ReporteAccidentePage() {
  const [busquedaMatricula, setBusquedaMatricula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ubicacion, setUbicacion] = useState<{
    lat: number;
    lng: number;
    direccion?: string;
  } | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [mapa, setMapa] = useState<GoogleMap | null>(null);
  const [marcador, setMarcador] = useState<GoogleMarker | null>(null);
  const [mapaCargado, setMapaCargado] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [ubicacionAjustada, setUbicacionAjustada] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    matricula_tercero: "",
    descripcion_tercero: "",
    testigo_nombre: "",
    testigo_email: "",
    testigo_telefono: "",
    descripcion: "",
    tipo_dano: "" as "Rayón" | "Abolladura" | "Choque" | "Rotura" | "Otro" | "",
    fecha_accidente: new Date().toISOString().slice(0, 16),
    ubicacion_descripcion: "",
    fotos: [] as File[],
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cargar matrícula desde URL si existe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const matriculaParam = params.get("matricula");

    if (matriculaParam) {
      setBusquedaMatricula(matriculaParam.toUpperCase());
      // Auto-buscar el vehículo
      buscarVehiculoPorMatricula(matriculaParam.toUpperCase());
    } else {
      setCargandoInicial(false);
    }
  }, []);

  useEffect(() => {
    if (ubicacion && !mapaCargado && !mapa) {
      inicializarMapa();
    }
  }, [ubicacion, mapaCargado, mapa]);

  const buscarVehiculoPorMatricula = async (matricula: string) => {
    setBuscando(true);
    setNoEncontrado(false);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/vehiculos/buscar-matricula?matricula=${encodeURIComponent(
          matricula
        )}`
      );
      const data = await response.json();

      if (response.ok && data.existe) {
        setVehiculo(data.vehiculo);
        setNoEncontrado(false);
        setMessage({
          type: "success",
          text: `✅ Vehículo encontrado: ${data.vehiculo.marca} ${data.vehiculo.modelo} - ${data.vehiculo.matricula}`,
        });
      } else {
        setVehiculo(null);
        setNoEncontrado(true);
        setMessage({
          type: "error",
          text: "No se encontró ningún vehículo registrado con esa matrícula. Verifica que esté correctamente escrita.",
        });
      }
    } catch (error) {
      console.error("Error buscando vehículo:", error);
      setMessage({
        type: "error",
        text: "Error al buscar el vehículo. Inténtalo de nuevo.",
      });
    } finally {
      setBuscando(false);
      setCargandoInicial(false);
    }
  };

  const buscarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!busquedaMatricula.trim()) {
      setMessage({ type: "error", text: "Por favor, introduce una matrícula" });
      return;
    }

    await buscarVehiculoPorMatricula(busquedaMatricula.trim());
  };

  const obtenerUbicacion = () => {
    setObteniendoUbicacion(true);

    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Tu navegador no soporta geolocalización",
      });
      setObteniendoUbicacion(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Geocoding reverso para obtener dirección
        try {
          const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
            version: "weekly",
          });

          await loader.load();
          const google = (window as any).google;
          const geocoder = new google.maps.Geocoder() as GoogleGeocoder;

          const result = await geocoder.geocode({ location: { lat, lng } });

          if (result.results && result.results[0]) {
            const direccion = result.results[0].formatted_address;
            setUbicacion({ lat, lng, direccion });
            setFormData((prev) => ({
              ...prev,
              ubicacion_descripcion: direccion,
            }));
          } else {
            setUbicacion({ lat, lng });
          }

          setMessage({
            type: "success",
            text: "Ubicación obtenida correctamente",
          });
        } catch (error) {
          console.error("Error en geocoding:", error);
          setUbicacion({ lat, lng });
          setMessage({
            type: "success",
            text: "Ubicación obtenida (sin dirección)",
          });
        }

        setObteniendoUbicacion(false);
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        setMessage({
          type: "error",
          text: "No se pudo obtener tu ubicación. Verifica los permisos.",
        });
        setObteniendoUbicacion(false);
      }
    );
  };

  const inicializarMapa = async () => {
    if (!ubicacion || mapaCargado) return;

    try {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      });

      await loader.load();
      const google = (window as any).google;

      const mapElement = document.getElementById("map");
      if (!mapElement) return;

      const newMap = new google.maps.Map(mapElement, {
        center: { lat: ubicacion.lat, lng: ubicacion.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      }) as GoogleMap;

      // Crear marcador ARRASTRABLE
      const newMarker = new google.maps.Marker({
        position: { lat: ubicacion.lat, lng: ubicacion.lng },
        map: newMap,
        title: "Arrastra para ajustar la ubicación exacta",
        draggable: true,
        animation: google.maps.Animation.DROP,
      }) as GoogleMarker;

      // Listener para cuando se arrastra el marcador
      google.maps.event.addListener(newMarker, 'dragend', async function(event: any) {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        
        setUbicacionAjustada(true);
        
        // Actualizar ubicación
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: { lat: newLat, lng: newLng } });
          
          if (result.results && result.results[0]) {
            const nuevaDireccion = result.results[0].formatted_address;
            setUbicacion({ lat: newLat, lng: newLng, direccion: nuevaDireccion });
            setFormData((prev) => ({
              ...prev,
              ubicacion_descripcion: nuevaDireccion,
            }));
            setMessage({
              type: "success",
              text: "✅ Ubicación ajustada correctamente",
            });
          } else {
            setUbicacion({ lat: newLat, lng: newLng });
          }
        } catch (error) {
          console.error("Error en geocoding:", error);
          setUbicacion({ lat: newLat, lng: newLng });
        }
      });

      setMarcador(newMarker);
      setMapa(newMap);
      setMapaCargado(true);
    } catch (error) {
      console.error("Error inicializando mapa:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehiculo) {
      setMessage({
        type: "error",
        text: "Primero debes buscar y encontrar un vehículo",
      });
      return;
    }

    if (
      !formData.testigo_nombre ||
      !formData.testigo_email ||
      !formData.descripcion ||
      !formData.tipo_dano
    ) {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los campos obligatorios",
      });
      return;
    }

    if (!ubicacion) {
      setMessage({
        type: "error",
        text: "Por favor, obtén tu ubicación antes de enviar el reporte",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const reporteData = new FormData();
      reporteData.append("vehiculo_id", vehiculo.id);
      reporteData.append("matricula_tercero", formData.matricula_tercero);
      reporteData.append("descripcion_tercero", formData.descripcion_tercero);
      reporteData.append("testigo_nombre", formData.testigo_nombre);
      reporteData.append("testigo_email", formData.testigo_email);
      reporteData.append("testigo_telefono", formData.testigo_telefono);
      reporteData.append("descripcion", formData.descripcion);
      reporteData.append("tipo_dano", formData.tipo_dano);
      reporteData.append("fecha_accidente", formData.fecha_accidente);
      reporteData.append("ubicacion_lat", ubicacion.lat.toString());
      reporteData.append("ubicacion_lng", ubicacion.lng.toString());
      reporteData.append(
        "ubicacion_descripcion",
        formData.ubicacion_descripcion || ubicacion.direccion || ""
      );

      // Añadir fotos
      formData.fotos.forEach((foto) => {
        reporteData.append("fotos", foto);
      });

      const response = await fetch("/api/reportes", {
        method: "POST",
        body: reporteData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "¡Reporte enviado con éxito! El propietario será notificado.",
        });
        // Resetear formulario
        setFormData({
          matricula_tercero: "",
          descripcion_tercero: "",
          testigo_nombre: "",
          testigo_email: "",
          testigo_telefono: "",
          descripcion: "",
          tipo_dano: "",
          fecha_accidente: new Date().toISOString().slice(0, 16),
          ubicacion_descripcion: "",
          fotos: [],
        });
        setVehiculo(null);
        setBusquedaMatricula("");
        setUbicacion(null);
        setMapa(null);
        setMapaCargado(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Error al enviar el reporte",
        });
      }
    } catch (error) {
      console.error("Error enviando reporte:", error);
      setMessage({
        type: "error",
        text: "Error al enviar el reporte. Inténtalo de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (cargandoInicial) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">
              Cargando información del vehículo...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportar un Accidente
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Si has sido testigo de un accidente o daño a una autocaravana,
            puedes reportarlo aquí. Introduce la matrícula del vehículo dañado
            para comenzar.
          </p>
        </div>

        {/* Mensajes */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
              <p>{message.text}</p>
            </div>
          </div>
        )}

        {/* Paso 1: Buscar Vehículo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
              1
            </span>
            Buscar Vehículo por Matrícula
          </h2>

          <form onSubmit={buscarVehiculo} className="flex gap-3">
            <div className="flex-grow">
              <input
                type="text"
                value={busquedaMatricula}
                onChange={(e) =>
                  setBusquedaMatricula(e.target.value.toUpperCase())
                }
                placeholder="Ej: 1234ABC"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                disabled={buscando || vehiculo !== null}
              />
            </div>
            <button
              type="submit"
              disabled={buscando || vehiculo !== null}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {buscando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </form>

          {vehiculo && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Vehículo encontrado: {vehiculo.marca} {vehiculo.modelo}
                  </p>
                  <p className="text-sm text-green-700">
                    Matrícula: {vehiculo.matricula} • Año: {vehiculo.año}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVehiculo(null);
                  setBusquedaMatricula("");
                  setNoEncontrado(false);
                }}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                Buscar otro vehículo
              </button>
            </div>
          )}
        </div>

        {/* Formulario de Reporte (solo si se encontró vehículo) */}
        {vehiculo && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paso 2: Ubicación */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
                  2
                </span>
                Ubicación del Accidente
              </h2>

              {!ubicacion ? (
                <button
                  type="button"
                  onClick={obtenerUbicacion}
                  disabled={obteniendoUbicacion}
                  className="w-full px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  {obteniendoUbicacion ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="w-5 h-5" />
                      Obtener Mi Ubicación
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">
                        Ubicación obtenida
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      {ubicacion.direccion ||
                        `Lat: ${ubicacion.lat.toFixed(
                          6
                        )}, Lng: ${ubicacion.lng.toFixed(6)}`}
                    </p>
                  </div>

                  {/* Mensaje de advertencia para ajustar ubicación */}
                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-1">
                          ⚠️ Verifica la ubicación en el mapa
                        </p>
                        <p className="text-sm text-yellow-700">
                          Si la ubicación no es correcta, <strong>arrastra el marcador rojo</strong> en el mapa hasta el lugar exacto del accidente. La dirección se actualizará automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mapa */}
                  <div
                    id="map"
                    className="w-full h-64 rounded-lg border border-gray-300 shadow-sm"
                  ></div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de la Ubicación (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.ubicacion_descripcion}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ubicacion_descripcion: e.target.value,
                        }))
                      }
                      placeholder="Ej: Frente al supermercado Mercadona"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Paso 3: Información del Testigo */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
                  3
                </span>
                Tus Datos (Testigo)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.testigo_nombre}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        testigo_nombre: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.testigo_email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        testigo_email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formData.testigo_telefono}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        testigo_telefono: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Paso 4: Detalles del Accidente */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
                  4
                </span>
                Detalles del Accidente
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Daño <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.tipo_dano}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tipo_dano: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="Rayón">Rayón</option>
                    <option value="Abolladura">Abolladura</option>
                    <option value="Choque">Choque</option>
                    <option value="Rotura">Rotura</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora del Accidente{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_accidente}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fecha_accidente: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Accidente{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    placeholder="Describe lo que sucedió con el mayor detalle posible..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula del Tercero Responsable (si aplica)
                  </label>
                  <input
                    type="text"
                    value={formData.matricula_tercero}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        matricula_tercero: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Ej: 5678XYZ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Tercero Responsable (si aplica)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion_tercero}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descripcion_tercero: e.target.value,
                      }))
                    }
                    placeholder="Ej: Furgoneta blanca, marca Ford, con un golpe en la puerta trasera..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotos del Accidente (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData((prev) => ({ ...prev, fotos: files }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {formData.fotos.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.fotos.length} foto(s) seleccionada(s)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={submitting || !ubicacion}
              className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando Reporte...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Enviar Reporte de Accidente
                </>
              )}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
