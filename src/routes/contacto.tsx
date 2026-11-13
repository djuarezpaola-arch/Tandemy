import { CartContents, CartCount } from "@/components/cart";
import { HeaderAuthControls } from "@/components/account-link";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StudentAccess } from '@/components/student-access';
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/pages/contacto.css?raw";

export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: [{"title": "Contacto · Tandemy"}, {"name": "description", "content": "Contacta al equipo de Tandemy para resolver dudas o proponer alianzas."}, {"property": "og:title", "content": "Contacto · Tandemy"}, {"property": "og:description", "content": "Contacta al equipo de Tandemy para resolver dudas o proponer alianzas."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}] }),
  staticData: { importedDocument: { html: { "lang": "es" } } },
  component: Index,
});

function Index() {
  const [contactNotice, setContactNotice] = useState(false);
  const [utility, setUtility] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem('tandemy-priv')) setUtility('privacy'); } catch { setUtility('privacy'); } }, []);
  function closeUtility() { if (utility === 'privacy') { try { localStorage.setItem('tandemy-priv', '1'); } catch {} } setUtility(null); }

  return (
    <>
      <style>{capturedCSS}</style>
      <div className="flex min-h-screen flex-col" onClick={(event) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button');
    if (button?.getAttribute('aria-label') === 'Menú') setMenuOpen(open => !open);
    else if (button?.textContent?.trim() === 'Aviso de privacidad') setUtility('privacy');
    else if (button?.querySelector('circle[cx="8"]')) setUtility('cart');
  }}>
        <ImportedHeader />
{menuOpen && <nav aria-label="Navegación móvil" className="container-page grid gap-1 py-3 lg:hidden">{[['/', 'Inicio'], ['/proyectos', 'Proyectos'], ['/perfiles', 'Perfiles'], ['/tienda', 'Tienda'], ['/faq', 'Preguntas'], ['/contacto', 'Contacto']].map(([href, label]) => <a key={href} href={href} className="rounded-lg px-3 py-2 hover:bg-primary">{label}</a>)}<HeaderAuthControls variant="mobile" onNavigate={() => setMenuOpen(false)} /></nav>}
        <main className="flex-1">
          <section className={"\x62g-hero text-navy-foreground"}>
            <div className="container-page py-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Contacto</p>
              <h1 className="mt-2 text-4xl font-bold md:text-5xl">Hablemos</h1>
              <div className={"mt-3 max-w-2xl \x74ext-navy-foreground/\x380"}>¿Tienes dudas o quieres una alianza con tu negocio? Te respondemos en menos de 24 horas.</div>
            </div>
          </section>
          <div className="container-page grid gap-8 py-10 md:grid-cols-[1fr_360px]">
            <form onSubmit={(event) => { event.preventDefault(); setContactNotice(true); }} className={"grid gap-4 rounded-2xl \x62order \x62g-card p-6 \x73hadow-card"}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={"text-sm font-medium leading-none \x70eer-disabled:\x63ursor-not-allowed \x70eer-disabled:\x6fpacity-70"}>Nombre</label>
                  <input className={"flex h-9 w-full rounded-md \x62order \x62order-input bg-transparent px-3 py-1 text-base \x73hadow-sm transition-colors \x66ile:\x62order-0 \x66ile:\x62g-transparent \x66ile:\x74ext-sm \x66ile:\x66ont-medium \x66ile:\x74ext-foreground \x70laceholder:\x74ext-muted-foreground \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x63ursor-not-allowed disabled:opacity-50 md:text-sm"} required />
                </div>
                <div>
                  <label className={"text-sm font-medium leading-none \x70eer-disabled:\x63ursor-not-allowed \x70eer-disabled:\x6fpacity-70"}>Correo</label>
                  <input className={"flex h-9 w-full rounded-md \x62order \x62order-input bg-transparent px-3 py-1 text-base \x73hadow-sm transition-colors \x66ile:\x62order-0 \x66ile:\x62g-transparent \x66ile:\x74ext-sm \x66ile:\x66ont-medium \x66ile:\x74ext-foreground \x70laceholder:\x74ext-muted-foreground \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x63ursor-not-allowed disabled:opacity-50 md:text-sm"} type="email" required />
                </div>
              </div>
              <div>
                <label className={"text-sm font-medium leading-none \x70eer-disabled:\x63ursor-not-allowed \x70eer-disabled:\x6fpacity-70"}>Mensaje</label>
                <textarea className={"flex min-h-[60px] w-full rounded-md \x62order \x62order-input bg-transparent px-3 py-2 text-base \x73hadow-sm \x70laceholder:\x74ext-muted-foreground \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x63ursor-not-allowed disabled:opacity-50 md:text-sm"} rows={5} required />
              </div>
              <button className={"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x70ointer-events-none disabled:opacity-50 \x64isabled:\x63ursor-not-allowed [&\x5fsvg]:\x70ointer-events-none [&\x5fsvg]:\x73ize-4 [&\x5fsvg]:\x73hrink-0 \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x390 h-9 px-4 py-2 w-fit rounded-full"}>Enviar mensaje</button>
            {contactNotice && <p role="status" className="text-sm text-muted-foreground">El envío de mensajes aún no está conectado. Puedes escribir a contacto@tandemy.mx.</p>}</form>
            <div className={"grid h-fit gap-4 rounded-2xl \x62g-secondary p-6"}>
              <h2 className="text-xl font-bold">Nosotros</h2>
              <p className="text-sm text-muted-foreground">Proyecto de estudiantes de la Facultad de Contaduría y Administración de la UACH.</p>
              <p className="flex gap-2 text-sm"><svg aria-hidden="true" className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg> Circuito Universitario, Campus II, Chihuahua, Chih.</p>
              <p className="flex gap-2 text-sm"><svg aria-hidden="true" className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> contacto@tandemy.mx</p>
              <p className="flex gap-2 text-sm"><svg aria-hidden="true" className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> Lunes a viernes, 9:00 a 18:00</p>
            </div>
          </div>
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
              <a aria-current="page" href="#">Contacto</a>
              <button className="text-left">Aviso de privacidad</button>
            </div>
          </div>
          <div className={"\x62order-t \x62order-navy-foreground/\x310 py-5 text-center text-xs"}>© 2026 Tandemy · Chihuahua, Chih., México · contacto@tandemy.mx</div>
        </footer>
        <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false" />
      </div>
<Dialog open={utility !== null} onOpenChange={(open) => { if (!open) closeUtility(); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-auto rounded-lg"><DialogTitle>{utility === 'privacy' ? 'Aviso de privacidad' : utility === 'cart' ? 'Tu carrito' : 'Acceso para estudiantes'}</DialogTitle><DialogDescription>{utility === 'privacy' ? 'Tandemy es responsable del tratamiento de tus datos personales.' : utility === 'cart' ? 'Plantillas y kits que agregaste.' : 'Inicia sesión o crea tu cuenta de estudiante.'}</DialogDescription>{utility === 'privacy' ? <><p className="text-sm text-muted-foreground">Recopilamos: nombre, correo, matrícula, carrera y semestre (estudiantes); nombre comercial, RFC y datos de contacto (PyMEs); así como calificaciones e historial de proyectos.</p><p className="text-sm text-muted-foreground">Los usamos para verificar tu identidad, conectar estudiantes con PyMEs, procesar pagos, emitir constancias y brindarte soporte. No guardamos datos de tarjeta. Compartimos tus datos solo con la UACH para confirmar que eres estudiante activo.</p><p className="text-sm text-muted-foreground">Puedes ejercer tus derechos ARCO escribiendo a privacidad@tandemy.mx.</p><Button onClick={closeUtility}>Acepto</Button></> : utility === 'cart' ? <CartContents /> : <StudentAccess project={utility ?? undefined} />}</DialogContent></Dialog>
    </>
  );
}

function ImportedHeader() {
  return (
    <header className={"sticky top-0 z-40 \x62g-navy text-navy-foreground \x73hadow-card"}>
      <div className="container-page flex h-16 items-center gap-4">
        <a className="font-display text-2xl font-bold tracking-tight" href="/">T<span className="text-cyan">andemy</span></a>
        <nav className={"ml-6 hidden gap-1 \x6cg:\x66lex"}>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/">Inicio</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/proyectos">Proyectos</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/perfiles">Perfiles</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/tienda">Tienda</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/faq">Preguntas</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground \x62g-primary !text-primary-foreground"} aria-current="page" href="#">Contacto</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderAuthControls variant="header" />
          <button className={"inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x70ointer-events-none disabled:opacity-50 \x64isabled:\x63ursor-not-allowed [&\x5fsvg]:\x70ointer-events-none [&\x5fsvg]:\x73ize-4 [&\x5fsvg]:\x73hrink-0 \x62g-cyan text-cyan-foreground \x73hadow \x68over:\x62g-cyan/\x385 font-semibold h-8 px-3 text-xs rounded-full"}><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>{" "}<CartCount /></button>
          <button className={"p-2 \x6cg:\x68idden"} aria-label="Menú">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16" />
              <path d="M4 12h16" />
              <path d="M4 19h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

