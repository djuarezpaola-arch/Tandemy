import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Landmark,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartCount, cartTotal, useCart, type CartItem } from "@/lib/cart";
import { findProduct } from "@/lib/store-products";

type CheckoutStep = "cart" | "payment" | "receipt";

type CartPaymentOption = {
  id: "mercado_libre" | "tarjeta" | "oxxo" | "spei" | "paypal";
  label: string;
  subtitle: string;
  timing: string;
  icon: typeof Wallet;
};

const CART_PAYMENT_OPTIONS: CartPaymentOption[] = [
  {
    id: "mercado_libre",
    label: "Mercado Pago / Mercado Libre",
    subtitle: "Saldo en cuenta o compra protegida en 1 clic",
    timing: "Acreditación instantánea",
    icon: Wallet,
  },
  {
    id: "tarjeta",
    label: "Tarjeta de crédito o débito",
    subtitle: "Visa, Mastercard o American Express",
    timing: "Acreditación instantánea",
    icon: CreditCard,
  },
  {
    id: "oxxo",
    label: "Efectivo en OXXO",
    subtitle: "Pago con folio en cualquier sucursal OXXO",
    timing: "Confirmación inmediata en demo",
    icon: Store,
  },
  {
    id: "spei",
    label: "Transferencia electrónica SPEI",
    subtitle: "Desde la app de tu banco sin comisiones",
    timing: "Referencia automática",
    icon: Landmark,
  },
  {
    id: "paypal",
    label: "PayPal / Billetera digital",
    subtitle: "Autorización rápida sin ingresar tarjeta",
    timing: "Acreditación instantánea",
    icon: ShoppingBag,
  },
];

type CompletedOrder = {
  orderNumber: string;
  referenceCode: string;
  methodId: CartPaymentOption["id"];
  methodLabel: string;
  dateText: string;
  items: CartItem[];
  total: number;
};

function formatPrice(value: number): string {
  return `$${value.toLocaleString("es-MX")}`;
}

function generateOrderCodes(methodId: CartPaymentOption["id"]): {
  orderNumber: string;
  referenceCode: string;
} {
  const num = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `TDM-${num}`;
  if (methodId === "oxxo") {
    const partA = Math.floor(1000 + Math.random() * 9000);
    const partB = Math.floor(1000 + Math.random() * 9000);
    return { orderNumber, referenceCode: `9400-${partA}-${partB}-88` };
  }
  if (methodId === "spei") {
    return { orderNumber, referenceCode: `SPEI-${num}92` };
  }
  if (methodId === "mercado_libre") {
    return { orderNumber, referenceCode: `MP-${num}41` };
  }
  return { orderNumber, referenceCode: `PAY-${num}75` };
}

function downloadOrderSummary(order: CompletedOrder) {
  const lines = [
    "TANDEMY · COMPROBANTE DE COMPRA (MODO DEMOSTRACIÓN)",
    "==================================================",
    `Pedido: ${order.orderNumber}`,
    `Referencia: ${order.referenceCode}`,
    `Fecha: ${order.dateText}`,
    `Método de pago: ${order.methodLabel}`,
    "Estado: Pago aprobado",
    "",
    "PRODUCTOS ADQUIRIDOS:",
    ...order.items.map(
      (i) =>
        `- ${i.qty}x ${i.title} (${formatPrice(i.price)} c/u) = ${formatPrice(i.price * i.qty)}`,
    ),
    "",
    "Entrega digital: Gratis (Descarga inmediata)",
    `Total pagado (IVA incluido): ${formatPrice(order.total)} MXN`,
    "",
    "Gracias por impulsar el talento FCA UACH en Tandemy.",
  ].join("\n");

  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `comprobante-${order.orderNumber.toLowerCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function CartCount() {
  const { items } = useCart();
  return <>{cartCount(items)}</>;
}

export function CartContents() {
  const { items, update, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [selectedMethod, setSelectedMethod] = useState<CartPaymentOption["id"]>("mercado_libre");
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    if (items.length > 0 && step === "receipt") {
      setStep("cart");
      setCompletedOrder(null);
    }
  }, [items.length, step]);

  const total = cartTotal(items);
  const totalCount = cartCount(items);

  function handleConfirmSimulatedPayment() {
    if (items.length === 0 || processing) return;
    const methodObj =
      CART_PAYMENT_OPTIONS.find((m) => m.id === selectedMethod) ?? CART_PAYMENT_OPTIONS[0];
    if (!methodObj) return;

    setProcessing(true);
    const snapshotItems = items.map((item) => ({ ...item }));
    const snapshotTotal = total;

    window.setTimeout(() => {
      const codes = generateOrderCodes(methodObj.id);
      const dateText = new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());

      setCompletedOrder({
        orderNumber: codes.orderNumber,
        referenceCode: codes.referenceCode,
        methodId: methodObj.id,
        methodLabel: methodObj.label,
        dateText,
        items: snapshotItems,
        total: snapshotTotal,
      });
      clear();
      setProcessing(false);
      setStep("receipt");
    }, 350);
  }

  if (step === "receipt" && completedOrder) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="mt-2 text-base font-bold text-foreground">¡Pago realizado exitosamente!</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pedido{" "}
            <span className="font-semibold text-foreground">{completedOrder.orderNumber}</span> ·
            Confirmación de demostración
          </p>
        </div>

        <div className="space-y-2 rounded-xl border bg-secondary/40 p-4 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Método elegido</span>
            <span className="text-right font-medium text-foreground">
              {completedOrder.methodLabel}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Referencia</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {completedOrder.referenceCode}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Fecha</span>
            <span className="text-right text-foreground">{completedOrder.dateText}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Estado</span>
            <span className="font-semibold text-emerald-700">Aprobado · Listo para usar</span>
          </div>
          <div className="flex justify-between gap-2 border-t pt-2 font-bold">
            <span className="text-foreground">Total pagado</span>
            <span className="text-primary tabular-nums">
              {formatPrice(completedOrder.total)} MXN
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Productos incluidos en tu compra
          </p>
          <ul className="divide-y rounded-xl border bg-card">
            {completedOrder.items.map((item) => {
              const catalog = findProduct(item.slug);
              return (
                <li key={item.slug} className="p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <a
                        href={`/tienda/${item.slug}`}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {item.title}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} {item.qty === 1 ? "licencia" : "licencias"}
                        {catalog ? ` · ${catalog.format}` : ""}
                      </p>
                    </div>
                    <span className="font-semibold text-primary tabular-nums">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                  {catalog?.includes?.length ? (
                    <p className="mt-1.5 text-xs text-emerald-700">
                      Disponible para descarga: {catalog.includes.slice(0, 2).join(" · ")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 rounded-full"
            onClick={() => downloadOrderSummary(completedOrder)}
          >
            <Download className="h-4 w-4" />
            Descargar comprobante
          </Button>
          <Button asChild className="w-full rounded-full">
            <a href="/tienda">Seguir explorando la tienda</a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCompletedOrder(null);
              setStep("cart");
            }}
          >
            Volver al carrito vacío
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid gap-3 py-6 text-center text-muted-foreground">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Tu carrito está vacío</p>
        <p className="text-xs text-muted-foreground">
          Explora plantillas, guías y kits hechos por estudiantes de la FCA UACH.
        </p>
        <Button asChild variant="outline" className="mx-auto mt-1 rounded-full px-6">
          <a href="/tienda">Ir a la tienda</a>
        </Button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setStep("cart")}
            disabled={processing}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {totalCount} {totalCount === 1 ? "producto" : "productos"}
          </span>
        </div>

        <div className="rounded-xl border bg-secondary/40 p-3.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Total a pagar</span>
            <span className="text-lg font-bold text-primary tabular-nums">
              {formatPrice(total)} MXN
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Entrega digital inmediata · Envío gratis · IVA incluido
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">¿Cómo quieres pagar?</p>
          <div className="grid gap-2" role="radiogroup" aria-label="Opciones de pago">
            {CART_PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = selectedMethod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedMethod(option.id)}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                    active ? "border-primary bg-primary/5" : "bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.subtitle} · {option.timing}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background"
                    }`}
                    aria-hidden="true"
                  >
                    {active && <Check className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border bg-accent/40 p-3 text-xs text-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            Modo demostración: no te pediremos números de tarjeta, NIP, CVV ni datos bancarios. Al
            confirmar verás tu compra simulada completada.
          </span>
        </div>

        <Button
          type="button"
          disabled={processing}
          onClick={handleConfirmSimulatedPayment}
          className="h-11 w-full rounded-full text-sm font-semibold"
        >
          {processing ? "Procesando pago…" : `Confirmar y pagar ${formatPrice(total)} MXN`}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Productos ({totalCount})</span>
        <button
          type="button"
          onClick={() => clear()}
          className="font-medium text-muted-foreground hover:text-destructive hover:underline"
        >
          Vaciar carrito
        </button>
      </div>

      <ul className="divide-y rounded-xl border bg-card">
        {items.map((item) => {
          const catalog = findProduct(item.slug);
          const thumb = catalog?.gallery?.[0];
          return (
            <li key={item.slug} className="flex gap-3 p-3.5">
              {thumb ? (
                <img
                  src={thumb}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border bg-secondary text-lg">
                  {catalog?.emoji ?? "📄"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={`/tienda/${item.slug}`}
                  className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
                >
                  {item.title}
                </a>
                {catalog && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {catalog.category} · {catalog.format}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border bg-background">
                      <button
                        type="button"
                        className="h-8 w-8 text-sm font-medium hover:bg-secondary"
                        aria-label={`Quitar uno de ${item.title}`}
                        onClick={() => update(item.slug, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-medium tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        className="h-8 w-8 text-sm font-medium hover:bg-secondary"
                        aria-label={`Agregar uno de ${item.title}`}
                        onClick={() => update(item.slug, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => update(item.slug, 0)}
                      aria-label={`Eliminar ${item.title}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 rounded-xl border bg-secondary/40 p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Productos ({totalCount})</span>
          <span className="font-medium text-foreground tabular-nums">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Entrega digital</span>
          <span className="font-semibold text-emerald-700">Gratis</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-lg text-primary tabular-nums">{formatPrice(total)} MXN</span>
        </div>
        <p className="text-xs text-muted-foreground">
          IVA incluido · Aceptamos Mercado Pago, tarjetas, OXXO y SPEI
        </p>
      </div>

      <Button
        type="button"
        onClick={() => setStep("payment")}
        className="h-11 w-full rounded-full text-sm font-semibold"
      >
        Pagar
      </Button>
    </div>
  );
}
