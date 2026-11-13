import { CartContents, CartCount } from "@/components/cart";
import { HeaderAuthControls } from "@/components/account-link";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StudentAccess } from '@/components/student-access';
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/pages/faq.css?raw";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{"title": "Preguntas frecuentes · Tandemy"}, {"name": "description", "content": "Respuestas sobre registro, proyectos, pagos y participación en Tandemy."}, {"property": "og:title", "content": "Preguntas frecuentes · Tandemy"}, {"property": "og:description", "content": "Respuestas sobre registro, proyectos, pagos y participación en Tandemy."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}] }),
  staticData: { importedDocument: { html: { "lang": "es" } } },
  component: Index,
});

function Index() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
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
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Ayuda</p>
              <h1 className="mt-2 text-4xl font-bold md:text-5xl">Preguntas frecuentes</h1>
            </div>
          </section>
          <div className="container-page max-w-3xl py-10">
            <div className={"rounded-2xl \x62order \x62g-card px-6 \x73hadow-card"}>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_1iiq_' ? null : 'radix-_R_1iiq_')} aria-expanded={openQuestion === 'radix-_R_1iiq_'} id="radix-_R_1iiq_">¿Qué es Tandemy?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_1iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_1iiq_">Una plataforma que conecta a estudiantes verificados de la FCA UACH con PyMEs de Chihuahua para proyectos cortos y reales.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_2iiq_' ? null : 'radix-_R_2iiq_')} aria-expanded={openQuestion === 'radix-_R_2iiq_'} id="radix-_R_2iiq_">¿Quién puede registrarse como estudiante?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_2iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_2iiq_">Estudiantes activos de las seis carreras de la FCA: Contador Público, Administración de Empresas, Administración Financiera, Administración y Gestión Pública, Negocios Internacionales e Inteligencia de Negocios.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_3iiq_' ? null : 'radix-_R_3iiq_')} aria-expanded={openQuestion === 'radix-_R_3iiq_'} id="radix-_R_3iiq_">¿Cuánto cuesta?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_3iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_3iiq_">Registrarse es gratis. Se cobra una comisión del 10% por proyecto completado.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_4iiq_' ? null : 'radix-_R_4iiq_')} aria-expanded={openQuestion === 'radix-_R_4iiq_'} id="radix-_R_4iiq_">¿Cómo se verifica a los estudiantes?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_4iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_4iiq_">Con tu correo institucional @uach.mx y tu matrícula; la universidad confirma carrera y semestre.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_5iiq_' ? null : 'radix-_R_5iiq_')} aria-expanded={openQuestion === 'radix-_R_5iiq_'} id="radix-_R_5iiq_">¿Cómo recibo mi pago?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_5iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_5iiq_">La PyME deposita al iniciar el proyecto y Tandemy libera el pago al estudiante cuando se aprueba la entrega final.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_6iiq_' ? null : 'radix-_R_6iiq_')} aria-expanded={openQuestion === 'radix-_R_6iiq_'} id="radix-_R_6iiq_">¿Los productos de la tienda se descargan al instante?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_6iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_6iiq_">Sí, son archivos digitales que recibes en tu correo justo después del pago.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_7iiq_' ? null : 'radix-_R_7iiq_')} aria-expanded={openQuestion === 'radix-_R_7iiq_'} id="radix-_R_7iiq_">¿Cómo funcionan las calificaciones?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_7iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_7iiq_">Al terminar un proyecto, la PyME califica al estudiante y el estudiante a la PyME. Las reseñas son públicas.</div>}
              </div>
              <div className={"\x62order-b"} data-state="closed">
                <h3 className="flex" data-state="closed">
                  <Button className={"flex flex-1 items-center justify-between py-4 font-medium cursor-pointer transition-all \x68over:\x75nderline [&[\x64ata-state=\x6fpen]>\x73vg]:\x72otate-180 text-left text-base h-auto whitespace-normal min-h-14"} variant="ghost" style={undefined} onClick={() => setOpenQuestion(openQuestion === 'radix-_R_8iiq_' ? null : 'radix-_R_8iiq_')} aria-expanded={openQuestion === 'radix-_R_8iiq_'} id="radix-_R_8iiq_">¿Recibo constancia?<svg aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Button>
                </h3>
                {openQuestion === 'radix-_R_8iiq_' && <div role="region" className="pb-4 text-sm text-muted-foreground" aria-labelledby="radix-_R_8iiq_">Sí. Cada proyecto completado genera una constancia de participación para tu CV.</div>}
              </div>
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
              <a aria-current="page" href="#">Preguntas frecuentes</a>
              <a href="/contacto">Contacto</a>
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
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground \x62g-primary !text-primary-foreground"} aria-current="page" href="#">Preguntas</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/contacto">Contacto</a>
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

