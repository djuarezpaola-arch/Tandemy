import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { collection, onSnapshot } from "firebase/firestore";
import capturedCSS from "../styles/pages/perfiles.css?raw";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SiteChrome, Stars, type Utility } from "@/components/site-chrome";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import type { ProjectReview, UserProfile } from "@/lib/tandemy-types";

export const Route = createFileRoute("/perfiles")({
  head: () => ({
    meta: [
      { title: "Perfiles · Tandemy" },
      {
        name: "description",
        content:
          "Conoce a los estudiantes de la FCA UACH y a las PyMEs de Chihuahua que trabajan juntos en Tandemy.",
      },
      { property: "og:title", content: "Perfiles · Tandemy" },
      {
        property: "og:description",
        content: "Estudiantes y PyMEs se califican entre sí al terminar cada proyecto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  staticData: { importedDocument: { html: { lang: "es" }, body: {} } },
  component: ProfilesPage,
});

type Review = { text: string; by: string; rating: number };
type Student = {
  name: string;
  degree: string;
  semester: string;
  skills: string;
  photoUrl?: string | undefined;
  bio?: string | undefined;
  reviews: Review[];
};
type Pyme = {
  name: string;
  sector: string;
  about: string;
  photoUrl?: string | undefined;
  reviews: Review[];
};

const STUDENTS: Student[] = [
  {
    name: "Diego Ramírez",
    degree: "Contador Público",
    semester: "7.º semestre",
    skills: "Costos, Excel, SAT",
    reviews: [
      {
        text: "Ordenó nuestros costos en una semana.",
        by: "Café Aroma",
        rating: 5.0,
      },
    ],
  },
  {
    name: "Karla Peña",
    degree: "Licenciatura en Administración de Empresas",
    semester: "6.º semestre",
    skills: "Procesos, inventarios",
    reviews: [
      {
        text: "Muy profesional y puntual.",
        by: "Moda Norte",
        rating: 5.0,
      },
    ],
  },
  {
    name: "Ana López",
    degree: "Licenciatura en Negocios Internacionales",
    semester: "5.º semestre",
    skills: "Canva, redes sociales",
    reviews: [
      {
        text: "Diseños increíbles.",
        by: "Boutique Luna",
        rating: 5.0,
      },
    ],
  },
  {
    name: "Luis Martínez",
    degree: "Licenciatura en Administración y Gestión Pública",
    semester: "8.º semestre",
    skills: "Trámites, contratos",
    reviews: [
      {
        text: "Explicó todo con paciencia.",
        by: "Taller Pérez",
        rating: 4.0,
      },
    ],
  },
  {
    name: "Sofía Hernández",
    degree: "Licenciatura en Negocios Internacionales",
    semester: "7.º semestre",
    skills: "Comercio exterior, inglés",
    reviews: [
      {
        text: "Nos abrió el camino a exportar.",
        by: "Artesanías Rarámuri",
        rating: 5.0,
      },
    ],
  },
  {
    name: "Jorge Castillo",
    degree: "Licenciatura en Inteligencia de Negocios",
    semester: "6.º semestre",
    skills: "Power BI, SQL, análisis",
    reviews: [],
  },
  {
    name: "Valeria Ortiz",
    degree: "Licenciatura en Administración Financiera",
    semester: "5.º semestre",
    skills: "Finanzas, presupuestos",
    reviews: [],
  },
];

const PYMES: Pyme[] = [
  {
    name: "Café Aroma",
    sector: "Cafetería · Chihuahua",
    about: "Cafetería local con 3 sucursales que busca ordenar sus costos.",
    reviews: [
      {
        text: "Pago puntual y buena comunicación.",
        by: "Diego R.",
        rating: 5.0,
      },
      {
        text: "Instrucciones claras.",
        by: "Karla P.",
        rating: 4.0,
      },
    ],
  },
  {
    name: "Boutique Luna",
    sector: "Ropa y accesorios",
    about: "Tienda de moda que quiere crecer en redes sociales.",
    reviews: [
      {
        text: "Excelente trato al estudiante.",
        by: "Ana L.",
        rating: 5.0,
      },
    ],
  },
  {
    name: "Moda Norte",
    sector: "Tienda de ropa",
    about: "Marca regional que renueva su imagen.",
    reviews: [
      {
        text: "Proyecto bien definido.",
        by: "Karla P.",
        rating: 4.0,
      },
    ],
  },
  {
    name: "Taller Pérez",
    sector: "Servicios automotrices",
    about: "Taller familiar que necesita formalizar su operación.",
    reviews: [
      {
        text: "Respondieron rápido.",
        by: "Luis M.",
        rating: 4.0,
      },
    ],
  },
  {
    name: "Abarrotes Don Chuy",
    sector: "Comercio minorista",
    about: "Abarrotes con 15 años en el barrio.",
    reviews: [
      {
        text: "Muy amables y claros.",
        by: "Jorge C.",
        rating: 5.0,
      },
    ],
  },
  {
    name: "Artesanías Rarámuri",
    sector: "Artesanías",
    about: "Cooperativa que busca exportar sus productos.",
    reviews: [
      {
        text: "Gran experiencia de aprendizaje.",
        by: "Sofía H.",
        rating: 5.0,
      },
    ],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}
function average(reviews: Review[]) {
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

type Selected = { kind: "student"; item: Student } | { kind: "pyme"; item: Pyme } | null;

function ProfilesPage() {
  const [utility, setUtility] = useState<Utility>(null);
  const [tab, setTab] = useState<"est" | "pyme">("est");
  const [selected, setSelected] = useState<Selected>(null);
  const [liveProfiles, setLiveProfiles] = useState<UserProfile[]>([]);
  const [liveReviews, setLiveReviews] = useState<ProjectReview[]>([]);

  useEffect(() => {
    const unsubProfiles = onSnapshot(
      collection(db, "profiles"),
      (snap) => {
        setLiveProfiles(snap.docs.map((d) => d.data() as UserProfile));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "profiles"),
    );
    const unsubReviews = onSnapshot(
      collection(db, "reviews"),
      (snap) => {
        setLiveReviews(
          snap.docs.map((d) => ({ ...(d.data() as Omit<ProjectReview, "id">), id: d.id })),
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "reviews"),
    );
    return () => {
      unsubProfiles();
      unsubReviews();
    };
  }, []);

  const { allStudents, allPymes } = useMemo(() => {
    const reviewsByTarget = new Map<string, Review[]>();
    for (const r of liveReviews) {
      const list = reviewsByTarget.get(r.revieweeId) ?? [];
      list.push({ text: r.comment, by: r.reviewerName, rating: r.rating });
      reviewsByTarget.set(r.revieweeId, list);
    }
    const dynamicStudents: Student[] = liveProfiles
      .filter((p) => p.role === "student")
      .map((p) => ({
        name: p.displayName,
        degree: p.degree || "FCA UACH",
        semester: p.semester || "Estudiante activo",
        skills: (p.skills ?? []).join(", ") || "Talento universitario",
        photoUrl: p.photoUrl,
        bio: p.bio,
        reviews: reviewsByTarget.get(p.uid) ?? [],
      }));
    const dynamicPymes: Pyme[] = liveProfiles
      .filter((p) => p.role === "pyme")
      .map((p) => ({
        name: p.companyName || p.displayName,
        sector: `${p.businessType || "PyME"} · ${p.city || "Chihuahua"}`,
        about: p.companyDescription || "Empresa registrada en Tandemy.",
        photoUrl: p.photoUrl,
        reviews: reviewsByTarget.get(p.uid) ?? [],
      }));
    return {
      allStudents: [...dynamicStudents, ...STUDENTS],
      allPymes: [...dynamicPymes, ...PYMES],
    };
  }, [liveProfiles, liveReviews]);

  const tabClass = (on: boolean) =>
    `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${on ? "bg-background text-foreground shadow" : ""}`;
  const cards =
    tab === "est"
      ? allStudents.map((s, idx) => ({
          key: `${s.name}-${idx}`,
          name: s.name,
          photoUrl: s.photoUrl,
          line1: s.degree,
          line2: `${s.semester} · ${s.skills}`,
          reviews: s.reviews,
          open: () => setSelected({ kind: "student", item: s }),
        }))
      : allPymes.map((p, idx) => ({
          key: `${p.name}-${idx}`,
          name: p.name,
          photoUrl: p.photoUrl,
          line1: p.sector,
          line2: null as string | null,
          reviews: p.reviews,
          open: () => setSelected({ kind: "pyme", item: p }),
        }));

  return (
    <>
      <style>{capturedCSS}</style>
      <SiteChrome active="/perfiles" utility={utility} setUtility={setUtility}>
        <section className="bg-hero text-navy-foreground">
          <div className="container-page py-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Comunidad</p>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">Perfiles</h1>
            <div className="mt-3 max-w-2xl text-navy-foreground/80">
              PyMEs y estudiantes se califican entre sí al terminar un proyecto.
            </div>
          </div>
        </section>
        <div className="container-page py-10">
          <div
            className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "est"}
              className={tabClass(tab === "est")}
              onClick={() => setTab("est")}
            >
              Estudiantes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "pyme"}
              className={tabClass(tab === "pyme")}
              onClick={() => setTab("pyme")}
            >
              PyMEs
            </button>
          </div>
          <div role="tabpanel" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.open}
                className="flex gap-4 rounded-2xl border bg-card p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                {c.photoUrl ? (
                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover border"
                  />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-hero font-display font-bold text-navy-foreground">
                    {initials(c.name)}
                  </span>
                )}
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.line1}</p>
                  {c.line2 && <p className="text-xs text-muted-foreground">{c.line2}</p>}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {c.reviews.length ? (
                      <>
                        <Stars value={average(c.reviews)} size={12} />
                        {average(c.reviews).toFixed(1)} ({c.reviews.length})
                      </>
                    ) : (
                      "Nuevo"
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SiteChrome>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-auto rounded-lg">
          {selected && (
            <>
              <DialogTitle>{selected.item.name}</DialogTitle>
              <DialogDescription>
                {selected.kind === "student"
                  ? `${selected.item.degree} · ${selected.item.semester}`
                  : selected.item.sector}
              </DialogDescription>
              {selected.kind === "student" && selected.item.bio && (
                <p className="text-sm text-muted-foreground">{selected.item.bio}</p>
              )}
              <p>
                {selected.kind === "student"
                  ? `Habilidades: ${selected.item.skills}`
                  : selected.item.about}
              </p>
              <h3 className="font-semibold">Reseñas</h3>
              {selected.item.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no tiene reseñas.</p>
              ) : (
                selected.item.reviews.map((r, i) => (
                  <div key={`${r.by}-${i}`} className="rounded-xl bg-secondary p-3">
                    <Stars value={r.rating} />
                    <p className="mt-1 text-sm">
                      “{r.text}” — {r.by}
                    </p>
                  </div>
                ))
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
