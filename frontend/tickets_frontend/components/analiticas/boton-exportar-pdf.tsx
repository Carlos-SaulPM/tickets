"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DashboardAnaliticasDTO } from "@/types/analiticas.types";

interface Props {
  data: DashboardAnaliticasDTO;
}

type DocumentoConAutoTable = jsPDF & {
  lastAutoTable?: { finalY?: number };
};

export function BotonExportarPdf({ data }: Props) {
  const [generando, setGenerando] = useState(false);

  const exportarPDF = () => {
    setGenerando(true);

    try {
      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text("Reporte de analíticas", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Fecha de generación: ${fechaActual}`, 14, 28);

      doc.setDrawColor(222, 226, 230);
      doc.line(14, 32, 196, 32);

      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Resumen de Tickets", 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [["Estado", "Cantidad", "Porcentaje"]],
        body: [
          [
            "Activos (Abiertos / En proceso / En revisión)",
            data.tickets.activos,
            `${Math.round((data.tickets.activos / (data.tickets.total || 1)) * 100)}%`,
          ],
          [
            "Resueltos (Pendientes de aprobación)",
            data.tickets.resueltos,
            `${Math.round((data.tickets.resueltos / (data.tickets.total || 1)) * 100)}%`,
          ],
          [
            "Cerrados",
            data.tickets.cerrados,
            `${Math.round((data.tickets.cerrados / (data.tickets.total || 1)) * 100)}%`,
          ],
          ["Total", data.tickets.total, "100%"],
        ],
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });

      const finalY = (doc as DocumentoConAutoTable).lastAutoTable?.finalY ?? 100;

      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Resumen de Usuarios", 14, finalY + 12);

      autoTable(doc, {
        startY: finalY + 16,
        head: [["Estado del Usuario", "Cantidad", "Porcentaje"]],
        body: [
          [
            "Usuarios Activos",
            data.usuarios.activos,
            `${Math.round((data.usuarios.activos / (data.usuarios.registrados || 1)) * 100)}%`,
          ],
          [
            "Usuarios inactivos",
            data.usuarios.inactivos,
            `${Math.round((data.usuarios.inactivos / (data.usuarios.registrados || 1)) * 100)}%`,
          ],
          ["Total de usuarios", data.usuarios.registrados, "100%"],
        ],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
      });

      doc.save(`reporte-analiticas-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Button onClick={exportarPDF} disabled={generando} variant="outline" size="sm">
      {generando ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
