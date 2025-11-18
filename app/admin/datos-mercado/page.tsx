"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TableCellsIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface DatoMercado {
  id: string;
  marca: string | null;
  modelo: string | null;
  año: number | null;
  precio: number | null;
  kilometros: number | null;
  verificado: boolean;
  estado: string | null;
  origen: string | null;
  tipo_dato: string | null;
  fecha_transaccion: string | null;
  created_at: string;
}

export default function DatosMercadoPage() {
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState<DatoMercado[]>([]);
  const [filteredDatos, setFilteredDatos] = useState<DatoMercado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroVerificado, setFiltroVerificado] = useState<"todos" | "verificados" | "no_verificados">("todos");
  const [showExtractorModal, setShowExtractorModal] = useState(false);
  const [extractUrl, setExtractUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractMessage, setExtractMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [datos, busqueda, filtroVerificado]);

  const checkAdminAndLoad = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push("/mapa");
      return;
    }

    await loadDatos();
    setLoading(false);
  };

  const loadDatos = async () => {
    try {
      const response = await fetch("/api/admin/datos-mercado");
      const data = await response.json();

      if (response.ok) {
        setDatos(data.datos || []);
      } else {
        setError(data.error || "Error al cargar datos");
      }
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      setError(err.message);
    }
  };

  const applyFilters = () => {
    let filtered = [...datos];

    // Filtro por verificado
    if (filtroVerificado === "verificados") {
      filtered = filtered.filter((d) => d.verificado);
    } else if (filtroVerificado === "no_verificados") {
      filtered = filtered.filter((d) => !d.verificado);
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.marca?.toLowerCase().includes(searchLower) ||
          d.modelo?.toLowerCase().includes(searchLower) ||
          d.estado?.toLowerCase().includes(searchLower) ||
          d.origen?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDatos(filtered);
  };

  const handleExtractFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtracting(true);
    setExtractMessage(null);

    try {
      const response = await fetch("/api/admin/datos-mercado/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extractUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setExtractMessage({
          type: "success",
          text: `✅ Datos extraídos: ${data.marca} ${data.modelo} (${data.año})`,
        });
        setExtractUrl("");
        setShowExtractorModal(false);
        await loadDatos();
      } else {
        setExtractMessage({
          type: "error",
          text: data.error || "Error al extraer datos",
        });
      }
    } catch (err: any) {
      console.error("Error extrayendo datos:", err);
      setExtractMessage({
        type: "error",
        text: err.message || "Error de conexión",
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleDeleteDato = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este dato de mercado?")) return;

    try {
      const response = await fetch(`/api/admin/datos-mercado/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadDatos();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar");
      }
    } catch (err: any) {
      console.error("Error eliminando dato:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Volver al Panel Admin
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TableCellsIcon className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Datos de Mercado
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona los comparables para valoraciones IA
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExtractorModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Extraer de URL
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Datos</p>
                <p className="text-2xl font-bold text-gray-900">{datos.length}</p>
              </div>
              <TableCellsIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {datos.filter((d) => d.verificado).length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimaciones IA</p>
                <p className="text-2xl font-bold text-gray-900">
                  {datos.filter((d) => !d.verificado).length}
                </p>
              </div>
              <XCircleIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Marca, modelo, origen..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Verificado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="w-4 h-4 inline mr-1" />
                Estado
              </label>
              <select
                value={filtroVerificado}
                onChange={(e) =>
                  setFiltroVerificado(e.target.value as any)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="verificados">Solo Verificados</option>
                <option value="no_verificados">Solo Estimaciones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDatos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {busqueda || filtroVerificado !== "todos"
                        ? "No se encontraron resultados"
                        : "No hay datos de mercado"}
                    </td>
                  </tr>
                ) : (
                  filteredDatos.map((dato) => (
                    <tr key={dato.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {dato.verificado ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-orange-400 mr-2" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {dato.marca || "-"} {dato.modelo || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dato.año || "Sin año"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dato.precio
                          ? new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            }).format(dato.precio)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dato.kilometros
                          ? `${new Intl.NumberFormat("es-ES").format(
                              dato.kilometros
                            )} km`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {dato.origen || "Desconocido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dato.estado || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dato.fecha_transaccion
                          ? new Date(dato.fecha_transaccion).toLocaleDateString(
                              "es-ES"
                            )
                          : new Date(dato.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteDato(dato.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contador de resultados */}
        {(busqueda || filtroVerificado !== "todos") && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {filteredDatos.length} de {datos.length} resultados
          </div>
        )}
      </div>

      {/* Modal Extractor de URL */}
      {showExtractorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Extraer Datos de URL
              </h2>
              <button
                onClick={() => setShowExtractorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Pega la URL de un anuncio de autocaravana y extraeremos
              automáticamente los datos (marca, modelo, año, precio, km).
            </p>

            <form onSubmit={handleExtractFromUrl}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Anuncio
                </label>
                <input
                  type="url"
                  value={extractUrl}
                  onChange={(e) => setExtractUrl(e.target.value)}
                  placeholder="https://www.example.com/autocaravana..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={extracting}
                />
              </div>

              {extractMessage && (
                <div
                  className={`mb-4 p-4 rounded-lg ${
                    extractMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {extractMessage.text}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExtractorModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={extracting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={extracting || !extractUrl}
                >
                  {extracting ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Extrayendo...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5 inline mr-2" />
                      Extraer Datos
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

