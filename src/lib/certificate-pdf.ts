import { jsPDF } from "jspdf";
import type { DigitalCertificate } from "./tandemy-types";

export function downloadCertificatePdf(cert: DigitalCertificate): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Outer Navy Frame
  doc.setFillColor(15, 35, 71);
  doc.rect(0, 0, width, height, "F");

  // Crisp Off-White Inner Diploma Sheet
  doc.setFillColor(248, 250, 253);
  doc.roundedRect(10, 10, width - 20, height - 20, 4, 4, "F");

  // Cyan Accent Border
  doc.setDrawColor(0, 180, 216);
  doc.setLineWidth(1.2);
  doc.roundedRect(14, 14, width - 28, height - 28, 3, 3, "S");

  // Top Header Band
  doc.setFillColor(15, 35, 71);
  doc.rect(14, 14, width - 28, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Tandemy", 24, 30);

  doc.setTextColor(0, 180, 216);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "PLATAFORMA DE VINCULACIÓN UNIVERSITARIA · FCA UACH · CHIHUAHUA, MÉXICO",
    width - 24,
    30,
    { align: "right" },
  );

  // Title
  doc.setTextColor(15, 35, 71);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CONSTANCIA DIGITAL DE PROYECTO COMPLETADO", width / 2, 58, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text("Se otorga la presente constancia a:", width / 2, 70, {
    align: "center",
  });

  // Student Name
  doc.setTextColor(15, 35, 71);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(cert.studentName, width / 2, 84, { align: "center" });

  // Degree & University
  const academicLine = [
    cert.studentDegree || "Estudiante FCA",
    cert.studentUniversity || "Universidad Autónoma de Chihuahua",
  ]
    .filter(Boolean)
    .join(" · ");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 136, 170);
  doc.text(academicLine, width / 2, 93, { align: "center" });

  // Body description
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);
  const introText = `Por haber concluido satisfactoriamente el proyecto "${cert.projectTitle}" en colaboración con la empresa ${cert.companyName}, validado por ambas partes dentro de la plataforma Tandemy.`;
  const wrappedIntro = doc.splitTextToSize(introText, width - 70);
  doc.text(wrappedIntro, width / 2, 107, { align: "center" });

  // Activities Box
  doc.setFillColor(238, 244, 250);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(32, 124, width - 64, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 35, 71);
  doc.text("ACTIVIDADES REALIZADAS", 38, 132);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const activitiesTrimmed =
    cert.activitiesSummary.length > 340
      ? `${cert.activitiesSummary.slice(0, 337)}...`
      : cert.activitiesSummary;
  const wrappedActivities = doc.splitTextToSize(activitiesTrimmed, width - 76);
  doc.text(wrappedActivities, 38, 139);

  // Signatures & Metadata Footer
  const footerY = height - 42;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(35, footerY, 105, footerY);
  doc.line(width - 105, footerY, width - 35, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 35, 71);
  doc.text(cert.companyName, 70, footerY + 6, { align: "center" });
  doc.text("Tandemy FCA UACH", width - 70, footerY + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Empresa participante", 70, footerY + 11, { align: "center" });
  doc.text("Plataforma de intermediación académica", width - 70, footerY + 11, {
    align: "center",
  });

  // Folio and Completion Date
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Fecha de finalización: ${cert.completedAt}   |   Folio digital: ${cert.certificateCode}`,
    width / 2,
    height - 20,
    { align: "center" },
  );

  const safeSlug = cert.projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  doc.save(`Constancia_Tandemy_${safeSlug || cert.certificateCode}.pdf`);
}
