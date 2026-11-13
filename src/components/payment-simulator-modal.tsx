import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
  Store,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { payProjectSimulated } from "@/lib/tandemy-db";
import {
  formatMxn,
  PAYMENT_METHODS,
  PAYMENT_STATUS_LABEL,
  type PaymentMethodId,
  type PaymentStatus,
  type SimulatedPayment,
  type TandemyProject,
} from "@/lib/tandemy-types";

const METHOD_ICON: Record<PaymentMethodId, typeof CreditCard> = {
  credit_card: CreditCard,
  debit_card: Wallet,
  oxxo: Store,
  bank_transfer: Landmark,
  digital_wallet: Smartphone,
};

export function PaymentSimulatorModal({
  open,
  onOpenChange,
  payment,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: SimulatedPayment | null;
  project: TandemyProject | null;
}) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("credit_card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    referenceCode: string;
    status: PaymentStatus;
    dateText: string;
    methodLabel: string;
  } | null>(null);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setReceipt(null);
      setError("");
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirmPayment() {
    if (!payment || !project) return;
    const methodObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const methodLabel = methodObj?.label ?? "Tarjeta de crédito";
    setBusy(true);
    setError("");
    try {
      const result = await payProjectSimulated({
        payment,
        project,
        methodLabel,
      });
      setReceipt({
        referenceCode: result.referenceCode,
        status: result.status as PaymentStatus,
        dateText: result.dateText,
        methodLabel,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos registrar el pago simulado.");
    } finally {
      setBusy(false);
    }
  }

  if (!payment || !project) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl">
        {!receipt ? (
          <>
            <DialogTitle>Realizar pago del proyecto (Simulación)</DialogTitle>
            <DialogDescription>
              Selecciona el método de pago de tu preferencia. No se solicitan números de tarjeta,
              CVV ni datos bancarios reales.
            </DialogDescription>

            <div className="space-y-4">
              <div className="rounded-xl border bg-secondary/40 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Proyecto
                    </p>
                    <p className="font-semibold text-foreground">{payment.projectTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Estudiante seleccionado: {payment.studentName}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary tabular-nums">
                    {formatMxn(payment.amount)}
                  </p>
                </div>

                <div className="mt-3 space-y-1 border-t pt-2.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Monto acordado del proyecto</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatMxn(payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión de plataforma Tandemy (10%)</span>
                    <span className="tabular-nums">{formatMxn(payment.platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Monto neto que recibirá el estudiante</span>
                    <span className="tabular-nums">{formatMxn(payment.studentNetAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Elige un método de pago</p>
                <div className="grid gap-2" role="radiogroup" aria-label="Método de pago">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = METHOD_ICON[method.id];
                    const active = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                          active ? "border-primary bg-primary/5" : "bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.subtitle}</p>
                          </div>
                        </div>
                        <span className="hidden rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground sm:inline-block">
                          {method.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-accent/50 p-3 text-xs text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {project.status === "completed"
                    ? "Como el proyecto ya está finalizado, el pago se liberará de inmediato al estudiante."
                    : "El pago quedará protegido en garantía (Pago pendiente de liberación) y se liberará automáticamente al estudiante cuando ambas partes confirmen el término del proyecto."}
                </span>
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={busy}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleConfirmPayment()}
                  disabled={busy}
                  className="rounded-full px-6"
                >
                  {busy ? "Procesando…" : `Pagar ${formatMxn(payment.amount)}`}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5 py-2">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogTitle className="mt-3 text-xl">¡Pago realizado exitosamente!</DialogTitle>
              <DialogDescription className="mt-1">
                Comprobante de operación simulada en Tandemy
              </DialogDescription>
            </div>

            <div className="space-y-2.5 rounded-xl border bg-secondary/40 p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Proyecto</span>
                <span className="text-right font-semibold">{payment.projectTitle}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Estudiante</span>
                <span className="text-right font-medium">{payment.studentName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Monto pagado</span>
                <span className="font-bold text-primary tabular-nums">
                  {formatMxn(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Comisión Tandemy (10%)</span>
                <span className="tabular-nums">{formatMxn(payment.platformFee)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Neto estudiante</span>
                <span className="font-semibold tabular-nums">
                  {formatMxn(payment.studentNetAmount)}
                </span>
              </div>
              <div className="flex justify-between gap-2 border-t pt-2">
                <span className="text-muted-foreground">Método utilizado</span>
                <span className="font-medium">{receipt.methodLabel}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Fecha</span>
                <span>{receipt.dateText}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Código de referencia</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {receipt.referenceCode}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Estado del pago</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {PAYMENT_STATUS_LABEL[receipt.status]}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleClose(false)}
              className="w-full rounded-full"
            >
              Listo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
