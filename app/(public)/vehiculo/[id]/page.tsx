"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowLeftIcon,
  TruckIcon,
  CurrencyEuroIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TagIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ResumenEconomicoTab } from "@/components/vehiculo/ResumenEconomicoTab";
import { DatosCompraTab } from "@/components/vehiculo/DatosCompraTab";
import MantenimientosTab from "@/components/vehiculo/MantenimientosTab";
import AveriasTab from "@/components/vehiculo/AveriasTab";
import MejorasTab from "@/components/vehiculo/MejorasTab";
import VentaTab from "@/components/vehiculo/VentaTab";
import GastosAdicionalesTab from "@/components/vehiculo/GastosAdicionalesTab";
import { GaleriaFotosTab } from "@/components/vehiculo/GaleriaFotosTab";
import { Toast } from "@/components/ui/Toast";
import InformeValoracionIA from "@/components/vehiculo/InformeValoracionIA";
import { SparklesIcon as SparklesIconSolid } from "@heroicons/react/24/solid";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type TabType =
  | "resumen"
  | "compra"
  | "fotos"
  | "mantenimientos"
  | "averias"
  | "mejoras"
  | "gastos"
  | "venta"
  | "valoracion-ia";

export default function VehiculoPage() {
  const params = useParams();
  const router = useRouter();
  const vehiculoId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [valoracionEconomica, setValoracionEconomica] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("resumen");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    tipo_vehiculo: "",
    marca: "",
    modelo: "",
    chasis: "",
    año: "",
    color: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);
  const [valoracionesIA, setValoracionesIA] = useState<any[]>([]);
  const [loadingValoracion, setLoadingValoracion] = useState(false);
  const [generandoValoracion, setGenerandoValoracion] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [kilometrajeActual, setKilometrajeActual] = useState<number | null>(
    null
  );
  const [nuevoKilometraje, setNuevoKilometraje] = useState("");
  const [actualizandoKm, setActualizandoKm] = useState(false);

  // Detectar parámetro tab en la URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab") as TabType;
      if (
        tabParam &&
        [
          "resumen",
          "compra",
          "fotos",
          "mantenimientos",
          "averias",
          "mejoras",
          "gastos",
          "venta",
          "valoracion-ia",
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [vehiculoId]);

  // Cargar valoraciones IA y kilometraje cuando se active esa tab
  useEffect(() => {
    if (activeTab === "valoracion-ia" && vehiculoId) {
      loadValoracionesIA();
      loadKilometrajeActual();
    }
  }, [activeTab, vehiculoId]);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      setUser(session.user);

      // Cargar vehículo
      const { data: vehiculoData, error } = await (supabase as any)
        .from("vehiculos_registrados")
        .select("*")
        .eq("id", vehiculoId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !vehiculoData) {
        console.error("Error cargando vehículo:", error);
        router.push("/perfil");
        return;
      }

      setVehiculo(vehiculoData);

      // Cargar valoración económica (para saber si está vendido)
      const { data: valoracionData } = await (supabase as any)
        .from("vehiculo_valoracion_economica")
        .select(
          "vendido, precio_venta_final, fecha_venta, valor_estimado_actual"
        )
        .eq("vehiculo_id", vehiculoId)
        .maybeSingle();

      setValoracionEconomica(valoracionData);

      // Inicializar datos de edición
      setEditData({
        tipo_vehiculo: vehiculoData.tipo_vehiculo || "",
        marca: vehiculoData.marca || "",
        modelo: vehiculoData.modelo || "",
        chasis: vehiculoData.chasis || "",
        año: vehiculoData.año?.toString() || "",
        color: vehiculoData.color || "",
      });

      // Cargar kilometraje actual
      await loadKilometrajeActual();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditData({
      tipo_vehiculo: vehiculo.tipo_vehiculo || "",
      marca: vehiculo.marca || "",
      modelo: vehiculo.modelo || "",
      chasis: vehiculo.chasis || "",
      año: vehiculo.año?.toString() || "",
      color: vehiculo.color || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      tipo_vehiculo: vehiculo.tipo_vehiculo || "",
      marca: vehiculo.marca || "",
      modelo: vehiculo.modelo || "",
      chasis: vehiculo.chasis || "",
      año: vehiculo.año?.toString() || "",
      color: vehiculo.color || "",
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      const updateData: any = {
        tipo_vehiculo: editData.tipo_vehiculo.trim() || null,
        marca: editData.marca.trim() || null,
        modelo: editData.modelo.trim() || null,
        chasis: editData.chasis?.trim() || null,
        color: editData.color.trim() || null,
      };

      // Solo añadir año si tiene valor válido
      if (editData.año && editData.año.trim() !== "") {
        const añoNum = parseInt(editData.año);
        if (
          !isNaN(añoNum) &&
          añoNum >= 1900 &&
          añoNum <= new Date().getFullYear() + 1
        ) {
          updateData.año = añoNum;
        }
      } else {
        updateData.año = null;
      }

      const { error } = await (supabase as any)
        .from("vehiculos_registrados")
        .update(updateData)
        .eq("id", vehiculoId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error actualizando vehículo:", error);
        setToast({
          message: "Error al actualizar los datos del vehículo",
          type: "error",
        });
        return;
      }

      // Recargar datos
      await loadData();
      setIsEditing(false);
      setToast({
        message: "✅ Datos actualizados correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error:", error);
      setToast({
        message: "Error al actualizar los datos del vehículo",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadValoracionesIA = async () => {
    setLoadingValoracion(true);
    try {
      const response = await fetch(
        `/api/vehiculos/${vehiculoId}/ia-valoracion`
      );
      const data = await response.json();

      if (response.ok) {
        setValoracionesIA(data.informes || []);
      } else {
        console.error("Error cargando valoraciones IA:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingValoracion(false);
    }
  };

  const loadKilometrajeActual = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from("vehiculo_kilometraje")
        .select("kilometros")
        .eq("vehiculo_id", vehiculoId)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setKilometrajeActual(data.kilometros);
      } else {
        setKilometrajeActual(null);
      }
    } catch (error) {
      console.error("Error cargando kilometraje:", error);
    }
  };

  const handleActualizarKilometraje = async () => {
    const kmNuevo = parseInt(nuevoKilometraje);

    if (!kmNuevo || isNaN(kmNuevo) || kmNuevo <= 0) {
      setToast({
        message: "❌ Por favor ingresa un kilometraje válido",
        type: "error",
      });
      return;
    }

    if (kilometrajeActual && kmNuevo <= kilometrajeActual) {
      setToast({
        message: `❌ El nuevo kilometraje (${kmNuevo.toLocaleString()} km) debe ser mayor que el actual (${kilometrajeActual.toLocaleString()} km)`,
        type: "error",
      });
      return;
    }

    setActualizandoKm(true);
    try {
      const supabase = createClient();

      // Insertar nuevo registro de kilometraje
      const { error: kmError } = await (supabase as any)
        .from("vehiculo_kilometraje")
        .insert({
          vehiculo_id: vehiculoId,
          user_id: user.id,
          kilometros: kmNuevo,
          fecha: new Date().toISOString(),
        });

      if (kmError) throw kmError;

      // Actualizar ficha técnica si existe
      const { error: fichaError } = await (supabase as any)
        .from("vehiculo_ficha_tecnica")
        .update({ kilometros_actuales: kmNuevo })
        .eq("vehiculo_id", vehiculoId);

      // No fallar si no existe la ficha
      if (fichaError) {
        console.warn("No se pudo actualizar ficha técnica:", fichaError);
      }

      setKilometrajeActual(kmNuevo);
      setNuevoKilometraje("");
      setToast({
        message: `✅ Kilometraje actualizado a ${kmNuevo.toLocaleString()} km`,
        type: "success",
      });
    } catch (error: any) {
      console.error("Error actualizando kilometraje:", error);
      setToast({
        message: `❌ Error: ${error.message}`,
        type: "error",
      });
    } finally {
      setActualizandoKm(false);
    }
  };

  const handleGenerarValoracion = () => {
    setShowConfirmModal(true);
  };

  const confirmarGenerarValoracion = async () => {
    setShowConfirmModal(false);
    setGenerandoValoracion(true);
    setToast({
      message: "🤖 Iniciando valoración con IA...",
      type: "info",
    });

    try {
      // 1. CREAR TRABAJO ASÍNCRONO
      const response = await fetch(
        `/api/vehiculos/${vehiculoId}/ia-valoracion`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setToast({ message: `❌ Error: ${data.error}`, type: "error" });
        setGenerandoValoracion(false);
        return;
      }

      const jobId = data.job_id;
      console.log("✅ Trabajo creado con ID:", jobId);

      // 2. POLLING: Consultar estado cada 3 segundos
      let progreso = 0;
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/vehiculos/${vehiculoId}/ia-valoracion/status?job_id=${jobId}`
          );

          const statusData = await statusResponse.json();

          if (!statusResponse.ok) {
            clearInterval(pollInterval);
            setToast({
              message: `❌ Error consultando estado: ${statusData.error}`,
              type: "error",
            });
            setGenerandoValoracion(false);
            return;
          }

          // Actualizar progreso
          progreso = statusData.progreso || 0;
          const mensaje = statusData.mensaje_estado || "Procesando...";

          setToast({
            message: `🤖 ${mensaje} (${progreso}%)`,
            type: "info",
          });

          // COMPLETADO
          if (statusData.estado === "completado") {
            clearInterval(pollInterval);
            setToast({
              message: "✅ ¡Valoración generada con éxito!",
              type: "success",
            });
            // Recargar las valoraciones
            await loadValoracionesIA();
            setGenerandoValoracion(false);
          }

          // ERROR
          if (statusData.estado === "error") {
            clearInterval(pollInterval);
            setToast({
              message: `❌ Error: ${
                statusData.error_mensaje || "Error desconocido"
              }`,
              type: "error",
            });
            setGenerandoValoracion(false);
          }
        } catch (error) {
          console.error("Error en polling:", error);
          clearInterval(pollInterval);
          setToast({
            message: "❌ Error al consultar el estado",
            type: "error",
          });
          setGenerandoValoracion(false);
        }
      }, 3000); // Cada 3 segundos

      // Timeout de seguridad: 5 minutos
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generandoValoracion) {
          setToast({
            message:
              "⏱️ La valoración está tardando más de lo esperado. Recarga la página más tarde.",
            type: "error",
          });
          setGenerandoValoracion(false);
        }
      }, 300000); // 5 minutos
    } catch (error) {
      console.error("Error:", error);
      setToast({ message: "❌ Error al generar la valoración", type: "error" });
      setGenerandoValoracion(false);
    }
  };

  const descargarValoracionPDF = async (valoracion: any) => {
    try {
      setToast({ message: "Generando PDF profesional...", type: "info" });

      // Importar jsPDF dinámicamente
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = 20;

      // Colores corporativos Mapa Furgocasa
      const colorPrimario = [239, 68, 68]; // Rojo corporativo
      const colorSecundario = [249, 115, 22]; // Naranja
      const colorAzul = [59, 130, 246]; // Azul
      const colorVerde = [34, 197, 94]; // Verde
      const colorGrisClaro = [249, 250, 251];
      const colorGrisTexto = [107, 114, 128];

      // Función para agregar nueva página si es necesario
      const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
      };

      // 1. HEADER CON DISEÑO CORPORATIVO
      pdf.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.rect(0, 0, pageWidth, 50, "F");

      // Línea naranja decorativa
      pdf.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
      pdf.rect(0, 50, pageWidth, 3, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.text("VALORACIÓN INTELIGENTE IA", pageWidth / 2, 22, { align: "center" });

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${vehiculo?.marca || ""} ${vehiculo?.modelo || ""}`,
        pageWidth / 2,
        33,
        { align: "center" }
      );

      // Añadir logo blanco si está disponible
      try {
        const logoUrl = "https://www.mapafurgocasa.com/logo-blanco-500.png";
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        pdf.addImage(`data:image/png;base64,${base64}`, "PNG", pageWidth / 2 - 10, 38, 20, 8);
      } catch (error) {
        console.warn("No se pudo cargar el logo:", error);
      }

      pdf.setTextColor(0, 0, 0);
      yPos = 63;

      // 2. INFORMACIÓN DEL VEHÍCULO EN CAJA CON FONDO
      pdf.setFillColor(colorGrisClaro[0], colorGrisClaro[1], colorGrisClaro[2]);
      pdf.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 44, 2, 2, "F");

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.text("DATOS DEL VEHÍCULO", margin + 3, yPos + 5);

      yPos += 12;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const datosVehiculo = [
        { label: "Matrícula:", value: vehiculo?.matricula || "No especificada" },
        { label: "Marca:", value: vehiculo?.marca || "No especificada" },
        { label: "Modelo:", value: vehiculo?.modelo || "No especificado" },
        { label: "Año:", value: vehiculo?.ano || "No especificado" },
        { label: "Tipo:", value: vehiculo?.tipo_vehiculo || "Autocaravana" },
        { label: "Color:", value: vehiculo?.color || "No especificado" },
      ];

      datosVehiculo.forEach((dato: any) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(dato.label, margin + 5, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(dato.value, margin + 35, yPos);
        yPos += 5;
      });

      yPos += 8;

      // 3. PRECIOS DESTACADOS EN CAJAS PROFESIONALES
      checkPageBreak(60);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.text("VALORACIÓN Y PRECIOS RECOMENDADOS", margin, yPos);
      yPos += 10;

      // Caja de Precio de Salida
      if (valoracion.precio_salida) {
        pdf.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
        pdf.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 16, 2, 2, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text("PRECIO DE SALIDA", margin + 3, yPos + 4);

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `${valoracion.precio_salida.toLocaleString("es-ES")}€`,
          pageWidth - margin - 3,
          yPos + 4,
          { align: "right" }
        );

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text("Precio inicial para negociación", margin + 3, yPos + 10);

        yPos += 20;
      }

      // Caja de Precio Objetivo
      if (valoracion.precio_objetivo) {
        pdf.setFillColor(colorAzul[0], colorAzul[1], colorAzul[2]);
        pdf.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 16, 2, 2, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text("PRECIO OBJETIVO", margin + 3, yPos + 4);

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `${valoracion.precio_objetivo.toLocaleString("es-ES")}€`,
          pageWidth - margin - 3,
          yPos + 4,
          { align: "right" }
        );

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text("Precio realista de venta", margin + 3, yPos + 10);

        yPos += 20;
      }

      // Caja de Precio Mínimo
      if (valoracion.precio_minimo) {
        pdf.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        pdf.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 16, 2, 2, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text("PRECIO MÍNIMO", margin + 3, yPos + 4);

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `${valoracion.precio_minimo.toLocaleString("es-ES")}€`,
          pageWidth - margin - 3,
          yPos + 4,
          { align: "right" }
        );

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text("Límite aceptable de negociación", margin + 3, yPos + 10);

        yPos += 20;
      }

      yPos += 5;
      pdf.setTextColor(0, 0, 0);

      // 4. FOTOS DEL VEHÍCULO
      const supabase = createClient();
      const todasLasFotos: string[] = [];
      if (vehiculo?.foto_url) todasLasFotos.push(vehiculo.foto_url);
      if (
        vehiculo?.fotos_adicionales &&
        Array.isArray(vehiculo.fotos_adicionales)
      ) {
        todasLasFotos.push(...vehiculo.fotos_adicionales);
      }

      if (todasLasFotos.length > 0) {
        checkPageBreak(60);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        pdf.text("FOTOGRAFÍAS DEL VEHÍCULO", margin, yPos);
        yPos += 10;

        for (let i = 0; i < Math.min(todasLasFotos.length, 5); i++) {
          // Máximo 5 fotos
          try {
            const fotoUrl = todasLasFotos[i];
            const { data: fotoData } = await supabase.storage
              .from("vehiculos")
              .download(fotoUrl.replace(/^.*\/vehiculos\//, ""));

            if (fotoData) {
              const fotoBlob = await fotoData.arrayBuffer();
              const fotoBase64 = btoa(
                String.fromCharCode(...new Uint8Array(fotoBlob))
              );

              // Procesar imagen para corregir orientación
              const img = new Image();
              const fotoCorregidaBase64 = await new Promise<string>(
                (resolve) => {
                  img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.drawImage(img, 0, 0);
                      resolve(canvas.toDataURL("image/jpeg", 0.8));
                    } else {
                      resolve(`data:image/jpeg;base64,${fotoBase64}`);
                    }
                  };
                  img.src = `data:image/jpeg;base64,${fotoBase64}`;
                }
              );

              checkPageBreak(70);

              // Caja con borde para la foto
              pdf.setDrawColor(colorGrisTexto[0], colorGrisTexto[1], colorGrisTexto[2]);
              pdf.setLineWidth(0.5);
              const maxWidth = pageWidth - 2 * margin;
              const maxHeight = 60;
              pdf.rect(margin, yPos - 2, maxWidth, maxHeight + 6, "S");

              pdf.setFontSize(9);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(colorGrisTexto[0], colorGrisTexto[1], colorGrisTexto[2]);
              pdf.text(`Fotografía ${i + 1}/${Math.min(todasLasFotos.length, 5)}`, margin + 2, yPos + 2);
              yPos += 5;

              pdf.addImage(
                fotoCorregidaBase64,
                "JPEG",
                margin + 1,
                yPos,
                maxWidth - 2,
                maxHeight - 2
              );
              yPos += maxHeight + 5;
              pdf.setTextColor(0, 0, 0);
            }
          } catch (error) {
            console.warn(`Error cargando foto ${i + 1}:`, error);
          }
        }
      }

      // 5. INFORME COMPLETO CON FORMATO MEJORADO
      checkPageBreak(40);

      // Nueva página para el informe
      pdf.addPage();
      yPos = 20;

      // Header de informe
      pdf.setFillColor(colorGrisClaro[0], colorGrisClaro[1], colorGrisClaro[2]);
      pdf.rect(0, 0, pageWidth, 35, "F");

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.text("INFORME DE VALORACIÓN COMPLETO", pageWidth / 2, 15, { align: "center" });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colorGrisTexto[0], colorGrisTexto[1], colorGrisTexto[2]);
      pdf.text(
        `Generado por IA el ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`,
        pageWidth / 2,
        25,
        { align: "center" }
      );

      yPos = 45;
      pdf.setTextColor(0, 0, 0);

      // Procesar el informe con mejor formato
      const textoPlano = valoracion.informe_texto
        // Eliminar todos los emojis Unicode (no soportados por jsPDF)
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
        .replace(/##\s+(.+)/g, "\n\n===SECTION===$1")
        .replace(/###\s+(.+)/g, "\n\n---SUBSECTION---$1")
        .replace(/\*\*(.+?)\*\*/g, "***$1***")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

      const lines = textoPlano.split("\n");

      lines.forEach((line: string) => {
        // Sección principal (##)
        if (line.startsWith("===SECTION===")) {
          checkPageBreak(15);
          yPos += 5;
          const titulo = line.replace("===SECTION===", "").trim();

          pdf.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
          pdf.rect(margin, yPos - 4, pageWidth - 2 * margin, 10, "F");

          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
          pdf.text(titulo, margin + 2, yPos + 2);

          yPos += 12;
          pdf.setTextColor(0, 0, 0);
        }
        // Subsección (###)
        else if (line.startsWith("---SUBSECTION---")) {
          checkPageBreak(10);
          yPos += 3;
          const titulo = line.replace("---SUBSECTION---", "").trim();

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2]);
          pdf.text(titulo, margin, yPos);

          yPos += 7;
          pdf.setTextColor(0, 0, 0);
        }
        // Texto en negrita (**texto**)
        else if (line.includes("***")) {
          checkPageBreak(6);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          const textoLimpio = line.replace(/\*\*\*/g, "");
          const wrapped = pdf.splitTextToSize(textoLimpio, pageWidth - 2 * margin);
          wrapped.forEach((wLine: string) => {
            checkPageBreak(6);
            pdf.text(wLine, margin, yPos);
            yPos += 5;
          });
        }
        // Línea vacía
        else if (line.trim() === "") {
          yPos += 3;
        }
        // Texto normal
        else if (line.trim() !== "") {
          checkPageBreak(6);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          const wrapped = pdf.splitTextToSize(line.trim(), pageWidth - 2 * margin);
          wrapped.forEach((wLine: string) => {
            checkPageBreak(6);
            pdf.text(wLine, margin, yPos);
            yPos += 5;
          });
        }
      });

      // 6. FOOTER PROFESIONAL EN TODAS LAS PÁGINAS
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Línea decorativa superior del footer
        pdf.setDrawColor(colorGrisTexto[0], colorGrisTexto[1], colorGrisTexto[2]);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Información del footer
        pdf.setFontSize(8);
        pdf.setTextColor(colorGrisTexto[0], colorGrisTexto[1], colorGrisTexto[2]);
        pdf.setFont("helvetica", "normal");

        // Izquierda: Fecha
        pdf.text(
          `Generado: ${new Date().toLocaleDateString("es-ES")}`,
          margin,
          pageHeight - 8
        );

        // Centro: Nombre empresa
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "Mapa Furgocasa",
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );

        // Derecha: Número de página
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Página ${i}/${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );

        // Web en la parte inferior
        pdf.setFontSize(7);
        pdf.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2]);
        pdf.text(
          "www.mapafurgocasa.com",
          pageWidth / 2,
          pageHeight - 4,
          { align: "center" }
        );
      }

      // Descargar PDF
      const nombreArchivo = `Valoracion_IA_${vehiculo?.matricula || "vehiculo"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(nombreArchivo);

      setToast({ message: "✅ PDF profesional descargado correctamente", type: "success" });
    } catch (error) {
      console.error("Error generando PDF:", error);
      setToast({ message: "Error al generar el PDF", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vehiculo) {
    return null;
  }

  const tabs = [
    { id: "resumen", label: "Resumen", icon: ChartBarIcon },
    { id: "compra", label: "Datos de Compra", icon: CurrencyEuroIcon },
    { id: "fotos", label: "Fotos", icon: PhotoIcon },
    {
      id: "mantenimientos",
      label: "Mantenimientos",
      icon: WrenchScrewdriverIcon,
    },
    { id: "averias", label: "Averías", icon: ExclamationTriangleIcon },
    { id: "mejoras", label: "Mejoras", icon: SparklesIcon },
    { id: "gastos", label: "Gastos Adicionales", icon: BanknotesIcon },
    { id: "valoracion-ia", label: "Valoración IA", icon: SparklesIconSolid },
    { id: "venta", label: "Venta", icon: TagIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/mis-autocaravanas"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Volver a Mis Autocaravanas</span>
            <span className="xs:hidden">Volver</span>
          </Link>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
                  <TruckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                </div>

                {!isEditing ? (
                  // Modo Vista
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">
                      {vehiculo.matricula}
                    </h1>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                      {vehiculo.tipo_vehiculo && (
                        <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                          {vehiculo.tipo_vehiculo}
                        </span>
                      )}
                      {kilometrajeActual && (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <TruckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="tabular-nums">
                            {kilometrajeActual.toLocaleString()} km
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-2 line-clamp-2">
                      {vehiculo.marca || "Sin marca"}{" "}
                      {vehiculo.modelo || "Sin modelo"}
                      {vehiculo.chasis && ` • Chasis: ${vehiculo.chasis}`}
                      {vehiculo.año && ` • ${vehiculo.año}`}
                      {vehiculo.color && ` • ${vehiculo.color}`}
                    </p>
                  </div>
                ) : (
                  // Modo Edición
                  <div className="flex-1 space-y-3">
                    {/* Matrícula - NO EDITABLE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matrícula{" "}
                        <span className="text-xs text-gray-500">
                          (no editable)
                        </span>
                      </label>
                      <div className="text-2xl font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {vehiculo.matricula}
                      </div>
                    </div>

                    {/* Tipo de Vehículo - 2º en importancia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Vehículo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editData.tipo_vehiculo}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            tipo_vehiculo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona un tipo</option>
                        <option value="Furgoneta Camper">
                          🚐 Furgoneta Camper
                        </option>
                        <option value="Autocaravana Perfilada">
                          🚙 Autocaravana Perfilada
                        </option>
                        <option value="Autocaravana Integral">
                          🚌 Autocaravana Integral
                        </option>
                        <option value="Autocaravana Capuchina">
                          🏕️ Autocaravana Capuchina
                        </option>
                        <option value="Otro">📦 Otro</option>
                      </select>
                    </div>

                    {/* Campos Editables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marca
                        </label>
                        <input
                          type="text"
                          value={editData.marca}
                          onChange={(e) =>
                            setEditData({ ...editData, marca: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Fiat, Volkswagen..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Modelo
                        </label>
                        <input
                          type="text"
                          value={editData.modelo}
                          onChange={(e) =>
                            setEditData({ ...editData, modelo: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Ducato, California..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chasis
                        </label>
                        <input
                          type="text"
                          value={editData.chasis || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, chasis: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Fiat, Peugeot, Citroën..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Año
                        </label>
                        <input
                          type="number"
                          value={editData.año}
                          onChange={(e) =>
                            setEditData({ ...editData, año: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: 2020"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={editData.color}
                          onChange={(e) =>
                            setEditData({ ...editData, color: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Blanco, Gris..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white text-sm sm:text-base rounded-lg hover:bg-primary-700 transition-colors touch-manipulation"
                  >
                    <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Editar</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 touch-manipulation"
                    >
                      <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">
                        {saving ? "Guardando..." : "Guardar"}
                      </span>
                      <span className="xs:hidden">{saving ? "..." : "✓"}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-500 text-white text-sm sm:text-base rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 touch-manipulation"
                    >
                      <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">Cancelar</span>
                      <span className="xs:hidden">×</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Advertencia sobre matrícula */}
            {isEditing && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Nota:</strong> La matrícula NO se puede modificar.
                  Si necesitas cambiarla, deberás eliminar este vehículo y crear
                  uno nuevo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
          <div
            className="overflow-x-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 #f1f5f9",
            }}
          >
            <div className="flex border-b border-gray-200 min-w-max">
              {tabs.map((tab: any) => {
                const Icon = tab.icon;
                const shortLabels: Record<string, string> = {
                  Resumen: "Resumen",
                  "Datos de Compra": "Compra",
                  Fotos: "Fotos",
                  Mantenimientos: "Mant.",
                  Averías: "Averías",
                  Mejoras: "Mejoras",
                  "Gastos Adicionales": "Gastos",
                  "Valoración IA": "IA",
                  Venta: "Venta",
                };
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 font-medium transition-colors whitespace-nowrap text-[10px] xs:text-xs sm:text-sm lg:text-base min-w-[60px] xs:min-w-[70px] sm:min-w-0 touch-manipulation ${
                      activeTab === tab.id
                        ? "border-b-2 border-primary-600 text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-center leading-tight font-semibold">
                      {shortLabels[tab.label] || tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          {activeTab === "resumen" && (
            <ResumenEconomicoTab vehiculoId={vehiculoId} />
          )}

          {activeTab === "compra" && (
            <DatosCompraTab
              vehiculoId={vehiculoId}
              onDataSaved={() => {
                // Opcional: cambiar al tab de resumen después de guardar
                // setActiveTab('resumen')
              }}
            />
          )}

          {activeTab === "fotos" && (
            <GaleriaFotosTab
              vehiculoId={vehiculoId}
              fotoUrl={vehiculo.foto_url}
              fotosAdicionales={vehiculo.fotos_adicionales || []}
            />
          )}

          {activeTab === "mantenimientos" && (
            <MantenimientosTab vehiculoId={vehiculoId} />
          )}

          {activeTab === "averias" && <AveriasTab vehiculoId={vehiculoId} />}

          {activeTab === "mejoras" && <MejorasTab vehiculoId={vehiculoId} />}

          {activeTab === "valoracion-ia" && (
            <div className="space-y-6">
              {/* Botón para generar nueva valoración */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 md:p-6 border border-purple-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <SparklesIconSolid className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                      Valoración con Inteligencia Artificial
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
                      Genera un informe profesional de valoración de tu vehículo
                      utilizando IA. Analizamos datos reales del mercado, el
                      estado de tu vehículo, inversiones realizadas y te
                      proporcionamos 3 precios estratégicos: de salida, objetivo
                      y mínimo.
                    </p>
                    <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                      <li>✓ Búsqueda automática de comparables en internet</li>
                      <li>✓ Análisis de depreciación por tiempo y uso</li>
                      <li>✓ Valoración de extras y mejoras instaladas</li>
                      <li>✓ Informe profesional detallado</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[280px]">
                    {/* Actualizar kilometraje */}
                    <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <TruckIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                        <span className="text-xs md:text-sm font-semibold text-gray-900">
                          Kilometraje Actual
                        </span>
                      </div>
                      {kilometrajeActual ? (
                        <p className="text-xs text-gray-600 mb-2">
                          Último:{" "}
                          <span className="font-semibold text-orange-600">
                            {kilometrajeActual.toLocaleString()} km
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mb-2">
                          Sin registros
                        </p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={nuevoKilometraje}
                          onChange={(e) => setNuevoKilometraje(e.target.value)}
                          placeholder="Nuevo km"
                          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={actualizandoKm}
                        />
                        <button
                          onClick={handleActualizarKilometraje}
                          disabled={actualizandoKm || !nuevoKilometraje}
                          className="px-3 py-2 bg-orange-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          title="Actualizar kilometraje del vehículo"
                        >
                          {actualizandoKm ? "..." : "Actualizar"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        ⚠️ Solo valores mayores al actual
                      </p>
                    </div>

                    {/* Botón generar valoración */}
                    {valoracionEconomica?.vendido ? (
                      <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                        <strong>✅ Vehículo vendido</strong>
                        <p className="mt-1">
                          Este vehículo fue vendido
                          {valoracionEconomica.fecha_venta
                            ? ` el ${new Date(
                                valoracionEconomica.fecha_venta
                              ).toLocaleDateString("es-ES")}`
                            : ""}
                          . El valor actual es el precio de venta final:{" "}
                          <strong>
                            {valoracionEconomica.precio_venta_final?.toLocaleString(
                              "es-ES",
                              {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 0,
                              }
                            ) || "No especificado"}
                          </strong>
                          .
                          <br />
                          No se pueden generar más valoraciones.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerarValoracion}
                        disabled={generandoValoracion}
                        className="w-full px-4 md:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {generandoValoracion ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generando...
                          </>
                        ) : (
                          <>
                            <SparklesIconSolid className="w-5 h-5" />
                            Generar Valoración
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mostrar valoraciones existentes */}
              {loadingValoracion ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando valoraciones...</p>
                </div>
              ) : valoracionesIA.length > 0 ? (
                <div className="space-y-6">
                  {valoracionesIA.map((informe: any) => (
                    <InformeValoracionIA
                      key={informe.id}
                      informe={informe}
                      vehiculoId={vehiculoId}
                      vehiculoMarca={vehiculo.marca}
                      vehiculoModelo={vehiculo.modelo}
                      onDescargarPDF={() => descargarValoracionPDF(informe)}
                      todasLasValoraciones={valoracionesIA}
                      onValoracionEliminada={loadValoracionesIA}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                  <SparklesIconSolid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aún no tienes valoraciones
                  </h3>
                  {valoracionEconomica?.vendido ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 max-w-md mx-auto">
                      <strong>✅ Vehículo vendido</strong>
                      <p className="mt-1">
                        Este vehículo fue vendido
                        {valoracionEconomica.fecha_venta
                          ? ` el ${new Date(
                              valoracionEconomica.fecha_venta
                            ).toLocaleDateString("es-ES")}`
                          : ""}
                        . El valor actual es el precio de venta final:{" "}
                        <strong>
                          {valoracionEconomica.precio_venta_final?.toLocaleString(
                            "es-ES",
                            {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            }
                          ) || "No especificado"}
                        </strong>
                        .
                        <br />
                        No se pueden generar más valoraciones.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-6">
                        Genera tu primera valoración con IA para conocer el
                        valor real de tu vehículo
                      </p>
                      <button
                        onClick={handleGenerarValoracion}
                        disabled={generandoValoracion}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <SparklesIconSolid className="w-5 h-5" />
                        Generar Primera Valoración
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "gastos" && (
            <GastosAdicionalesTab vehiculoId={vehiculoId} />
          )}

          {activeTab === "venta" && <VentaTab vehiculoId={vehiculoId} />}
        </div>
      </main>

      <Footer />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal para Valoración IA */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="¿Generar Valoración con IA?"
        message="Esta acción generará un informe profesional de valoración utilizando IA. El proceso puede tardar unos segundos."
        confirmText="Generar"
        cancelText="Cancelar"
        onConfirm={confirmarGenerarValoracion}
        onCancel={() => setShowConfirmModal(false)}
        type="info"
      />
    </div>
  );
}
