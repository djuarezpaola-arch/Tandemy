import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import capturedCSS from "../styles/pages/tienda.producto.css?raw";
import { Button } from "@/components/ui/button";
import { SiteChrome, Stars, type Utility } from "@/components/site-chrome";
import { findProduct, productRating, type StoreReview } from "@/lib/store-products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/tienda_/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.title} · Tienda Tandemy` : "Producto no disponible · Tienda Tandemy";
    const description = p ? p.summary : "Este producto no está disponible en la Tienda Tandemy.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" }, ...(p ? [] : [{ name: "robots", content: "noindex" }])] };
  },
  component: ProductPage,
  notFoundComponent: ProductMissing,
  errorComponent: ProductMissing,
});

function ProductMissing() {
  const [utility, setUtility] = useState<Utility>(null);
  return (
    <>
      <style>{capturedCSS}</style>
      <SiteChrome active="/tienda" utility={utility} setUtility={setUtility}>
        <div className="container-page py-20 text-center">
          <h1 className="text-3xl font-bold">Producto no encontrado</h1>
          <p className="mt-3 text-muted-foreground">Este producto ya no está disponible.</p>
          <Button asChild className="mt-6 rounded-full"><a href="/tienda">Ver la tienda</a></Button>
        </div>
      </SiteChrome>
    </>
  );
}

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const cart = useCart();
  const [utility, setUtility] = useState<Utility>(null);
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<"incluye" | "resenas">("incluye");
  const [reviews, setReviews] = useState<StoreReview[]>(p.reviews);
  const [stars, setStars] = useState(5);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [thanks, setThanks] = useState(false);
  const rating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : productRating(p);
  const tabClass = (on: boolean) => `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${on ? "bg-background text-foreground shadow" : ""}`;

  function addItem() {
    cart.add({ slug: p.slug, title: p.title, price: p.price }, qty);
    setAdded(true);
  }
  function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const date = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
    setReviews((r) => [{ name: name.trim(), date, rating: stars, text: text.trim() }, ...r]);
    setName(""); setText(""); setStars(5); setThanks(true);
  }

  return (
    <>
      <style>{capturedCSS}</style>
      <SiteChrome active="/tienda" utility={utility} setUtility={setUtility}>
        <div className="container-page py-8">
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" href="/tienda"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg> Tienda</a>
          <div className="mt-4 grid gap-10 lg:grid-cols-2">
            <div>
              <div className="aspect-square overflow-hidden rounded-3xl border bg-muted shadow-card">
                <img className="h-full w-full object-cover" src={p.gallery[image]} alt={p.title} width="1024" height="1024" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {p.gallery.map((src, i) => (
                  <button key={i} type="button" aria-label={`Ver imagen ${i + 1}`} aria-pressed={i === image} onClick={() => setImage(i)} className={`aspect-square overflow-hidden rounded-xl border-2 ${i === image ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img className="h-full w-full object-cover" src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{p.category} · {p.format}</div>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">{p.title}</h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                {reviews.length ? <><Stars value={rating} />{rating.toFixed(1)} · {reviews.length} reseñas</> : "Sin reseñas aún"}
              </div>
              <p className="mt-5 text-3xl font-bold text-primary">${p.price} <span className="text-sm font-normal text-muted-foreground">IVA incluido</span></p>
              <p className="mt-5 text-lg">{p.description}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-full border bg-card">
                  <button type="button" aria-label="Quitar uno" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="w-8 text-center" aria-live="polite">{qty}</span>
                  <button type="button" aria-label="Agregar uno" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty((q) => q + 1)}>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  </button>
                </div>
                <Button className="h-11 flex-1 rounded-full px-7 text-base" onClick={addItem}>Agregar al carrito</Button>
              </div>
              {added && <p role="status" className="mt-3 flex items-center gap-3 text-sm">Agregado al carrito <Button variant="link" className="h-auto p-0" onClick={() => setUtility("cart")}>Ver carrito</Button></p>}
              <div className="mt-6 grid gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></svg> Descarga inmediata después del pago</p>
                <p className="flex items-center gap-2"><svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> Pago seguro · Factura disponible</p>
              </div>
              <div className="mt-6 rounded-2xl bg-secondary p-4 text-sm">Creado por <b>{p.author}</b> · {p.degree}, FCA UACH</div>
            </div>
          </div>

          <div className="mt-14">
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground" role="tablist">
              <button type="button" role="tab" aria-selected={tab === "incluye"} className={tabClass(tab === "incluye")} onClick={() => setTab("incluye")}>Qué incluye</button>
              <button type="button" role="tab" aria-selected={tab === "resenas"} className={tabClass(tab === "resenas")} onClick={() => setTab("resenas")}>Reseñas ({reviews.length})</button>
            </div>
            {tab === "incluye" ? (
              <div role="tabpanel" className="mt-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {p.includes.map((item) => (
                    <li key={item} className="flex gap-3 rounded-xl border bg-card p-4"><svg className="h-5 w-5 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div role="tabpanel" className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="grid h-fit gap-4">
                  {reviews.length === 0 && <p className="text-muted-foreground">Aún no hay reseñas. ¡Sé el primero!</p>}
                  {reviews.map((r, i) => (
                    <div key={i} className="rounded-2xl border bg-card p-5">
                      <div className="flex items-center justify-between"><b>{r.name}</b><span className="text-xs text-muted-foreground">{r.date}</span></div>
                      <Stars value={r.rating} />
                      <p className="mt-2">{r.text}</p>
                    </div>
                  ))}
                </div>
                <form className="h-fit rounded-2xl border bg-card p-5 shadow-card" onSubmit={submitReview}>
                  <h3 className="font-bold">Escribe una reseña</h3>
                  <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Calificación">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} estrellas`} className={`text-2xl ${n <= stars ? "text-star" : "text-border"}`} onClick={() => setStars(n)}>★</button>
                    ))}
                  </div>
                  <input className="mt-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground md:text-sm" placeholder="Tu nombre" aria-label="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required />
                  <textarea className="mt-3 flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground md:text-sm" rows={4} placeholder="¿Qué te pareció?" aria-label="Tu reseña" value={text} onChange={(e) => setText(e.target.value)} required />
                  <Button type="submit" className="mt-3 w-full rounded-full">Publicar reseña</Button>
                  {thanks && <p role="status" className="mt-3 text-sm text-muted-foreground">¡Gracias por tu reseña!</p>}
                </form>
              </div>
            )}
          </div>

          {p.related.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold">También te puede interesar</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {p.related.map((slug) => findProduct(slug)).filter((r) => r !== undefined).map((r) => (
                  <a key={r.slug} href={`/tienda/${r.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={r.gallery[0]} alt={r.title} loading="lazy" />
                      <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 text-lg shadow-card">{r.emoji}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="w-fit rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{r.category} · {r.format}</div>
                      <h3 className="mt-2 font-semibold leading-snug">{r.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="text-lg font-bold text-primary">${r.price}</span>
                        {r.reviews.length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Stars value={productRating(r)} size={12} />({r.reviews.length})</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </SiteChrome>
    </>
  );
}
