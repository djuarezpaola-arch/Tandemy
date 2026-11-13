import { CartContents, CartCount } from "@/components/cart";
import { HeaderAuthControls } from "@/components/account-link";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import capturedCSS from "../styles/site.css?raw";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StudentAccess } from '@/components/student-access';
import { useTandemyAuth } from '@/components/student-session';
import { productImage } from '@/lib/store-products';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tandemy · Talento FCA UACH para PyMEs de Chihuahua" },
      { name: "description", content: "Tandemy conecta a estudiantes verificados de la FCA UACH con PyMEs de Chihuahua para proyectos reales, cortos y bien pagados." },
      { property: "og:title", content: "Tandemy · Talento FCA UACH para PyMEs de Chihuahua" },
      { property: "og:description", content: "Estudiantes verificados de la FCA UACH y PyMEs de Chihuahua trabajando juntos en proyectos reales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  staticData: { importedDocument: { html: { "lang": "es" } } },
  component: Index,
});

const PRIVACY_KEY = "tandemy-priv";

function Index() {
  const { profile } = useTandemyAuth();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [studentProject, setStudentProject] = useState<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const anyOpen = privacyOpen || cartOpen;

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(PRIVACY_KEY)) setPrivacyOpen(true);
    } catch {
      setPrivacyOpen(true);
    }
  }, []);

  const closePrivacy = () => {
    try {
      window.localStorage.setItem(PRIVACY_KEY, "1");
    } catch {
      /* ignore */
    }
    setPrivacyOpen(false);
  };
  const openPrivacy = () => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setPrivacyOpen(true);
  };
  const openCart = () => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setCartOpen(true);
  };

  useEffect(() => {
    if (!anyOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (privacyOpen ? privacyRef : cartRef).current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (cartOpen) setCartOpen(false);
      else if (privacyOpen) closePrivacy();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyOpen, privacyOpen, cartOpen]);

  return (
    <>
      <style>{capturedCSS}</style>
      <div className="flex min-h-screen flex-col">
        <ImportedHeader onOpenCart={openCart} cartOpen={cartOpen} />
        <main className="flex-1">
          <ImportedSectionTuFuturoComienzaAqu />
          <section className="container-page py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Carreras participantes</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={"rounded-full \x62order \x62g-card px-4 py-2 text-sm \x73hadow-card"}>Contador Público</span>
              <span className={"rounded-full \x62order \x62g-card px-4 py-2 text-sm \x73hadow-card"}>Licenciatura en Administración de Empresas</span>
              <span className={"rounded-full \x62order \x62g-card px-4 py-2 text-sm \x73hadow-card"}>Licenciatura en Administración Financiera</span>
              <span className={"rounded-full \x62order \x62g-card px-4 py-2 text-sm \x73hadow-card"}>Licenciatura en Administración y Gestión Pública</span>
              <span className={"rounded-full \x62order \x62g-card px-4 py-2 text-sm \x73hadow-card"}>Licenciatura en Negocios Internacionales</span>
              <span className={"rounded-full \x62order \x62g-card px-4 py-2 text-sm \x73hadow-card"}>Licenciatura en Inteligencia de Negocios</span>
            </div>
          </section>
          <ImportedSectionCMoFunciona />
          <ImportedSectionProyectosDestacados onApply={setStudentProject} />
          <ImportedSectionLoMSVendido />
          <ImportedSectionLoQueDicenDe />
        </main>
        <footer className={"mt-20 \x62g-navy \x74ext-navy-foreground/\x380"}>
          <div className="container-page grid gap-8 py-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="font-display text-2xl font-bold text-navy-foreground">T<span className="text-cyan">andemy</span></p>
              <p className="mt-2 max-w-sm text-sm">Conectamos a estudiantes verificados de la Facultad de Contaduría y Administración de la UACH con PyMEs de Chihuahua.</p>
            </div>
            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-navy-foreground">Plataforma</p>
              <a href="/proyectos">Proyectos</a>
              <a href="/tienda">Tienda</a>
              <a href="/perfiles">Perfiles</a>
              <a href="/registro">Crear cuenta</a>
            </div>
            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-navy-foreground">Ayuda</p>
              <a href="/faq">Preguntas frecuentes</a>
              <a href="/contacto">Contacto</a>
              <button className="text-left" type="button" onClick={openPrivacy}>Aviso de privacidad</button>
            </div>
          </div>
          <div className={"\x62order-t \x62order-navy-foreground/\x310 py-5 text-center text-xs"}>© 2026 Tandemy · Chihuahua, Chih., México · contacto@tandemy.mx</div>
        </footer>
        <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false" />
      </div>
      <Dialog open={studentProject !== null} onOpenChange={(open) => { if (!open) setStudentProject(null); }}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>{profile?.role === "student" ? "Enviar postulación" : "Acceso para estudiantes"}</DialogTitle>
            <DialogDescription>
              {profile?.role === "student"
                ? "Revisa los detalles del proyecto y envía tu propuesta."
                : "Inicia sesión o crea tu cuenta de estudiante."}
            </DialogDescription>
          </DialogHeader>
          <StudentAccess project={studentProject ?? undefined} onDone={() => setStudentProject(null)} />
        </DialogContent>
      </Dialog>
      {privacyOpen && (
      <>
      <div onClick={closePrivacy} className={"fixed inset-0 z-50 \x62g-black/\x380 \x64ata-[\x73tate=\x6fpen]:\x61nimate-in \x64ata-[\x73tate=\x63losed]:\x61nimate-out \x64ata-[\x73tate=\x63losed]:\x66ade-out-0 \x64ata-[\x73tate=\x6fpen]:\x66ade-in-0"} style={{ pointerEvents: "auto" }} data-state="open" aria-hidden="true" />
      <div ref={privacyRef} aria-modal="true" className={"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg \x74ranslate-x-[\x2d50%] \x74ranslate-y-[\x2d50%] gap-4 \x62order bg-background p-6 \x73hadow-lg duration-200 \x64ata-[\x73tate=\x6fpen]:\x61nimate-in \x64ata-[\x73tate=\x63losed]:\x61nimate-out \x64ata-[\x73tate=\x63losed]:\x66ade-out-0 \x64ata-[\x73tate=\x6fpen]:\x66ade-in-0 \x64ata-[\x73tate=\x63losed]:\x7aoom-out-95 \x64ata-[\x73tate=\x6fpen]:\x7aoom-in-95 sm:rounded-lg max-h-[85vh] overflow-auto"} style={{ pointerEvents: "auto" }} role="dialog" id="privacy-dialog" data-state="open" tabIndex={-1} aria-labelledby="radix-_R_1iqH1_">
        <div className={"flex flex-col \x73pace-y-1.\x35 text-center \x73m:\x74ext-left"}>
          <h2 className="text-lg font-semibold leading-none tracking-tight" id="radix-_R_1iqH1_">Aviso de privacidad</h2>
        </div>
        <div className={"\x73pace-y-3 text-sm text-muted-foreground"}>
          <p>Tandemy es responsable del tratamiento de tus datos personales. Recopilamos: nombre, correo, matrícula, carrera y semestre (estudiantes); nombre comercial, RFC y datos de contacto (PyMEs); así como calificaciones e historial de proyectos.</p>
          <p>Los usamos para verificar tu identidad, conectar estudiantes con PyMEs, procesar pagos, emitir constancias y brindarte soporte. No guardamos datos de tarjeta. Compartimos tus datos solo con la UACH para confirmar que eres estudiante activo.</p>
          <p>Puedes ejercer tus derechos ARCO escribiendo a privacidad@tandemy.mx.</p>
        </div>
        <button className={"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x70ointer-events-none disabled:opacity-50 \x64isabled:\x63ursor-not-allowed [&\x5fsvg]:\x70ointer-events-none [&\x5fsvg]:\x73ize-4 [&\x5fsvg]:\x73hrink-0 \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x390 h-9 px-4 py-2 rounded-full"} type="button" onClick={closePrivacy}>Acepto</button>
        <button className={"absolute right-4 top-4 rounded-sm opacity-70 \x72ing-offset-background cursor-pointer transition-opacity hover:opacity-100 \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x64isabled:\x70ointer-events-none \x64ata-[\x73tate=\x6fpen]:\x62g-accent \x64ata-[\x73tate=\x6fpen]:\x74ext-muted-foreground"} type="button" onClick={closePrivacy}>
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className={"\x73r-only"}>Close</span>
        </button>
      </div>
      </>
      )}
      {cartOpen && (
      <>
      <div onClick={() => setCartOpen(false)} className={"fixed inset-0 z-50 \x62g-black/\x380 \x64ata-[\x73tate=\x6fpen]:\x61nimate-in \x64ata-[\x73tate=\x6fpen]:\x66ade-in-0"} data-state="open" aria-hidden="true" />
      <div ref={cartRef} role="dialog" aria-modal="true" id="cart-sheet" data-state="open" tabIndex={-1} aria-labelledby="cart-sheet-title" className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:duration-500 data-[state=open]:animate-in inset-y-0 right-0 h-full border-l data-[state=open]:slide-in-from-right flex w-full flex-col sm:max-w-md">
        <button type="button" onClick={() => setCartOpen(false)} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 id="cart-sheet-title" className="text-lg font-semibold text-foreground">Tu carrito</h2>
        </div>
        <div className="flex-1 overflow-auto">
          <CartContents />
        </div>
      </div>
      </>
      )}
    </>
  );
}

function ImportedHeader({ onOpenCart, cartOpen }: { onOpenCart: () => void; cartOpen: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={"sticky top-0 z-40 \x62g-navy text-navy-foreground \x73hadow-card"}>
      <div className="container-page flex h-16 items-center gap-4">
        <a className="font-display text-2xl font-bold tracking-tight" aria-current="page" href="/">T<span className="text-cyan">andemy</span></a>
        <nav className={"ml-6 hidden gap-1 \x6cg:\x66lex"}>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground \x62g-primary !text-primary-foreground"} aria-current="page" href="/">Inicio</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/proyectos">Proyectos</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/perfiles">Perfiles</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/tienda">Tienda</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/faq">Preguntas</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/contacto">Contacto</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderAuthControls variant="header" />
          <button className={"inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x70ointer-events-none disabled:opacity-50 \x64isabled:\x63ursor-not-allowed [&\x5fsvg]:\x70ointer-events-none [&\x5fsvg]:\x73ize-4 [&\x5fsvg]:\x73hrink-0 \x62g-cyan text-cyan-foreground \x73hadow \x68over:\x62g-cyan/\x385 font-semibold h-8 px-3 text-xs rounded-full"} type="button" aria-label="Abrir carrito" aria-haspopup="dialog" aria-expanded={cartOpen} aria-controls="cart-sheet" onClick={onOpenCart}><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>{" "}<CartCount /></button>
          <button className={"p-2 \x6cg:\x68idden"} type="button" aria-label="Menú" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((v) => !v)} onKeyDown={(e) => { if (e.key === "Escape") setMenuOpen(false); }}>
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-nav" className="container-page grid gap-1 pb-4 lg:hidden" onKeyDown={(e) => { if (e.key === "Escape") setMenuOpen(false); }}>
          <a className="rounded-lg px-3 py-2 hover:bg-primary" aria-current="page" href="/" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a className="rounded-lg px-3 py-2 hover:bg-primary" href="/proyectos">Proyectos</a>
          <a className="rounded-lg px-3 py-2 hover:bg-primary" href="/perfiles">Perfiles</a>
          <a className="rounded-lg px-3 py-2 hover:bg-primary" href="/tienda">Tienda</a>
          <a className="rounded-lg px-3 py-2 hover:bg-primary" href="/faq">Preguntas</a>
          <a className="rounded-lg px-3 py-2 hover:bg-primary" href="/contacto">Contacto</a>
          <HeaderAuthControls variant="mobile" onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}
    </header>
  );
}

function ImportedSectionTuFuturoComienzaAqu() {
  return (
    <section className={"\x62g-hero text-navy-foreground"}>
      <a href="/proyectos" className="block" aria-label="Empieza tu primer proyecto">
        <img className="block h-auto w-full" src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_10.07.54_AM_98e9d41e.jpeg" alt="Tandemy. Tu futuro comienza aquí. Encuentra las mejores ideas, herramientas y recursos para crecer. Empieza tu primer proyecto." width="1600" height="900" fetchPriority="high" />
      </a>
      <div className="container-page py-8 md:py-10">
        <div className="grid items-center justify-items-center gap-5 md:grid-cols-2 md:justify-items-start md:gap-x-12">
          <p className={"inline-flex items-center gap-2 rounded-full \x62g-navy-foreground/\x310 px-3 py-1 text-sm"}><svg className="h-4 w-4 text-cyan" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></svg> Estudiantes verificados FCA UACH</p>
          <div className="flex w-full flex-wrap justify-center gap-3 md:col-start-1 md:justify-start">
            <a className={"inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x70ointer-events-none disabled:opacity-50 \x64isabled:\x63ursor-not-allowed [&\x5fsvg]:\x70ointer-events-none [&\x5fsvg]:\x73ize-4 [&\x5fsvg]:\x73hrink-0 \x62g-cyan text-cyan-foreground \x73hadow \x68over:\x62g-cyan/\x385 font-semibold h-11 rounded-full px-7 text-base"} href="/registro?tipo=estudiante"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg> Soy estudiante</a>
            <a className={"inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x70ointer-events-none disabled:opacity-50 \x64isabled:\x63ursor-not-allowed [&\x5fsvg]:\x70ointer-events-none [&\x5fsvg]:\x73ize-4 [&\x5fsvg]:\x73hrink-0 \x62order \x62order-navy-foreground/\x340 text-navy-foreground \x68over:\x62g-navy-foreground/\x310 h-11 rounded-full px-7 text-base"} href="/registro?tipo=pyme"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" /><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" /><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" /></svg> Soy PyME</a>
          </div>
          <dl className="grid w-full max-w-md grid-cols-3 gap-4 border-t border-navy-foreground/20 pt-6 text-center md:col-start-2 md:row-start-1 md:row-span-2 md:max-w-none md:border-t-0 md:border-l md:pl-8 md:pt-0">
            <div>
              <dt className="font-display text-3xl font-bold">120+</dt>
              <dd className={"text-sm \x74ext-navy-foreground/\x370"}>estudiantes</dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-bold">45</dt>
              <dd className={"text-sm \x74ext-navy-foreground/\x370"}>PyMEs</dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-bold">4.9</dt>
              <dd className={"text-sm \x74ext-navy-foreground/\x370"}>calificación</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function ImportedSectionCMoFunciona() {
  return (
    <section className={"\x62g-secondary py-16"} id="como-funciona">
      <div className="container-page">
        <h2 className="text-3xl font-bold md:text-4xl">¿Cómo funciona?</h2>
        <p className="mt-2 text-muted-foreground">Tres pasos para cada lado. Sin complicaciones.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className={"rounded-3xl \x62order \x62g-card p-7 \x73hadow-card"}>
            <div className="flex items-center gap-3">
              <span className={"grid h-11 w-11 place-items-center rounded-2xl \x62g-primary text-primary-foreground"}>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                  <path d="M22 10v6" />
                  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                </svg>
              </span>
              <h3 className="text-xl font-bold">Para estudiantes</h3>
            </div>
            <ol className={"mt-6 \x73pace-y-4"}>
              <li className="flex gap-4">
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full \x62g-accent font-display font-bold text-accent-foreground"}>1</span>
                <p className="pt-1">Crea tu cuenta con tu correo institucional y la UACH verifica que estés activo.</p>
              </li>
              <li className="flex gap-4">
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full \x62g-accent font-display font-bold text-accent-foreground"}>2</span>
                <p className="pt-1">Envía propuestas (monto, plazo y mensaje) a los proyectos de las PyMEs.</p>
              </li>
              <li className="flex gap-4">
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full \x62g-accent font-display font-bold text-accent-foreground"}>3</span>
                <p className="pt-1">Entrega el proyecto, recibe tu pago y una constancia para tu CV.</p>
              </li>
            </ol>
          </div>
          <div className={"rounded-3xl \x62order \x62g-card p-7 \x73hadow-card"}>
            <div className="flex items-center gap-3">
              <span className={"grid h-11 w-11 place-items-center rounded-2xl \x62g-primary text-primary-foreground"}>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  <rect width="20" height="14" x="2" y="6" rx="2" />
                </svg>
              </span>
              <h3 className="text-xl font-bold">Para PyMEs</h3>
            </div>
            <ol className={"mt-6 \x73pace-y-4"}>
              <li className="flex gap-4">
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full \x62g-accent font-display font-bold text-accent-foreground"}>1</span>
                <p className="pt-1">Regístrate con los datos de tu negocio y tu RFC.</p>
              </li>
              <li className="flex gap-4">
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full \x62g-accent font-display font-bold text-accent-foreground"}>2</span>
                <p className="pt-1">Publica tu proyecto con presupuesto y plazo, y elige la mejor propuesta.</p>
              </li>
              <li className="flex gap-4">
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full \x62g-accent font-display font-bold text-accent-foreground"}>3</span>
                <p className="pt-1">Revisa el avance y la entrega final; después se califican mutuamente.</p>
              </li>
            </ol>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={"flex gap-3 rounded-2xl \x62g-card p-5"}>
            <svg className="h-6 w-6 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <div>
              <p className="font-semibold">Estudiantes verificados</p>
              <p className="text-sm text-muted-foreground">Validación con la UACH de carrera, semestre y matrícula.</p>
            </div>
          </div>
          <div className={"flex gap-3 rounded-2xl \x62g-card p-5"}>
            <svg className="h-6 w-6 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6" />
              <path d="M14 2v5a1 1 0 0 0 1 1h5" />
              <path d="m14 20 2 2 4-4" />
            </svg>
            <div>
              <p className="font-semibold">Revisión en dos etapas</p>
              <p className="text-sm text-muted-foreground">Avance a mitad del proyecto y entrega final.</p>
            </div>
          </div>
          <div className={"flex gap-3 rounded-2xl \x62g-card p-5"}>
            <svg className="h-6 w-6 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m11 17 2 2a1 1 0 1 0 3-3" />
              <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
              <path d="m21 3 1 11h-2" />
              <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
              <path d="M3 4h8" />
            </svg>
            <div>
              <p className="font-semibold">Comisión transparente</p>
              <p className="text-sm text-muted-foreground">10% por proyecto. Registrarse es gratis.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImportedSectionProyectosDestacados({ onApply }: { onApply: (project: string) => void }) {
  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold">Proyectos destacados</h2>
        <a className="flex items-center gap-1 text-sm font-semibold text-primary" href="/proyectos">Ver todos <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
          <div className="flex flex-wrap gap-2">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Finanzas</div>
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug">Orden de costos para una cafetería</h3>
          <p className="text-sm text-muted-foreground">Café Aroma</p>
          <p className="mt-2 text-sm">Necesitamos calcular el costo real de cada bebida y definir precios.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-primary"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$1,500</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>10 días</span>
            <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Contador Público · Lic. Administración Financiera</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>2 propuestas</span>
          </div>
          <div className="mt-auto pt-5">
            <Button className="w-full rounded-full" onClick={() => onApply('Orden de costos para una cafetería')}>Postularme</Button>
          </div>
        </article>
        <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
          <div className="flex flex-wrap gap-2">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Marketing</div>
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug">Diseño de 10 publicaciones para redes</h3>
          <p className="text-sm text-muted-foreground">Boutique Luna</p>
          <p className="mt-2 text-sm">Publicaciones para la temporada navideña.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-primary"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$1,200</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>7 días</span>
            <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Administración de Empresas · Lic. Negocios Internacionales</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>1 propuestas</span>
          </div>
          <div className="mt-auto pt-5">
            <Button className="w-full rounded-full" onClick={() => onApply('Diseño de 10 publicaciones para redes')}>Postularme</Button>
          </div>
        </article>
        <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
          <div className="flex flex-wrap gap-2">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Administración</div>
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug">Manual de procesos para tienda de ropa</h3>
          <p className="text-sm text-muted-foreground">Moda Norte</p>
          <p className="mt-2 text-sm">Documentar procesos de venta, inventario y atención.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-primary"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$2,200</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>12 días</span>
            <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Administración de Empresas</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>0 propuestas</span>
          </div>
          <div className="mt-auto pt-5">
            <Button className="w-full rounded-full" onClick={() => onApply('Manual de procesos para tienda de ropa')}>Postularme</Button>
          </div>
        </article>
      </div>
    </section>
  );
}

function ImportedSectionLoMSVendido() {
  return (
    <section className="container-page pb-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold">Lo más vendido en la tienda</h2>
        <a className="flex items-center gap-1 text-sm font-semibold text-primary" href="/tienda">Ir a la tienda <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/costos-punto-equilibrio">
          <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
            <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("costos-punto-equilibrio")} alt="Plantilla Maestra de Costos y Punto de Equilibrio" loading="lazy" width="1024" height="1024" />
            <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>📊</span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Finanzas · Excel / Sheets</div>
            <h3 className="mt-2 font-semibold leading-snug">Plantilla Maestra de Costos y Punto de Equilibrio</h3>
            <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Calcula costos fijos, variables, márgenes y punto de equilibrio mensual.</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-lg font-bold text-primary">$149</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="4.5 de 5"><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(2)</span>
            </div>
          </div>
        </a>
        <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/inventarios-flujo-caja">
          <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
            <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("inventarios-flujo-caja")} alt="Control de Inventarios y Flujo de Caja PyME" loading="lazy" width="1024" height="1024" />
            <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>📦</span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Administración · Excel / Sheets</div>
            <h3 className="mt-2 font-semibold leading-snug">Control de Inventarios y Flujo de Caja PyME</h3>
            <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Entradas y salidas con alertas de stock mínimo y tablero mensual.</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-lg font-bold text-primary">$169</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="5.0 de 5"><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
            </div>
          </div>
        </a>
        <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/identidad-visual-redes">
          <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
            <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("identidad-visual-redes")} alt="Kit de Identidad Visual y Redes Sociales" loading="lazy" width="1024" height="1024" />
            <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>🎨</span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Marketing · Canva</div>
            <h3 className="mt-2 font-semibold leading-snug">Kit de Identidad Visual y Redes Sociales</h3>
            <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Más de 30 plantillas editables para posts, historias y catálogo.</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-lg font-bold text-primary">$179</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="5.0 de 5"><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(2)</span>
            </div>
          </div>
        </a>
        <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/calendario-contenido-90">
          <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
            <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("calendario-contenido-90")} alt="Calendario de Contenido y Estrategia Digital (90 días)" loading="lazy" width="1024" height="1024" />
            <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>📅</span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Marketing · Notion + PDF</div>
            <h3 className="mt-2 font-semibold leading-snug">Calendario de Contenido y Estrategia Digital (90 días)</h3>
            <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Planificador trimestral con ideas diarias y guiones para Reels/TikTok.</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-lg font-bold text-primary">$129</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="4.0 de 5"><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg className="text-border" style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

function ImportedSectionLoQueDicenDe() {
  return (
    <section className="container-page">
      <h2 className="text-3xl font-bold">Lo que dicen de Tandemy</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <figure className={"rounded-2xl \x62order \x62g-card p-6 \x73hadow-card"}>
          <span className="inline-flex gap-0.5" aria-label="5.0 de 5">
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
          </span>
          <blockquote className="mt-3 text-lg">“Encontré a una estudiante que ordenó mis costos en una semana.”</blockquote>
          <figcaption className="mt-4 text-sm font-semibold">Mariana, dueña de cafetería</figcaption>
        </figure>
        <figure className={"rounded-2xl \x62order \x62g-card p-6 \x73hadow-card"}>
          <span className="inline-flex gap-0.5" aria-label="5.0 de 5">
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
          </span>
          <blockquote className="mt-3 text-lg">“Mi primer proyecto real y una constancia para mi CV.”</blockquote>
          <figcaption className="mt-4 text-sm font-semibold">Diego, Contador Público</figcaption>
        </figure>
        <figure className={"rounded-2xl \x62order \x62g-card p-6 \x73hadow-card"}>
          <span className="inline-flex gap-0.5" aria-label="4.0 de 5">
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className={"\x66ill-star text-star"} style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <svg className="text-border" style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
          </span>
          <blockquote className="mt-3 text-lg">“Las plantillas me ahorraron horas de trabajo.”</blockquote>
          <figcaption className="mt-4 text-sm font-semibold">Laura, emprendedora</figcaption>
        </figure>
      </div>
    </section>
  );
}
