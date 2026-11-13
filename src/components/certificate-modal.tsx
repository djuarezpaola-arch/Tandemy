import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";
import type { DigitalCertificate } from "@/lib/tandemy-types";

export function CertificateModal({
  certificate,
  onClose,
}: {
  certificate: DigitalCertificate | null;
  onClose: () => void;
}) {
  if (!certificate) return null;

  return (
    <Dialog
      open={Boolean(certificate)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Constancia digital de proyecto completado
        </DialogTitle>
        <DialogDescription>
          Documento oficial emitido por Tandemy al confirmarse el término del proyecto.
        </DialogDescription>

        <div className="overflow-hidden rounded-2xl border-2 border-cyan/50 bg-card shadow-card">
          <div className="flex items-center justify-between bg-navy px-6 py-4 text-navy-foreground">
            <span className="font-display text-xl font-bold">
              T<span className="text-cyan">andemy</span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan">
              FCA UACH · Chihuahua, Méx.
            </span>
          </div>

          <div className="space-y-4 p-6 text-center sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Constancia de participación y entrega
            </p>
            <div>
              <p className="text-xs text-muted-foreground">Se otorga la presente a</p>
              <h3 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {certificate.studentName}
              </h3>
              <p className="mt-1 text-xs font-medium text-primary">
                {[certificate.studentDegree, certificate.studentUniversity]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Por haber completado satisfactoriamente el proyecto{" "}
              <strong className="text-foreground">“{certificate.projectTitle}”</strong> en
              colaboración con{" "}
              <strong className="text-foreground">{certificate.companyName}</strong>.
            </p>

            <div className="rounded-xl border bg-secondary/50 p-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Actividades realizadas
              </p>
              <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                {certificate.activitiesSummary}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
              <span>Finalización: {certificate.completedAt}</span>
              <span className="font-mono font-semibold text-foreground">
                Folio: {certificate.certificateCode}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            onClick={() => downloadCertificatePdf(certificate)}
            className="gap-2 rounded-full"
          >
            <Download className="h-4 w-4" />
            Descargar constancia PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
