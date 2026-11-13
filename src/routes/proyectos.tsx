import { CartContents, CartCount } from "@/components/cart";
import { HeaderAuthControls } from "@/components/account-link";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StudentAccess } from '@/components/student-access';
import { useTandemyAuth } from '@/components/student-session';
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { applyToProject, authErrorToSpanish } from "@/lib/tandemy-db";
import type { TandemyProject } from "@/lib/tandemy-types";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import capturedCSS from "../styles/pages/proyectos.css?raw";

export const Route = createFileRoute("/proyectos")({
  head: () => ({ meta: [{"title": "Proyectos · Tandemy"}, {"name": "description", "content": "Explora proyectos de PyMEs de Chihuahua para estudiantes de la FCA UACH."}, {"property": "og:title", "content": "Proyectos · Tandemy"}, {"property": "og:description", "content": "Explora proyectos de PyMEs de Chihuahua para estudiantes de la FCA UACH."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}] }),
  staticData: { importedDocument: { html: { "lang": "es" } } },
  component: Index,
});

function Index() {
  const { profile } = useTandemyAuth();
  const projectGrid = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [degree, setDegree] = useState('');
  const [budget, setBudget] = useState('');
  const [count, setCount] = useState(7);
  const [liveProjects, setLiveProjects] = useState<TandemyProject[]>([]);
  const [selectedLiveProject, setSelectedLiveProject] = useState<TandemyProject | null>(null);
  const [proposedAmount, setProposedAmount] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applyBusy, setApplyBusy] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const q = query(collection(db, "projects"), where("status", "==", "open"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Omit<TandemyProject, "id">), id: d.id }));
        items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setLiveProjects(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "projects");
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    let visible = 0;
    for (const article of projectGrid.current?.querySelectorAll('article') ?? []) {
      const text = article.textContent ?? '';
      const price = Array.from(article.querySelectorAll('span')).find(span => span.textContent?.trim().startsWith('$'))?.textContent ?? '';
      const amount = Number(price.match(/\$([\d,]+)/)?.[1]?.replaceAll(',', '') ?? 0);
      const matches = text.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && text.includes(degree) && (!budget || (budget === 'low' ? amount < 1500 : budget === 'medium' ? amount >= 1500 && amount <= 3000 : amount > 3000));
      article.hidden = !matches;
      if (matches) visible++;
    }
    setCount(visible);
  }, [search, degree, budget, liveProjects]);
  const [utility, setUtility] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem('tandemy-priv')) setUtility('privacy'); } catch { setUtility('privacy'); } }, []);
  function closeUtility() { if (utility === 'privacy') { try { localStorage.setItem('tandemy-priv', '1'); } catch {} } setUtility(null); }

  function openLiveProjectModal(project: TandemyProject) {
    setSelectedLiveProject(project);
    setProposedAmount(String(project.budget));
    setProposedDuration(project.duration);
    setCoverLetter('');
    setApplySuccess('');
    setApplyError('');
  }

  async function handleApplySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLiveProject || !profile || profile.role !== 'student') return;
    setApplyBusy(true);
    setApplyError('');
    setApplySuccess('');
    try {
      await applyToProject({
        project: selectedLiveProject,
        studentProfile: profile,
        proposedAmount: Number(proposedAmount) || selectedLiveProject.budget,
        proposedDuration: proposedDuration || selectedLiveProject.duration,
        coverLetter,
      });
      setApplySuccess('¡Postulación enviada exitosamente! La PyME recibirá tu propuesta y podrás darle seguimiento desde tu panel.');
    } catch (err) {
      setApplyError(authErrorToSpanish(err));
    } finally {
      setApplyBusy(false);
    }
  }

  return (
    <>
      <style>{capturedCSS}</style>
      <div className="flex min-h-screen flex-col" onClick={(event) => {
    const target = event.target as HTMLElement;
    const application = target.closest('[data-student-application]');
    if (application) setUtility(application.closest('article')?.querySelector('h3')?.textContent ?? '');
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
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Proyectos</p>
              <h1 className="mt-2 text-4xl font-bold md:text-5xl">Encuentra tu próximo proyecto</h1>
              <div className={"mt-3 max-w-2xl \x74ext-navy-foreground/\x380"}>Las PyMEs publican; los estudiantes de la FCA envían su propuesta.</div>
            </div>
          </section>
          <div className="container-page py-10">
            <div className={"flex flex-col gap-3 \x6dd:\x66lex-row"}>
              <input className={"flex h-9 w-full rounded-md \x62order \x62order-input bg-transparent px-3 py-1 text-base \x73hadow-sm transition-colors \x66ile:\x62order-0 \x66ile:\x62g-transparent \x66ile:\x74ext-sm \x66ile:\x66ont-medium \x66ile:\x74ext-foreground \x70laceholder:\x74ext-muted-foreground \x66ocus-visible:\x6futline-none \x66ocus-visible:\x72ing-1 \x66ocus-visible:\x72ing-ring \x64isabled:\x63ursor-not-allowed disabled:opacity-50 md:text-sm md:max-w-sm"} placeholder="Buscar por título, PyME o habilidad…" value={search} onChange={event => setSearch(event.target.value)} />
              <select aria-label="Carrera" value={degree} onChange={event => setDegree(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 md:w-80"><option value="">Todas las carreras</option>{['Contador Público','Administración de Empresas','Administración Financiera','Administración y Gestión Pública','Negocios Internacionales','Inteligencia de Negocios'].map(value => <option key={value}>{value}</option>)}</select>
              <select aria-label="Presupuesto" value={budget} onChange={event => setBudget(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 md:w-56"><option value="">Todos los presupuestos</option><option value="low">Menos de $1,500</option><option value="medium">$1,500 a $3,000</option><option value="high">Más de $3,000</option></select>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{count} proyectos</p>
            <div ref={projectGrid} className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {liveProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {project.area}
                    </div>
                    <div className="inline-flex items-center rounded-md border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow">
                      Abierto · Nuevo
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.companyName}</p>
                  <p className="mt-2 line-clamp-3 text-sm">{project.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-primary">
                      ${Number(project.budget || 0).toLocaleString("es-MX")}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {project.duration}
                    </span>
                    <span className="col-span-2 text-xs text-muted-foreground">
                      {project.targetDegrees?.length ? project.targetDegrees.join(" · ") : "Todas las carreras FCA"}
                    </span>
                    {project.deadline && (
                      <span className="col-span-2 text-xs text-muted-foreground">
                        Fecha límite: {project.deadline}
                      </span>
                    )}
                  </div>
                  {project.requiredSkills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.requiredSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-5">
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={() => openLiveProjectModal(project)}
                    >
                      Ver detalles y postularme
                    </Button>
                  </div>
                </article>
              ))}
              <ImportedArticle />
              <ImportedArticle2 />
              <ImportedArticle3 />
              <ImportedArticle4 />
              <ImportedArticle5 />
              <ImportedArticle6 />
              <ImportedArticle7 />
{count === 0 && <p className="text-muted-foreground">No se encontraron proyectos.</p>}
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
              <a aria-current="page" href="#">Proyectos</a>
              <a href="/tienda">Tienda</a>
              <a href="/perfiles">Perfiles</a>
              <a href="/registro">Crear cuenta</a>
            </div>
            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-navy-foreground">Ayuda</p>
              <a href="/faq">Preguntas frecuentes</a>
              <a href="/contacto">Contacto</a>
              <button className="text-left">Aviso de privacidad</button>
            </div>
          </div>
          <div className={"\x62order-t \x62order-navy-foreground/\x310 py-5 text-center text-xs"}>© 2026 Tandemy · Chihuahua, Chih., México · contacto@tandemy.mx</div>
        </footer>
        <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false" />
      </div>
<Dialog open={utility !== null} onOpenChange={(open) => { if (!open) closeUtility(); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-auto rounded-lg"><DialogTitle>{utility === 'privacy' ? 'Aviso de privacidad' : utility === 'cart' ? 'Tu carrito' : profile?.role === 'student' ? 'Enviar postulación' : 'Acceso para estudiantes'}</DialogTitle><DialogDescription>{utility === 'privacy' ? 'Tandemy es responsable del tratamiento de tus datos personales.' : utility === 'cart' ? 'Plantillas y kits que agregaste.' : profile?.role === 'student' ? 'Revisa los detalles del proyecto y envía tu propuesta.' : 'Inicia sesión o crea tu cuenta de estudiante.'}</DialogDescription>{utility === 'privacy' ? <><p className="text-sm text-muted-foreground">Recopilamos: nombre, correo, matrícula, carrera y semestre (estudiantes); nombre comercial, RFC y datos de contacto (PyMEs); así como calificaciones e historial de proyectos.</p><p className="text-sm text-muted-foreground">Los usamos para verificar tu identidad, conectar estudiantes con PyMEs, procesar pagos, emitir constancias y brindarte soporte. No guardamos datos de tarjeta. Compartimos tus datos solo con la UACH para confirmar que eres estudiante activo.</p><p className="text-sm text-muted-foreground">Puedes ejercer tus derechos ARCO escribiendo a privacidad@tandemy.mx.</p><Button onClick={closeUtility}>Acepto</Button></> : utility === 'cart' ? <CartContents /> : <StudentAccess project={utility ?? undefined} onDone={closeUtility} />}</DialogContent></Dialog>
      <Dialog open={selectedLiveProject !== null} onOpenChange={(open) => { if (!open) setSelectedLiveProject(null); }}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl">
          {selectedLiveProject && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {selectedLiveProject.area} · {selectedLiveProject.companyName}
                </p>
                <DialogTitle className="mt-1 text-xl font-bold">{selectedLiveProject.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  Presupuesto: ${Number(selectedLiveProject.budget || 0).toLocaleString("es-MX")} MXN · Duración: {selectedLiveProject.duration}
                  {selectedLiveProject.deadline ? ` · Fecha límite: ${selectedLiveProject.deadline}` : ""}
                </DialogDescription>
              </div>
              <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
                <p className="font-semibold text-foreground">Descripción</p>
                <p className="whitespace-pre-line text-muted-foreground">{selectedLiveProject.description}</p>
                {selectedLiveProject.activities && (
                  <>
                    <p className="pt-2 font-semibold text-foreground">Actividades a realizar</p>
                    <p className="whitespace-pre-line text-muted-foreground">{selectedLiveProject.activities}</p>
                  </>
                )}
                {selectedLiveProject.requiredSkills?.length > 0 && (
                  <div className="pt-2">
                    <p className="font-semibold text-foreground">Habilidades requeridas</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedLiveProject.requiredSkills.map((s) => (
                        <span key={s} className="rounded-md border bg-background px-2 py-0.5 text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profile?.role === "student" ? (
                applySuccess ? (
                  <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">{applySuccess}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link to="/panel-estudiante">Ir a mi panel de estudiante</Link>
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setSelectedLiveProject(null)}>
                        Cerrar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={handleApplySubmit}>
                    <p className="text-sm font-semibold">Enviar propuesta</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-medium">
                        Monto propuesto (MXN)
                        <input
                          required
                          type="number"
                          min={100}
                          value={proposedAmount}
                          onChange={(e) => setProposedAmount(e.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        />
                      </label>
                      <label className="block text-xs font-medium">
                        Plazo estimado
                        <input
                          required
                          value={proposedDuration}
                          onChange={(e) => setProposedDuration(e.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        />
                      </label>
                    </div>
                    <label className="block text-xs font-medium">
                      Propuesta y experiencia relevante
                      <textarea
                        required
                        minLength={5}
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Explica cómo abordarás este proyecto y tu experiencia relacionada (mínimo 5 caracteres)..."
                        className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm"
                      />
                    </label>
                    {applyError && <p role="alert" className="text-sm text-destructive">{applyError}</p>}
                    <Button type="submit" disabled={applyBusy} className="w-full rounded-full">
                      {applyBusy ? "Enviando propuesta…" : "Confirmar postulación"}
                    </Button>
                  </form>
                )
              ) : profile?.role === "pyme" ? (
                <div className="space-y-3 rounded-xl border bg-secondary/50 p-4 text-sm">
                  <p className="text-muted-foreground">
                    Iniciaste sesión como PyME. Solo las cuentas de estudiante pueden postularse a proyectos.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/panel-pyme">Ir a mi panel de PyME</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 border-t pt-4">
                  <p className="text-sm font-semibold">Inicia sesión como estudiante para postularte</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-full">
                      <Link to="/registro" search={{ modo: "login" }}>Iniciar sesión</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/registro" search={{ tipo: "estudiante" }}>Registrarme como estudiante</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground \x62g-primary !text-primary-foreground"} aria-current="page" href="#">Proyectos</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/perfiles">Perfiles</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/tienda">Tienda</a>
          <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/faq">Preguntas</a>
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

function ImportedArticle() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Finanzas</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Orden de costos para una cafetería</h3>
      <p className="text-sm text-muted-foreground">Café Aroma</p>
      <p className="mt-2 text-sm">Necesitamos calcular el costo real de cada bebida y definir precios.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$1,500</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>10 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Contador Público · Lic. Administración Financiera</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>2 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

function ImportedArticle2() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Marketing</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Diseño de 10 publicaciones para redes</h3>
      <p className="text-sm text-muted-foreground">Boutique Luna</p>
      <p className="mt-2 text-sm">Publicaciones para la temporada navideña.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$1,200</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>7 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Administración de Empresas · Lic. Negocios Internacionales</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>1 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

function ImportedArticle3() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Administración</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Manual de procesos para tienda de ropa</h3>
      <p className="text-sm text-muted-foreground">Moda Norte</p>
      <p className="mt-2 text-sm">Documentar procesos de venta, inventario y atención.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$2,200</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>12 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Administración de Empresas</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>0 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

function ImportedArticle4() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Gestión Pública</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Trámites y permisos municipales para taller</h3>
      <p className="text-sm text-muted-foreground">Taller Pérez</p>
      <p className="mt-2 text-sm">Guía de licencias y permisos para operar en regla.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$900</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>5 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Administración y Gestión Pública</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>1 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

function ImportedArticle5() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Inteligencia de Negocios</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Tablero de ventas del último trimestre</h3>
      <p className="text-sm text-muted-foreground">Abarrotes Don Chuy</p>
      <p className="mt-2 text-sm">Un tablero para ver qué productos se venden más.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$2,800</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>14 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Inteligencia de Negocios</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>1 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

function ImportedArticle6() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Negocios Internacionales</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Plan de exportación a Texas</h3>
      <p className="text-sm text-muted-foreground">Artesanías Rarámuri</p>
      <p className="mt-2 text-sm">Evaluar requisitos y costos para exportar artesanías.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$3,200</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>20 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Lic. Negocios Internacionales</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>1 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

function ImportedArticle7() {
  return (
    <article className={"flex flex-col rounded-2xl \x62order \x62g-card p-5 \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"}>
      <div className="flex flex-wrap gap-2">
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380"}>Contabilidad</div>
        <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-primary text-primary-foreground \x73hadow \x68over:\x62g-primary/\x380"}>Abierto</div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">Declaraciones y orden fiscal (RESICO)</h3>
      <p className="text-sm text-muted-foreground">Café Aroma</p>
      <p className="mt-2 text-sm">Ordenar facturas y preparar declaraciones mensuales.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>$1,800</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>8 días</span>
        <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>Contador Público</span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><svg aria-hidden="true" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>0 propuestas</span>
      </div>
      <div className="mt-auto pt-5">
        <Button data-student-application className="w-full rounded-full">Postularme</Button>
      </div>
    </article>
  );
}

