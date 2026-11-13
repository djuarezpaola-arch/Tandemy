import { CartContents, CartCount } from "@/components/cart";
import { HeaderAuthControls } from "@/components/account-link";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StudentAccess } from '@/components/student-access';
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { productImage } from "@/lib/store-products";
import capturedCSS from "../styles/pages/tienda.css?raw";

export const Route = createFileRoute("/tienda")({
  head: () => ({ meta: [{"title": "Tienda Tandemy · Plantillas y kits para PyMEs"}, {"name": "description", "content": "Plantillas y kits digitales creados por estudiantes de la FCA para tu negocio."}, {"property": "og:title", "content": "Tienda Tandemy · Plantillas y kits para PyMEs"}, {"property": "og:description", "content": "Plantillas y kits digitales creados por estudiantes de la FCA para tu negocio."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}] }),
  staticData: { importedDocument: { html: { "lang": "es" }, body: {  } } },
  component: Index,
});

function Index() {
  const products = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState('Todas');
  useEffect(() => { for (const item of products.current?.querySelectorAll('a') ?? []) { item.hidden = category !== 'Todas' && !item.textContent?.includes(category + ' ·'); } }, [category]);
  const [utility, setUtility] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem('tandemy-priv')) setUtility('privacy'); } catch { setUtility('privacy'); } }, []);
  function closeUtility() { if (utility === 'privacy') { try { localStorage.setItem('tandemy-priv', '1'); } catch {} } setUtility(null); }

  return (<>
<style>{capturedCSS}</style>
<div className="flex min-h-screen flex-col" onClick={(event) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button');
    if (button?.getAttribute('aria-label') === 'Menú') setMenuOpen(open => !open);
    else if (button?.textContent?.trim() === 'Aviso de privacidad') setUtility('privacy');
    else if (button?.querySelector('circle[cx="8"]')) setUtility('cart');
  }}>

<header className={"sticky top-0 z-40 \x62g-navy text-navy-foreground \x73hadow-card"}>
  <div className="container-page flex h-16 items-center gap-4">
    <a className="font-display text-2xl font-bold tracking-tight" href="/">T<span className="text-cyan">andemy</span></a>
    <nav className={"ml-6 hidden gap-1 \x6cg:\x66lex"}>
      <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/">Inicio</a>
      <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/proyectos">Proyectos</a>
      <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground"} href="/perfiles">Perfiles</a>
      <a className={"rounded-full px-3 py-1.5 text-sm \x74ext-navy-foreground/\x380 transition hover:text-navy-foreground \x62g-primary !text-primary-foreground"} aria-current="page" href="#">Tienda</a>
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
{menuOpen && <nav aria-label="Navegación móvil" className="container-page grid gap-1 py-3 lg:hidden">{[['/', 'Inicio'], ['/proyectos', 'Proyectos'], ['/perfiles', 'Perfiles'], ['/tienda', 'Tienda'], ['/faq', 'Preguntas'], ['/contacto', 'Contacto']].map(([href, label]) => <a key={href} href={href} className="rounded-lg px-3 py-2 hover:bg-primary">{label}</a>)}<HeaderAuthControls variant="mobile" onNavigate={() => setMenuOpen(false)} /></nav>}
<main className="flex-1">
  <section className={"\x62g-hero text-navy-foreground"}>
    <div className="container-page py-14">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Tienda Tandemy</p>
      <h1 className="mt-2 text-4xl font-bold md:text-5xl">Herramientas listas para tu negocio</h1>
      <div className={"mt-3 max-w-2xl \x74ext-navy-foreground/\x380"}>Plantillas y kits digitales creados por estudiantes de la FCA. Descarga inmediata. Precios en MXN, IVA incluido.</div>
    </div>
  </section>
  <div className="container-page py-10">
    <div className="flex flex-wrap gap-2">
      <Button variant={category === 'Todas' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Todas')}>{'Todas'}</Button>
      <Button variant={category === 'Finanzas' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Finanzas')}>{'Finanzas'}</Button>
      <Button variant={category === 'Administración' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Administración')}>{'Administración'}</Button>
      <Button variant={category === 'Marketing' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Marketing')}>{'Marketing'}</Button>
      <Button variant={category === 'Legal' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Legal')}>{'Legal'}</Button>
      <Button variant={category === 'Comercio Exterior' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Comercio Exterior')}>{'Comercio Exterior'}</Button>
      <Button variant={category === 'Estrategia' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Estrategia')}>{'Estrategia'}</Button>
      <Button variant={category === 'Talento Estudiantil' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Talento Estudiantil')}>{'Talento Estudiantil'}</Button>
      <Button variant={category === 'Productividad' ? "default" : "outline"} className="rounded-full" onClick={() => setCategory('Productividad')}>{'Productividad'}</Button>
    </div>
    <div ref={products} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="4.5 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(2)</span>
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="5.0 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="5.0 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(2)</span>
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="4.0 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className="text-border" style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
          </div>
        </div>
      </a>
      <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/pack-legal-contratos">
        <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
          <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("pack-legal-contratos")} alt="Pack Legal: Contratos y Acuerdos de Colaboración" loading="lazy" width="1024" height="1024" />
          <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>⚖️</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Legal · Word</div>
          <h3 className="mt-2 font-semibold leading-snug">Pack Legal: Contratos y Acuerdos de Colaboración</h3>
          <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>NDA, carta de colaboración y contrato de servicios.</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-primary">$139</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="4.0 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className="text-border" style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
          </div>
        </div>
      </a>
      <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/registro-marca-impi">
        <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
          <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("registro-marca-impi")} alt="Guía Práctica: Registro de Marca ante el IMPI" loading="lazy" width="1024" height="1024" />
          <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>™️</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Legal · PDF</div>
          <h3 className="mt-2 font-semibold leading-snug">Guía Práctica: Registro de Marca ante el IMPI</h3>
          <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Paso a paso para buscar disponibilidad y registrar tu marca.</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-primary">$99</span>
          </div>
        </div>
      </a>
      <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/checklist-exportacion">
        <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
          <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("checklist-exportacion")} alt="Checklist de Exportación y Comercio Exterior Básico" loading="lazy" width="1024" height="1024" />
          <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>🚢</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Comercio Exterior · PDF + Excel</div>
          <h3 className="mt-2 font-semibold leading-snug">Checklist de Exportación y Comercio Exterior Básico</h3>
          <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Requisitos, Incoterms y calculadora de costos logísticos.</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-primary">$159</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="5.0 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
          </div>
        </div>
      </a>
      <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/estudio-mercado">
        <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
          <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("estudio-mercado")} alt="Plantilla de Estudio de Mercado y Encuestas" loading="lazy" width="1024" height="1024" />
          <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>📝</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Estrategia · Forms + PDF</div>
          <h3 className="mt-2 font-semibold leading-snug">Plantilla de Estudio de Mercado y Encuestas</h3>
          <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Cuestionario listo y guía para definir tu buyer persona.</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-primary">$119</span>
          </div>
        </div>
      </a>
      <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/portafolio-cv">
        <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
          <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("portafolio-cv")} alt="Kit Portafolio Pro y CV de Alto Impacto" loading="lazy" width="1024" height="1024" />
          <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>🎓</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Talento Estudiantil · Canva + Notion</div>
          <h3 className="mt-2 font-semibold leading-snug">Kit Portafolio Pro y CV de Alto Impacto</h3>
          <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>3 plantillas de CV, portafolio en Notion y guía de entrevistas.</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-primary">$89</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="inline-flex gap-0.5" aria-label="5.0 de 5"><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg><svg aria-hidden="true" className={"\x66ill-star text-star"} style={{ width: "12px", height: "12px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg></span>(1)</span>
          </div>
        </div>
      </a>
      <a className={"group flex flex-col overflow-hidden rounded-2xl \x62order \x62g-card \x73hadow-card transition \x68over:\x2dtranslate-y-0.\x35 \x68over:\x73hadow-lift"} href="/tienda/gestion-proyectos">
        <div className={"relative aspect-[4/3] overflow-hidden \x62g-muted"}>
          <img className={"h-full w-full object-cover transition duration-500 \x67roup-hover:\x73cale-105"} src={productImage("gestion-proyectos")} alt="Tablero de Gestión de Proyectos Colaborativos" loading="lazy" width="1024" height="1024" />
          <span className={"absolute left-3 top-3 rounded-full \x62g-card px-2.5 py-1 text-lg \x73hadow-card"}>🗂️</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className={"inline-flex items-center rounded-md \x62order px-2.5 py-0.5 text-xs font-semibold transition-colors \x66ocus:\x6futline-none \x66ocus:\x72ing-2 \x66ocus:\x72ing-ring \x66ocus:\x72ing-offset-2 \x62order-transparent \x62g-secondary text-secondary-foreground \x68over:\x62g-secondary/\x380 w-fit"}>Productividad · Notion / Trello</div>
          <h3 className="mt-2 font-semibold leading-snug">Tablero de Gestión de Proyectos Colaborativos</h3>
          <p className={"mt-1 \x6cine-clamp-2 text-sm text-muted-foreground"}>Cronogramas, tareas, entregables y minutas para equipos.</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-primary">$109</span>
          </div>
        </div>
      </a>
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
      <a aria-current="page" href="#">Tienda</a>
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

</div><Dialog open={utility !== null} onOpenChange={(open) => { if (!open) closeUtility(); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-auto rounded-lg"><DialogTitle>{utility === 'privacy' ? 'Aviso de privacidad' : utility === 'cart' ? 'Tu carrito' : 'Acceso para estudiantes'}</DialogTitle><DialogDescription>{utility === 'privacy' ? 'Tandemy es responsable del tratamiento de tus datos personales.' : utility === 'cart' ? 'Plantillas y kits que agregaste.' : 'Inicia sesión o crea tu cuenta de estudiante.'}</DialogDescription>{utility === 'privacy' ? <><p className="text-sm text-muted-foreground">Recopilamos: nombre, correo, matrícula, carrera y semestre (estudiantes); nombre comercial, RFC y datos de contacto (PyMEs); así como calificaciones e historial de proyectos.</p><p className="text-sm text-muted-foreground">Los usamos para verificar tu identidad, conectar estudiantes con PyMEs, procesar pagos, emitir constancias y brindarte soporte. No guardamos datos de tarjeta. Compartimos tus datos solo con la UACH para confirmar que eres estudiante activo.</p><p className="text-sm text-muted-foreground">Puedes ejercer tus derechos ARCO escribiendo a privacidad@tandemy.mx.</p><Button onClick={closeUtility}>Acepto</Button></> : utility === 'cart' ? <CartContents /> : <StudentAccess project={utility ?? undefined} />}</DialogContent></Dialog>
</>);
}
