import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CartContents, CartCount } from "@/components/cart";
import { HeaderAuthControls } from "@/components/account-link";

const NAV: [string, string][] = [
  ["/", "Inicio"],
  ["/proyectos", "Proyectos"],
  ["/perfiles", "Perfiles"],
  ["/tienda", "Tienda"],
  ["/faq", "Preguntas"],
  ["/contacto", "Contacto"],
];
const PRIVACY_KEY = "tandemy-priv";

export type Utility = "privacy" | "cart" | null;

/** Header, footer, phone menu, privacy notice and cart shared across Tandemy public pages. */
export function SiteChrome({
  active,
  children,
  utility,
  setUtility,
}: {
  active: string;
  children: ReactNode;
  utility: Utility;
  setUtility: (u: Utility) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(PRIVACY_KEY)) setUtility("privacy");
    } catch {
      setUtility("privacy");
    }
  }, [setUtility]);
  function close() {
    if (utility === "privacy") {
      try {
        localStorage.setItem(PRIVACY_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    setUtility(null);
  }
  const link =
    "rounded-full px-3 py-1.5 text-sm text-navy-foreground/80 transition hover:text-navy-foreground";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground shadow-card">
        <div className="container-page flex h-16 items-center gap-4">
          <Link className="font-display text-2xl font-bold tracking-tight" to="/">
            T<span className="text-cyan">andemy</span>
          </Link>
          <nav className="ml-6 hidden gap-1 lg:flex">
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                aria-current={href === active ? "page" : undefined}
                className={href === active ? `${link} bg-primary !text-primary-foreground` : link}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <HeaderAuthControls variant="header" />
            <button
              type="button"
              aria-label="Abrir carrito"
              onClick={() => setUtility("cart")}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-cyan px-3 text-xs font-semibold text-cyan-foreground shadow hover:bg-cyan/85"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <CartCount />
            </button>
            <button
              type="button"
              className="p-2 lg:hidden"
              aria-label="Menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 5h16" />
                    <path d="M4 12h16" />
                    <path d="M4 19h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav aria-label="Navegación móvil" className="container-page grid gap-1 py-3 lg:hidden">
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-primary"
              >
                {label}
              </a>
            ))}
            <HeaderAuthControls variant="mobile" onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 bg-navy text-navy-foreground/80">
        <div className="container-page grid gap-8 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl font-bold text-navy-foreground">
              T<span className="text-cyan">andemy</span>
            </p>
            <p className="mt-2 max-w-sm text-sm">
              Conectamos a estudiantes verificados de la Facultad de Contaduría y Administración de
              la UACH con PyMEs de Chihuahua.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="font-semibold text-navy-foreground">Plataforma</p>
            <a href="/proyectos">Proyectos</a>
            <a href="/tienda">Tienda</a>
            <a href="/perfiles">Perfiles</a>
            <a href="/registro?modo=login">Iniciar sesión</a>
            <a href="/registro">Crear cuenta</a>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="font-semibold text-navy-foreground">Ayuda</p>
            <a href="/faq">Preguntas frecuentes</a>
            <a href="/contacto">Contacto</a>
            <button type="button" className="text-left" onClick={() => setUtility("privacy")}>
              Aviso de privacidad
            </button>
          </div>
        </div>
        <div className="border-t border-navy-foreground/10 py-5 text-center text-xs">
          © 2026 Tandemy · Chihuahua, Chih., México · contacto@tandemy.mx
        </div>
      </footer>
      <Dialog
        open={utility !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-auto rounded-lg">
          <DialogTitle>{utility === "privacy" ? "Aviso de privacidad" : "Tu carrito"}</DialogTitle>
          <DialogDescription>
            {utility === "privacy"
              ? "Tandemy es responsable del tratamiento de tus datos personales."
              : "Plantillas y kits que agregaste."}
          </DialogDescription>
          {utility === "privacy" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Recopilamos: nombre, correo, matrícula, carrera y semestre (estudiantes); nombre
                comercial, RFC y datos de contacto (PyMEs); así como calificaciones e historial de
                proyectos.
              </p>
              <p className="text-sm text-muted-foreground">
                Los usamos para verificar tu identidad, conectar estudiantes con PyMEs, procesar
                pagos, emitir constancias y brindarte soporte. No guardamos datos de tarjeta.
                Compartimos tus datos solo con la UACH para confirmar que eres estudiante activo.
              </p>
              <p className="text-sm text-muted-foreground">
                Puedes ejercer tus derechos ARCO escribiendo a privacidad@tandemy.mx.
              </p>
              <Button onClick={close}>Acepto</Button>
            </>
          ) : (
            <CartContents />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={n <= Math.round(value) ? "fill-star text-star" : "text-border"}
          style={{ width: size, height: size }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      ))}
    </span>
  );
}
