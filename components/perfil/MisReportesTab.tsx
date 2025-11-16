"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReporteCompletoUsuario } from "@/types/reportes.types";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";

interface Props {
  userId: string;
  onReporteUpdate?: () => void;
}

export function MisReportesTab({ userId, onReporteUpdate }: Props) {
  const [reportes, setReportes] = useState<ReporteCompletoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    reporteId: string | null;
  }>({ isOpen: false, reporteId: null });

  useEffect(() => {
    loadReportes();
  }, [userId]);

  const loadReportes = async () => {
    try {
      const response = await fetch("/api/reportes");
      const data = await response.json();

      if (response.ok) {
        console.log("📥 Reportes recibidos del API:", data.reportes);

        // Mapear reporte_id a id para compatibilidad con el tipo ReporteCompletoUsuario
        const reportesMapeados = (data.reportes || []).map((r: any) => {
          const mapeado = {
            ...r,
            id: r.reporte_id || r.id,
            vehiculo_afectado_id: r.vehiculo_id || r.vehiculo_afectado_id,
          };
          console.log("🔄 Reporte mapeado:", {
            original_reporte_id: r.reporte_id,
            original_id: r.id,
            final_id: mapeado.id,
          });
          return mapeado;
        });

        console.log("✅ Reportes mapeados finales:", reportesMapeados);
        setReportes(reportesMapeados);
      } else {
        console.error("Error cargando reportes:", data.error);
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeido = async (reporteId: string) => {
    console.log("🔵 handleMarcarLeido llamado con ID:", reporteId);

    if (!reporteId || reporteId === "undefined") {
      console.error("❌ ERROR: reporteId es undefined o inválido");
      setToast({
        message: "Error: ID de reporte inválido. Por favor, recarga la página.",
        type: "error",
      });
      return;
    }

    setUpdating(true);
    try {
      const url = `/api/reportes/${reporteId}`;
      console.log("📤 Haciendo PATCH a:", url);

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: true }),
      });

      if (response.ok) {
        console.log("✅ Reporte marcado como leído exitosamente");
        setToast({ message: "✅ Reporte marcado como leído", type: "success" });
        loadReportes();
        // Llamar al callback para actualizar contadores en la página padre
        if (onReporteUpdate) onReporteUpdate();
      } else {
        const data = await response.json();
        console.error("❌ Error marcando como leído:", data.error);
        setToast({ message: `Error: ${data.error}`, type: "error" });
      }
    } catch (error) {
      console.error("❌ Excepción en handleMarcarLeido:", error);
      setToast({
        message: "Error al marcar como leído. Por favor, intenta de nuevo.",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCerrarReporte = async (reporteId: string) => {
    setConfirmModal({ isOpen: true, reporteId });
  };

  const confirmCerrarReporte = async () => {
    const reporteId = confirmModal.reporteId;
    setConfirmModal({ isOpen: false, reporteId: null });

    if (!reporteId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/reportes/${reporteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cerrado: true, leido: true }),
      });

      if (response.ok) {
        setToast({
          message: "✅ Reporte cerrado correctamente",
          type: "success",
        });
        loadReportes();
        // Llamar al callback para actualizar contadores en la página padre
        if (onReporteUpdate) onReporteUpdate();
      } else {
        const data = await response.json();
        console.error("Error cerrando reporte:", data.error);
        setToast({ message: `Error: ${data.error}`, type: "error" });
      }
    } catch (error) {
      console.error("Error cerrando reporte:", error);
      setToast({
        message: "Error al cerrar el reporte. Por favor, intenta de nuevo.",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getTipoDanoColor = (tipo?: string) => {
    switch (tipo) {
      case "Choque":
        return "bg-red-100 text-red-800";
      case "Rotura":
        return "bg-red-100 text-red-800";
      case "Abolladura":
        return "bg-orange-100 text-orange-800";
      case "Rayón":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const descargarReportePDF = async (reporte: ReporteCompletoUsuario) => {
    try {
      setToast({ message: "Generando PDF completo...", type: "info" });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = 20;

      // ============================================================
      // PÁGINA 1: INFORMACIÓN GENERAL
      // ============================================================

      // Colores corporativos Mapa Furgocasa
      const colorPrimario = [239, 68, 68]; // Rojo corporativo
      const colorSecundario = [249, 115, 22]; // Naranja
      const colorAzul = [59, 130, 246]; // Azul
      const colorGrisClaro = [249, 250, 251];
      const colorGrisTexto = [107, 114, 128];

      // Header con diseño corporativo
      pdf.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.rect(0, 0, pageWidth, 45, "F");

      // Línea naranja decorativa
      pdf.setFillColor(
        colorSecundario[0],
        colorSecundario[1],
        colorSecundario[2]
      );
      pdf.rect(0, 45, pageWidth, 3, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.text("REPORTE DE ACCIDENTE", pageWidth / 2, 20, { align: "center" });

      // Añadir logo blanco debajo del título
      let logoCargado = false;
      try {
        const logoUrl = "https://www.mapafurgocasa.com/logo-blanco-500.png";
        const logoResponse = await fetch(logoUrl);
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(logoBlob);
        });

        // Crear imagen para obtener dimensiones reales
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = logoBase64;
        });

        // Tamaño del logo: 35mm de ancho, altura proporcional
        const logoWidth = 35;
        const logoHeight = (logoWidth * img.height) / img.width;
        const logoX = (pageWidth - logoWidth) / 2; // Centrado
        const logoY = 24; // Justo debajo del título

        pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
        logoCargado = true;
      } catch (logoError) {
        console.warn("No se pudo cargar el logo:", logoError);
        // Continuar sin logo si hay error
      }

      // Ajustar posición del texto según si se cargó el logo
      const textoY = logoCargado ? 36 : 32; // Si hay logo, bajar el texto

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Mapa Furgocasa - Documento Oficial",
        pageWidth / 2,
        textoY + 8,
        {
          align: "center",
        }
      );

      // Subtítulo
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.text("www.mapafurgocasa.com", pageWidth / 2, textoY + 14, {
        align: "center",
      });

      yPos = 58;

      // Barra de información del reporte con diseño mejorado
      pdf.setFillColor(colorGrisClaro[0], colorGrisClaro[1], colorGrisClaro[2]);
      pdf.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 20, 3, 3, "F");

      // Borde izquierdo de color
      pdf.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.rect(margin, yPos - 5, 4, 20, "F");

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`ID Reporte:`, margin + 8, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(reporte.id, margin + 30, yPos);

      pdf.setFont("helvetica", "bold");
      pdf.text(`Generado:`, pageWidth - margin - 70, yPos, { align: "left" });
      pdf.setFont("helvetica", "normal");
      pdf.text(
        new Date().toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        pageWidth - margin - 3,
        yPos,
        { align: "right" }
      );

      pdf.setTextColor(colorGrisTexto[0], colorGrisTexto[1], colorGrisTexto[2]);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        `Reportado: ${new Date(reporte.created_at).toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`,
        margin + 8,
        yPos + 8
      );

      yPos += 28;

      // ============================================================
      // SECCIÓN DE 3 COLUMNAS: Vehículo, Testigo, Fecha
      // ============================================================

      const colWidth = (pageWidth - 2 * margin - 10) / 3; // 3 columnas con separación
      const startYFor3Cols = yPos;

      // COLUMNA 1: VEHÍCULO AFECTADO
      let col1X = margin;
      let col1Y = startYFor3Cols;

      pdf.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.rect(col1X, col1Y - 2, 3, 8, "F");

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("VEHICULO", col1X + 5, col1Y + 3);
      col1Y += 11; // Aumentado de 8 a 11

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("Matricula:", col1X, col1Y);
      col1Y += 4;
      pdf.setFont("helvetica", "normal");
      const matriculaLines = pdf.splitTextToSize(
        reporte.vehiculo_matricula,
        colWidth - 2
      );
      pdf.text(matriculaLines, col1X, col1Y);
      col1Y += matriculaLines.length * 4 + 2;

      if (reporte.vehiculo_marca || reporte.vehiculo_modelo) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Vehiculo:", col1X, col1Y);
        col1Y += 4;
        pdf.setFont("helvetica", "normal");
        const vehiculoText = `${reporte.vehiculo_marca || "N/A"} ${
          reporte.vehiculo_modelo || "N/A"
        }`;
        const vehiculoLines = pdf.splitTextToSize(vehiculoText, colWidth - 2);
        pdf.text(vehiculoLines, col1X, col1Y);
        col1Y += vehiculoLines.length * 4 + 2;
      }

      // Tipo de daño
      if (reporte.tipo_dano) {
        pdf.setFillColor(255, 237, 213);
        pdf.roundedRect(col1X, col1Y, colWidth - 2, 7, 2, 2, "F");
        pdf.setFillColor(
          colorSecundario[0],
          colorSecundario[1],
          colorSecundario[2]
        );
        pdf.rect(col1X, col1Y, 2, 7, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(
          colorSecundario[0],
          colorSecundario[1],
          colorSecundario[2]
        );
        pdf.text(
          `TIPO: ${reporte.tipo_dano.toUpperCase()}`,
          col1X + 3,
          col1Y + 4.5
        );
        pdf.setTextColor(0, 0, 0);
        col1Y += 9;
      }

      // COLUMNA 2: DATOS DEL TESTIGO
      let col2X = margin + colWidth + 5;
      let col2Y = startYFor3Cols;

      pdf.setFillColor(colorAzul[0], colorAzul[1], colorAzul[2]);
      pdf.rect(col2X, col2Y - 2, 3, 8, "F");

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("TESTIGO", col2X + 5, col2Y + 3);
      col2Y += 11; // Aumentado de 8 a 11

      pdf.setFontSize(8);

      if (!reporte.es_anonimo) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Nombre:", col2X, col2Y);
        col2Y += 4;
        pdf.setFont("helvetica", "normal");
        const nombreLines = pdf.splitTextToSize(
          reporte.testigo_nombre,
          colWidth - 2
        );
        pdf.text(nombreLines, col2X, col2Y);
        col2Y += nombreLines.length * 4 + 2;

        if (reporte.testigo_email) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Email:", col2X, col2Y);
          col2Y += 4;
          pdf.setFont("helvetica", "normal");
          const emailLines = pdf.splitTextToSize(
            reporte.testigo_email,
            colWidth - 2
          );
          pdf.text(emailLines, col2X, col2Y);
          col2Y += emailLines.length * 4 + 2;
        }
        if (reporte.testigo_telefono) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Telefono:", col2X, col2Y);
          col2Y += 4;
          pdf.setFont("helvetica", "normal");
          pdf.text(reporte.testigo_telefono, col2X, col2Y);
          col2Y += 6;
        }
      } else {
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(7);
        const anonimoLines = pdf.splitTextToSize(
          "Reporte anonimo - El testigo oculto su identidad",
          colWidth - 2
        );
        pdf.text(anonimoLines, col2X, col2Y);
        pdf.setTextColor(0, 0, 0);
        col2Y += anonimoLines.length * 3.5 + 2;
      }

      // COLUMNA 3: FECHA DEL ACCIDENTE
      let col3X = margin + 2 * colWidth + 10;
      let col3Y = startYFor3Cols;

      pdf.setFillColor(
        colorSecundario[0],
        colorSecundario[1],
        colorSecundario[2]
      );
      pdf.rect(col3X, col3Y - 2, 3, 8, "F");

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("FECHA", col3X + 5, col3Y + 3);
      col3Y += 11; // Aumentado de 8 a 11

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const fechaCompleta = new Date(reporte.fecha_accidente).toLocaleString(
        "es-ES",
        {
          dateStyle: "full",
          timeStyle: "short",
        }
      );
      const fechaLines = pdf.splitTextToSize(fechaCompleta, colWidth - 2);
      pdf.text(fechaLines, col3X, col3Y);
      col3Y += fechaLines.length * 4;

      // Ajustar yPos al máximo de las 3 columnas
      yPos = Math.max(col1Y, col2Y, col3Y) + 10;

      // ============================================================
      // 3. UBICACION DEL ACCIDENTE con mapa
      // ============================================================
      pdf.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      pdf.rect(margin, yPos - 2, 3, 8, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("UBICACION DEL ACCIDENTE", margin + 6, yPos + 3);
      yPos += 10;

      // Calcular espacio disponible
      const leftColumnWidth = 80; // Ancho para dirección y coordenadas
      const mapWidth = pageWidth - 2 * margin - leftColumnWidth - 5; // Ancho para el mapa
      const mapHeight = 60; // Altura del mapa
      const startYForMap = yPos;

      // Columna izquierda: Dirección y coordenadas
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Direccion:", margin, yPos);
      yPos += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      if (reporte.ubicacion_direccion) {
        const direccionLines = pdf.splitTextToSize(
          reporte.ubicacion_direccion,
          leftColumnWidth - 5
        );
        pdf.text(direccionLines, margin, yPos);
        yPos += direccionLines.length * 4 + 3;
      } else {
        pdf.text("(No disponible)", margin, yPos);
        yPos += 7;
      }

      if (reporte.ubicacion_descripcion) {
        const descripcionLines = pdf.splitTextToSize(
          reporte.ubicacion_descripcion,
          leftColumnWidth - 5
        );
        pdf.text(descripcionLines, margin, yPos);
        yPos += descripcionLines.length * 4 + 3;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text("Coordenadas GPS:", margin, yPos);
      yPos += 4;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(`Lat: ${reporte.ubicacion_lat}`, margin, yPos);
      yPos += 3;
      pdf.text(`Lng: ${reporte.ubicacion_lng}`, margin, yPos);

      // Columna derecha: Mapa (mantener aspect ratio 2:1)
      try {
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${reporte.ubicacion_lat},${reporte.ubicacion_lng}&zoom=15&size=600x300&markers=color:red%7C${reporte.ubicacion_lat},${reporte.ubicacion_lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

        const mapImg = await fetch(mapUrl);
        const mapBlob = await mapImg.blob();
        const mapBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(mapBlob);
        });

        // Insertar mapa en la derecha con proporciones correctas (aspect ratio 2:1)
        pdf.addImage(
          mapBase64,
          "PNG",
          margin + leftColumnWidth + 5,
          startYForMap,
          mapWidth,
          mapWidth / 2
        );

        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          "Ubicacion exacta del accidente visualizada en Google Maps",
          margin + leftColumnWidth + 5,
          startYForMap + mapWidth / 2 + 3
        );
        pdf.setTextColor(0, 0, 0);
      } catch (mapError) {
        console.warn("No se pudo cargar el mapa:", mapError);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(
          margin + leftColumnWidth + 5,
          startYForMap,
          mapWidth,
          mapWidth / 2,
          "F"
        );
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "Mapa no disponible",
          margin + leftColumnWidth + 5 + mapWidth / 2,
          startYForMap + mapWidth / 4,
          { align: "center" }
        );
        pdf.setTextColor(0, 0, 0);
      }

      // Ajustar yPos para continuar debajo del mapa
      yPos = Math.max(yPos, startYForMap + mapWidth / 2 + 10);

      // ============================================================
      // 4. DESCRIPCIÓN DEL ACCIDENTE con diseño corporativo
      // ============================================================
      pdf.setFillColor(255, 237, 213);
      pdf.roundedRect(margin, yPos - 3, pageWidth - 2 * margin, 10, 2, 2, "F");
      pdf.setFillColor(
        colorSecundario[0],
        colorSecundario[1],
        colorSecundario[2]
      );
      pdf.rect(margin, yPos - 3, 4, 10, "F");

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("DESCRIPCION DEL ACCIDENTE", margin + 8, yPos + 3);
      yPos += 13;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      const descripcionLines = pdf.splitTextToSize(
        reporte.descripcion,
        pageWidth - 2 * margin
      );
      pdf.text(descripcionLines, margin, yPos);
      yPos += descripcionLines.length * 5 + 8;

      // Vehículo causante (si existe) con diseño mejorado
      if (reporte.matricula_tercero) {
        pdf.setFillColor(
          colorGrisClaro[0],
          colorGrisClaro[1],
          colorGrisClaro[2]
        );
        const alturaVehiculoCausante = reporte.descripcion_tercero ? 25 : 15;
        pdf.roundedRect(
          margin,
          yPos - 3,
          pageWidth - 2 * margin,
          alturaVehiculoCausante,
          2,
          2,
          "F"
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        pdf.text("Vehiculo Causante:", margin + 3, yPos + 3);
        pdf.setTextColor(0, 0, 0);
        yPos += 8;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("Matricula:", margin + 3, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(reporte.matricula_tercero, margin + 25, yPos);
        yPos += 5;

        if (reporte.descripcion_tercero) {
          const terceroLines = pdf.splitTextToSize(
            reporte.descripcion_tercero,
            pageWidth - 2 * margin - 6
          );
          pdf.setFontSize(9);
          pdf.text(terceroLines, margin + 3, yPos);
          yPos += terceroLines.length * 4 + 5;
        }
        yPos += 5;
      }

      // ============================================================
      // PÁGINA 2: EVIDENCIAS FOTOGRÁFICAS (sin deformar)
      // ============================================================

      if (reporte.fotos_urls && reporte.fotos_urls.length > 0) {
        pdf.addPage();
        yPos = 20;

        // Header de evidencias con diseño corporativo
        pdf.setFillColor(colorAzul[0], colorAzul[1], colorAzul[2]);
        pdf.rect(0, 0, pageWidth, 35, "F");

        // Línea naranja decorativa
        pdf.setFillColor(
          colorSecundario[0],
          colorSecundario[1],
          colorSecundario[2]
        );
        pdf.rect(0, 35, pageWidth, 2, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("EVIDENCIAS FOTOGRAFICAS", pageWidth / 2, 18, {
          align: "center",
        });

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Reporte ID: ${reporte.id}`, pageWidth / 2, 27, {
          align: "center",
        });

        yPos = 45;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `Total de fotografias: ${reporte.fotos_urls.length}`,
          margin,
          yPos
        );
        yPos += 10;

        // Insertar fotos manteniendo aspect ratio
        for (let i = 0; i < reporte.fotos_urls.length; i++) {
          try {
            const fotoUrl = reporte.fotos_urls[i];
            const fotoResponse = await fetch(fotoUrl);
            const fotoBlob = await fotoResponse.blob();

            // Crear una imagen temporal para obtener dimensiones reales
            const fotoBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(fotoBlob);
            });

            // Obtener dimensiones reales de la imagen y corregir orientación
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.src = fotoBase64;
            });

            // Crear un canvas para corregir la orientación si es necesario
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;

            // Usar las dimensiones de la imagen cargada
            // Si la imagen es más alta que ancha, es vertical
            const originalWidth = img.width;
            const originalHeight = img.height;
            const esVertical = originalHeight > originalWidth;

            // Configurar canvas con las dimensiones correctas
            canvas.width = originalWidth;
            canvas.height = originalHeight;

            // Dibujar la imagen en el canvas
            ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

            // Obtener base64 corregido del canvas
            const fotoCorregidaBase64 = canvas.toDataURL("image/jpeg", 0.9);

            const aspectRatio = originalWidth / originalHeight;

            // Calcular dimensiones para el PDF manteniendo aspect ratio
            const maxWidth = pageWidth - 2 * margin;
            let maxHeight = 80; // Altura máxima por foto horizontal

            // Si la foto es vertical, permitir más altura para mejor visualización
            if (esVertical) {
              maxHeight = 120; // Más espacio para fotos verticales
            }

            let imgWidth, imgHeight;
            if (aspectRatio > maxWidth / maxHeight) {
              // La imagen es más ancha que alta (horizontal o cuadrada)
              imgWidth = maxWidth;
              imgHeight = maxWidth / aspectRatio;
            } else {
              // La imagen es más alta que ancha (vertical)
              imgHeight = maxHeight;
              imgWidth = maxHeight * aspectRatio;
            }

            // Si no cabe en la página, crear nueva
            if (yPos + imgHeight + 10 > pageHeight - 20) {
              pdf.addPage();
              yPos = 20;
            }

            // Título de la foto
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.text(`Fotografia ${i + 1}:`, margin, yPos);
            yPos += 5;

            // Centrar imagen horizontalmente
            const xOffset = margin + (maxWidth - imgWidth) / 2;

            // Insertar imagen SIN deformar (manteniendo aspect ratio)
            // Usar la versión corregida del canvas
            pdf.addImage(
              fotoCorregidaBase64,
              "JPEG",
              xOffset,
              yPos,
              imgWidth,
              imgHeight
            );
            yPos += imgHeight + 8;
          } catch (fotoError) {
            console.warn(`No se pudo cargar la foto ${i + 1}:`, fotoError);
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Foto ${i + 1}: Error al cargar imagen`, margin, yPos);
            pdf.setTextColor(0, 0, 0);
            yPos += 8;
          }
        }
      }

      // Footer corporativo en todas las páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Línea decorativa superior del footer
        pdf.setDrawColor(
          colorGrisTexto[0],
          colorGrisTexto[1],
          colorGrisTexto[2]
        );
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Texto del footer
        pdf.setTextColor(
          colorGrisTexto[0],
          colorGrisTexto[1],
          colorGrisTexto[2]
        );
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          "Documento generado por Mapa Furgocasa",
          margin,
          pageHeight - 10
        );
        pdf.setFont("helvetica", "bold");
        pdf.text("www.mapafurgocasa.com", pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Pagina ${i} de ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );

        pdf.setFontSize(7);
        pdf.setFont("helvetica", "italic");
        pdf.text(
          "Sistema de Reportes de Accidentes",
          pageWidth / 2,
          pageHeight - 6,
          { align: "center" }
        );
      }

      // Descargar
      pdf.save(
        `Reporte-Accidente-${reporte.vehiculo_matricula}-${new Date(
          reporte.fecha_accidente
        )
          .toISOString()
          .slice(0, 10)}.pdf`
      );

      setToast({
        message: "PDF completo descargado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error generando PDF:", error);
      setToast({ message: "Error al generar el PDF", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (reportes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No tienes reportes de accidentes
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Cuando alguien reporte un accidente usando tu código QR, aparecerá
          aquí
        </p>
      </div>
    );
  }

  const reportesNoLeidos = reportes.filter((r) => !r.leido).length;
  const reportesPendientes = reportes.filter((r) => !r.cerrado).length;

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-primary-500">
          <div className="text-sm font-medium text-gray-600">
            Total Reportes
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {reportes.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <div className="text-sm font-medium text-gray-600">No Leídos</div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            {reportesNoLeidos}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-600">Pendientes</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {reportesPendientes}
          </div>
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {reportes.map((reporte) => (
          <div
            key={reporte.id}
            className={`bg-white rounded-xl shadow border-2 transition-shadow hover:shadow-lg ${
              !reporte.leido ? "border-red-200 bg-red-50" : "border-gray-200"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon
                      className={`h-6 w-6 ${
                        reporte.cerrado
                          ? "text-green-500"
                          : !reporte.leido
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Reporte de Accidente - {reporte.vehiculo_matricula}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reporte.vehiculo_marca && `${reporte.vehiculo_marca} `}
                        {reporte.vehiculo_modelo && reporte.vehiculo_modelo}
                      </p>
                    </div>
                  </div>

                  {/* 1. INFORMACIÓN DEL TESTIGO */}
                  {reporte.es_anonimo ? (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span>🎭</span>
                        Datos del Testigo:
                      </h4>
                      <div className="text-sm">
                        <p className="text-purple-700 italic">
                          <strong>Reporte anónimo:</strong> El testigo ha
                          elegido mantener su identidad privada. Solo puedes ver
                          la información del accidente.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        👤 Datos del Testigo:
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Nombre:</strong> {reporte.testigo_nombre}
                        </p>
                        {reporte.testigo_email && (
                          <p className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            <a
                              href={`mailto:${reporte.testigo_email}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                            >
                              {reporte.testigo_email}
                            </a>
                          </p>
                        )}
                        {reporte.testigo_telefono && (
                          <p className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            <a
                              href={`tel:${reporte.testigo_telefono}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                            >
                              {reporte.testigo_telefono}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. UBICACIÓN Y FECHA */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            📍 Ubicación del Accidente
                          </p>
                          <p className="text-sm text-gray-700">
                            {reporte.ubicacion_direccion || "Ver coordenadas"}
                          </p>
                          {reporte.ubicacion_descripcion && (
                            <p className="text-xs text-gray-500 mt-1">
                              {reporte.ubicacion_descripcion}
                            </p>
                          )}
                          <div className="mt-2 flex flex-col gap-1">
                            <p className="text-xs text-gray-500">
                              Lat: {reporte.ubicacion_lat} · Lng:{" "}
                              {reporte.ubicacion_lng}
                            </p>
                            <a
                              href={`https://www.google.com/maps?q=${reporte.ubicacion_lat},${reporte.ubicacion_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary-600 hover:text-primary-700 hover:underline text-xs font-medium transition-colors"
                            >
                              🗺️ Ver en Google Maps →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            📅 Fecha del Accidente
                          </p>
                          <p className="text-sm text-gray-700">
                            {new Date(reporte.fecha_accidente).toLocaleString(
                              "es-ES",
                              {
                                dateStyle: "full",
                                timeStyle: "short",
                              }
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Reportado:{" "}
                            {new Date(reporte.created_at).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. DESCRIPCIÓN DEL ACCIDENTE */}
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          📝 Descripción del Accidente
                          {reporte.tipo_dano && (
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoDanoColor(
                                reporte.tipo_dano
                              )}`}
                            >
                              {reporte.tipo_dano}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {reporte.descripcion}
                        </p>

                        {/* Información del vehículo causante */}
                        {reporte.matricula_tercero && (
                          <div className="mt-3 pt-3 border-t border-yellow-300">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              🚗 Vehículo Causante:
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Matrícula:</strong>{" "}
                              {reporte.matricula_tercero}
                            </p>
                            {reporte.descripcion_tercero && (
                              <p className="text-sm text-gray-700 mt-1">
                                {reporte.descripcion_tercero}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. FOTOS DEL ACCIDENTE */}
                  {reporte.fotos_urls && reporte.fotos_urls.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        📸 Evidencias Fotográficas
                        <span className="text-xs font-normal text-gray-600">
                          ({reporte.fotos_urls.length}{" "}
                          {reporte.fotos_urls.length === 1 ? "foto" : "fotos"})
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {reporte.fotos_urls.map((url: any, index: any) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group relative"
                          >
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-24 object-cover rounded border-2 border-blue-200 group-hover:border-blue-400 transition-all"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver completa
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estados */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!reporte.leido && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        No Leído
                      </span>
                    )}
                    {reporte.leido && !reporte.cerrado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                    {reporte.cerrado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Cerrado
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Reportado:{" "}
                      {new Date(reporte.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex flex-wrap gap-3">
                {/* Botón de descargar PDF (siempre visible) */}
                <button
                  onClick={() => descargarReportePDF(reporte)}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Descargar PDF
                </button>

                {!reporte.cerrado && (
                  <>
                    {!reporte.leido && (
                      <button
                        onClick={() => handleMarcarLeido(reporte.id)}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Marcar como Leído
                      </button>
                    )}
                    <button
                      onClick={() => handleCerrarReporte(reporte.id)}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Cerrar Reporte
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Cerrar Reporte"
        message="¿Estás seguro de que deseas marcar este reporte como cerrado? Esta acción lo archivará y ya no aparecerá en reportes pendientes."
        confirmText="Sí, cerrar"
        cancelText="Cancelar"
        onConfirm={confirmCerrarReporte}
        onCancel={() => setConfirmModal({ isOpen: false, reporteId: null })}
        type="warning"
      />
    </div>
  );
}
