import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  Award,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Search,
  Star,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard-shell";
import { CertificateModal } from "@/components/certificate-modal";
import { ProjectChatPanel } from "@/components/project-chat-panel";
import { useTandemyAuth } from "@/components/student-session";
import { Stars } from "@/components/site-chrome";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";
import { SHOWCASE_PROJECTS } from "@/lib/tandemy-showcase";
import {
  applyToProject,
  authErrorToSpanish,
  compressImageToDataUrl,
  confirmProjectCompletion,
  markNotificationRead,
  parseSkillsInput,
  submitProjectReview,
  updateStudentProfile,
} from "@/lib/tandemy-db";
import {
  APPLICATION_STATUS_LABEL,
  DEGREES,
  formatMxn,
  formatTimestamp,
  PAYMENT_STATUS_LABEL,
  PROJECT_AREAS,
  PROJECT_STATUS_LABEL,
  type DigitalCertificate,
  type PlatformNotification,
  type ProjectApplication,
  type ProjectReview,
  type SimulatedPayment,
  type TandemyProject,
} from "@/lib/tandemy-types";

export const Route = createFileRoute("/panel-estudiante")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de Estudiante · Tandemy" },
      {
        name: "description",
        content: "Explora proyectos, postúlate y gestiona tu actividad en Tandemy.",
      },
    ],
  }),
  component: StudentDashboardPage,
});

type StudentTab =
  | "proyectos"
  | "perfil"
  | "postulaciones"
  | "mis-proyectos"
  | "calificaciones"
  | "ganancias"
  | "constancias"
  | "notificaciones";

function StudentDashboardPage() {
  const { user, profile, privateAccount, loading, needsOnboarding } = useTandemyAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudentTab>("proyectos");

  // Firestore collections
  const [openProjects, setOpenProjects] = useState<TandemyProject[]>([]);
  const [myProjects, setMyProjects] = useState<TandemyProject[]>([]);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [payments, setPayments] = useState<SimulatedPayment[]>([]);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<ProjectReview[]>([]);
  const [reviewsGiven, setReviewsGiven] = useState<ProjectReview[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  // Filters & UI dialogs
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState<TandemyProject | null>(null);
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalDuration, setProposalDuration] = useState("");
  const [proposalLetter, setProposalLetter] = useState("");
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState("");
  const [applyError, setApplyError] = useState("");

  // Profile form state
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profileUniversity, setProfileUniversity] = useState("");
  const [profileDegree, setProfileDegree] = useState("");
  const [profileSemester, setProfileSemester] = useState("");
  const [profileStudentNumber, setProfileStudentNumber] = useState("");
  const [profileSkills, setProfileSkills] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileExperience, setProfileExperience] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Certificate preview & completion/review states
  const [previewCert, setPreviewCert] = useState<DigitalCertificate | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [reviewTargetProject, setReviewTargetProject] = useState<TandemyProject | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  // Route guard
  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/registro", search: { modo: "login" }, replace: true });
    } else if (needsOnboarding) {
      void navigate({ to: "/registro", replace: true });
    } else if (profile?.role === "pyme") {
      void navigate({ to: "/panel-pyme", replace: true });
    }
  }, [loading, user, profile, needsOnboarding, navigate]);

  // Populate profile editor state
  useEffect(() => {
    if (!profile) return;
    setProfileDisplayName(profile.displayName || "");
    setProfilePhotoUrl(profile.photoUrl || "");
    setProfileUniversity(profile.university || "Universidad Autónoma de Chihuahua (FCA)");
    setProfileDegree(profile.degree || "");
    setProfileSemester(profile.semester || "");
    setProfileSkills((profile.skills || []).join(", "));
    setProfileBio(profile.bio || "");
    setProfileExperience(profile.experience || "");
  }, [profile]);

  useEffect(() => {
    if (privateAccount) {
      setProfileStudentNumber(privateAccount.studentNumber || "");
    }
  }, [privateAccount]);

  // Real-time Firestore subscriptions
  useEffect(() => {
    if (!user || profile?.role !== "student") return;
    const uid = user.uid;

    const unsubs = [
      onSnapshot(
        query(collection(db, "projects"), where("status", "==", "open")),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<TandemyProject, "id">) }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
          setOpenProjects(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "projects"),
      ),
      onSnapshot(
        query(collection(db, "projects"), where("selectedStudentId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<TandemyProject, "id">) }))
            .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
          setMyProjects(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "projects"),
      ),
      onSnapshot(
        query(collection(db, "applications"), where("studentId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectApplication, "id">) }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
          setApplications(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "applications"),
      ),
      onSnapshot(
        query(collection(db, "payments"), where("studentId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<SimulatedPayment, "id">) }))
            .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
          setPayments(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "payments"),
      ),
      onSnapshot(
        query(collection(db, "certificates"), where("studentId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<DigitalCertificate, "id">) }))
            .sort((a, b) => (b.issuedAt?.toMillis?.() ?? 0) - (a.issuedAt?.toMillis?.() ?? 0));
          setCertificates(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "certificates"),
      ),
      onSnapshot(
        query(collection(db, "reviews"), where("revieweeId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectReview, "id">) }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
          setReviewsReceived(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "reviews"),
      ),
      onSnapshot(
        query(collection(db, "reviews"), where("reviewerId", "==", uid)),
        (snap) => {
          setReviewsGiven(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectReview, "id">) })),
          );
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "reviews"),
      ),
      onSnapshot(
        query(collection(db, "notifications"), where("recipientId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<PlatformNotification, "id">) }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
          setNotifications(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "notifications"),
      ),
    ];

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [user, profile?.role]);

  if (loading || !user || !profile || profile.role !== "student") {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-sm text-muted-foreground">
        Cargando tu panel de estudiante…
      </main>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeProjectsCount = myProjects.filter((p) => p.status === "in_progress").length;

  const availableProjects = [
    ...openProjects,
    ...SHOWCASE_PROJECTS.filter((sp) => !openProjects.some((op) => op.id === sp.id)),
  ];

  const navItems: DashboardNavItem<StudentTab>[] = [
    {
      id: "proyectos",
      label: "Proyectos disponibles",
      icon: Search,
      badge: availableProjects.length,
    },
    { id: "mis-proyectos", label: "Mis proyectos", icon: FolderKanban, badge: activeProjectsCount },
    {
      id: "postulaciones",
      label: "Mis postulaciones",
      icon: Briefcase,
      badge: applications.length,
    },
    { id: "ganancias", label: "Mis ganancias", icon: DollarSign },
    { id: "constancias", label: "Mis constancias", icon: Award, badge: certificates.length },
    { id: "calificaciones", label: "Mis calificaciones", icon: Star },
    { id: "notificaciones", label: "Notificaciones", icon: Bell, badge: unreadCount },
    { id: "perfil", label: "Mi perfil", icon: User },
  ];

  const sectionMeta: Record<StudentTab, { title: string; subtitle: string }> = {
    proyectos: {
      title: "Proyectos disponibles",
      subtitle: "Explora oportunidades reales publicadas por PyMEs y envía tu propuesta.",
    },
    perfil: {
      title: "Mi perfil de estudiante",
      subtitle: "Mantén actualizadas tus habilidades, experiencia y fotografía para destacar.",
    },
    postulaciones: {
      title: "Mis postulaciones",
      subtitle: "Consulta el estado en tiempo real de tus solicitudes enviadas.",
    },
    "mis-proyectos": {
      title: "Mis proyectos",
      subtitle: "Da seguimiento a tus proyectos activos, envía mensajes y confirma entregas.",
    },
    calificaciones: {
      title: "Mis calificaciones",
      subtitle: "Evaluaciones recibidas de empresas y reseñas pendientes por emitir.",
    },
    ganancias: {
      title: "Mis ganancias",
      subtitle: "Resumen de pagos liberados, pendientes de liberación e historial completo.",
    },
    constancias: {
      title: "Mis constancias digitales",
      subtitle: "Descarga en PDF tus constancias oficiales de proyectos completados.",
    },
    notificaciones: {
      title: "Notificaciones",
      subtitle: "Avisos de selección, respuestas a postulaciones, mensajes y pagos.",
    },
  };

  const filteredOpenProjects = availableProjects.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.companyName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.requiredSkills.some((s) => s.toLowerCase().includes(q));
    const matchesArea = !areaFilter || p.area === areaFilter;
    const matchesDegree =
      !degreeFilter || p.targetDegrees.includes(degreeFilter) || p.targetDegrees.length === 0;
    const matchesBudget =
      !budgetFilter ||
      (budgetFilter === "low"
        ? p.budget < 1500
        : budgetFilter === "medium"
          ? p.budget >= 1500 && p.budget <= 3000
          : p.budget > 3000);
    return matchesSearch && matchesArea && matchesDegree && matchesBudget;
  });

  const releasedTotal = payments
    .filter((p) => p.status === "released")
    .reduce((sum, p) => sum + p.studentNetAmount, 0);
  const pendingReleaseTotal = payments
    .filter((p) => p.status === "pending_release" || p.status === "paid")
    .reduce((sum, p) => sum + p.studentNetAmount, 0);
  const awaitingPaymentTotal = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.studentNetAmount, 0);

  const avgRating =
    reviewsReceived.length > 0
      ? reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewsReceived.length
      : 0;

  function openProjectModal(project: TandemyProject) {
    setSelectedProject(project);
    setProposalAmount(String(project.budget));
    setProposalDuration(project.duration);
    setProposalLetter("");
    setApplyFeedback("");
    setApplyError("");
  }

  async function handleApplySubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedProject || !profile) return;
    setApplyBusy(true);
    setApplyFeedback("");
    setApplyError("");
    try {
      await applyToProject({
        project: selectedProject,
        studentProfile: profile,
        proposedAmount: Number(proposalAmount) || selectedProject.budget,
        proposedDuration: proposalDuration || selectedProject.duration,
        coverLetter: proposalLetter,
      });
      setApplyFeedback(
        "¡Postulación enviada correctamente! Puedes darle seguimiento en Mis postulaciones.",
      );
    } catch (err) {
      setApplyError(authErrorToSpanish(err));
    } finally {
      setApplyBusy(false);
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setProfilePhotoUrl(dataUrl);
      setProfileMessage("Imagen cargada. Haz clic en 'Guardar cambios' para actualizar tu perfil.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Error al cargar la imagen.");
    }
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileBusy(true);
    setProfileMessage("");
    setProfileError("");
    try {
      await updateStudentProfile(user.uid, {
        displayName: profileDisplayName,
        photoUrl: profilePhotoUrl,
        university: profileUniversity,
        degree: profileDegree,
        semester: profileSemester,
        studentNumber: profileStudentNumber,
        skills: parseSkillsInput(profileSkills),
        bio: profileBio,
        experience: profileExperience,
      });
      setProfileMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "No se pudo guardar el perfil.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleConfirmCompletion(project: TandemyProject) {
    if (!user || !profile) return;
    setActionBusyId(project.id);
    try {
      const payment = payments.find((p) => p.projectId === project.id) ?? null;
      await confirmProjectCompletion({
        project,
        actorRole: "student",
        actorId: user.uid,
        studentProfile: profile,
        payment,
      });
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reviewTargetProject || !profile) return;
    setReviewBusy(true);
    try {
      await submitProjectReview({
        project: reviewTargetProject,
        reviewerProfile: profile,
        revieweeId: reviewTargetProject.ownerId,
        revieweeName: reviewTargetProject.companyName,
        rating: reviewStars,
        comment: reviewComment,
      });
      setReviewTargetProject(null);
      setReviewComment("");
      setReviewStars(5);
    } finally {
      setReviewBusy(false);
    }
  }

  async function markAllNotificationsRead() {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
  }

  const inputClass =
    "mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const textareaClass =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <DashboardShell
      roleLabel="Estudiante"
      title={sectionMeta[activeTab].title}
      subtitle={sectionMeta[activeTab].subtitle}
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      unreadNotifications={unreadCount}
      onOpenNotifications={() => setActiveTab("notificaciones")}
    >
      {/* Top Quick Metrics Strip */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Proyectos activos</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {activeProjectsCount}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Postulaciones enviadas</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {applications.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Ganancias liberadas</p>
          <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
            {formatMxn(releasedTotal)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Calificación promedio</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {reviewsReceived.length ? `${avgRating.toFixed(1)} / 5` : "Sin reseñas"}
          </p>
        </div>
      </div>

      {/* TAB 1: AVAILABLE PROJECTS */}
      {activeTab === "proyectos" && (
        <div className="space-y-5">
          <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto, PyME o habilidad…"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <select
              aria-label="Área de trabajo"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas las áreas</option>
              {PROJECT_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <select
              aria-label="Carrera sugerida"
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas las carreras</option>
              {DEGREES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              aria-label="Presupuesto"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Todos los presupuestos</option>
              <option value="low">Menos de $1,500</option>
              <option value="medium">$1,500 a $3,000</option>
              <option value="high">Más de $3,000</option>
            </select>
          </div>

          {filteredOpenProjects.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-semibold text-foreground">
                No hay proyectos abiertos que coincidan con tu búsqueda
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando una PyME publique un proyecto nuevo aparecerá aquí al instante.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredOpenProjects.map((project) => {
                const existingApp = applications.find((a) => a.projectId === project.id);
                return (
                  <article
                    key={project.id}
                    className="flex flex-col rounded-xl border bg-card p-5 transition hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-primary">{project.area}</span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                        {PROJECT_STATUS_LABEL[project.status]}
                      </span>
                    </div>

                    <h2 className="mt-2 text-base font-bold leading-snug text-foreground">
                      {project.title}
                    </h2>
                    <p className="text-xs font-medium text-muted-foreground">
                      {project.companyName}
                      {project.companySector ? ` · ${project.companySector}` : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {project.requiredSkills.length > 3 && (
                        <span className="px-1 text-xs text-muted-foreground">
                          +{project.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {formatMxn(project.budget)}
                      </span>
                      <span>
                        {project.duration} · Límite {project.deadline}
                      </span>
                    </div>

                    <div className="mt-4">
                      <Button
                        onClick={() => openProjectModal(project)}
                        variant={existingApp ? "outline" : "default"}
                        className="w-full rounded-full"
                      >
                        {existingApp
                          ? `Ya postulado (${APPLICATION_STATUS_LABEL[existingApp.status]})`
                          : "Ver detalles y postularme"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PROFILE */}
      {activeTab === "perfil" && (
        <form
          onSubmit={handleSaveProfile}
          className="mx-auto max-w-3xl space-y-6 rounded-xl border bg-card p-6"
        >
          <div className="flex flex-wrap items-center gap-5 border-b pb-5">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={profileDisplayName}
                className="h-20 w-20 rounded-full border object-cover"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full bg-hero text-xl font-bold text-navy-foreground">
                {profileDisplayName.slice(0, 2).toUpperCase() || "ES"}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Fotografía de perfil</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handlePhotoUpload(e)}
                    className="sr-only"
                  />
                </label>
                {profilePhotoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setProfilePhotoUrl("")}
                  >
                    Quitar foto
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Correo registrado: {privateAccount?.email || user.email}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Nombre completo
              <input
                required
                value={profileDisplayName}
                onChange={(e) => setProfileDisplayName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Matrícula
              <input
                required
                value={profileStudentNumber}
                onChange={(e) => setProfileStudentNumber(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Carrera
              <select
                required
                value={profileDegree}
                onChange={(e) => setProfileDegree(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Selecciona tu carrera
                </option>
                {DEGREES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Semestre
              <input
                required
                value={profileSemester}
                onChange={(e) => setProfileSemester(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Universidad / Facultad
            <input
              required
              value={profileUniversity}
              onChange={(e) => setProfileUniversity(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Habilidades (separadas por coma)
            <input
              required
              value={profileSkills}
              onChange={(e) => setProfileSkills(e.target.value)}
              placeholder="Excel, Costos, Power BI, Canva"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Descripción personal y enfoque profesional
            <textarea
              required
              rows={3}
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              className={textareaClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Experiencia previa / Proyectos realizados
            <textarea
              required
              rows={3}
              value={profileExperience}
              onChange={(e) => setProfileExperience(e.target.value)}
              className={textareaClass}
            />
          </label>

          {profileError && (
            <p role="alert" className="text-sm text-destructive">
              {profileError}
            </p>
          )}
          {profileMessage && (
            <p role="status" className="text-sm font-medium text-primary">
              {profileMessage}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={profileBusy} className="rounded-full px-6">
              {profileBusy ? "Guardando…" : "Guardar cambios del perfil"}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === "postulaciones" && (
        <div className="rounded-xl border bg-card">
          {applications.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold">Aún no te has postulado a ningún proyecto</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explora los proyectos disponibles y envía tu primera propuesta.
              </p>
              <Button className="mt-4 rounded-full" onClick={() => setActiveTab("proyectos")}>
                Explorar proyectos
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{app.projectTitle}</h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          app.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {APPLICATION_STATUS_LABEL[app.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {app.companyName} · Propuesta: {formatMxn(app.proposedAmount)} ·{" "}
                      {app.proposedDuration} · Enviada el {formatTimestamp(app.createdAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">“{app.coverLetter}”</p>
                  </div>
                  {app.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-full"
                      onClick={() => setActiveTab("mis-proyectos")}
                    >
                      Ir a Mis proyectos
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY SELECTED PROJECTS */}
      {activeTab === "mis-proyectos" && (
        <div className="space-y-5">
          {myProjects.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-semibold">Aún no tienes proyectos asignados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando una PyME acepte tu postulación, el proyecto aparecerá aquí para dar
                seguimiento.
              </p>
            </div>
          ) : (
            myProjects.map((project) => {
              const payment = payments.find((p) => p.projectId === project.id);
              const cert = certificates.find((c) => c.projectId === project.id);
              const alreadyReviewed = reviewsGiven.some((r) => r.projectId === project.id);

              return (
                <section key={project.id} className="space-y-4 rounded-xl border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {project.area}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                            project.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {PROJECT_STATUS_LABEL[project.status]}
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold">{project.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        Empresa: {project.companyName} · Presupuesto acordado:{" "}
                        <strong className="text-foreground tabular-nums">
                          {formatMxn(payment?.amount ?? project.budget)}
                        </strong>{" "}
                        · Pago:{" "}
                        <strong className="text-primary">
                          {payment ? PAYMENT_STATUS_LABEL[payment.status] : "Pago pendiente"}
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.status === "in_progress" && !project.studentConfirmedComplete && (
                        <Button
                          onClick={() => void handleConfirmCompletion(project)}
                          disabled={actionBusyId === project.id}
                          className="gap-2 rounded-full"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {actionBusyId === project.id ? "Confirmando…" : "Confirmar entrega final"}
                        </Button>
                      )}
                      {project.status === "in_progress" && project.studentConfirmedComplete && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                          <Clock className="h-3.5 w-3.5" />
                          Esperando confirmación de {project.companyName}
                        </span>
                      )}
                      {project.status === "completed" && cert && (
                        <Button
                          variant="outline"
                          onClick={() => setPreviewCert(cert)}
                          className="gap-2 rounded-full"
                        >
                          <Award className="h-4 w-4" />
                          Ver constancia
                        </Button>
                      )}
                      {project.status === "completed" && !alreadyReviewed && (
                        <Button
                          onClick={() => {
                            setReviewTargetProject(project);
                            setReviewStars(5);
                            setReviewComment("");
                          }}
                          className="gap-2 rounded-full"
                        >
                          <Star className="h-4 w-4" />
                          Calificar PyME
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Descripción del proyecto
                      </p>
                      <p className="mt-1 whitespace-pre-line text-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actividades y entregables
                      </p>
                      <p className="mt-1 whitespace-pre-line text-foreground">
                        {project.activities}
                      </p>
                    </div>
                  </div>

                  <ProjectChatPanel
                    project={project}
                    currentProfile={profile}
                    recipientId={project.ownerId}
                    recipientLabel={project.companyName}
                  />
                </section>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: MY REVIEWS */}
      {activeTab === "calificaciones" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reputación acumulada
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-3xl font-bold tabular-nums">
                  {reviewsReceived.length ? avgRating.toFixed(1) : "—"}
                </span>
                {reviewsReceived.length > 0 && <Stars value={avgRating} size={18} />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Basado en {reviewsReceived.length} evaluación(es) de PyMEs
              </p>
            </div>
          </div>

          {/* Pending reviews student can submit */}
          {myProjects
            .filter(
              (p) => p.status === "completed" && !reviewsGiven.some((r) => r.projectId === p.id),
            )
            .map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent/50 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    Proyecto completado sin calificar: {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Comparte tu experiencia trabajando con {p.companyName}.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setReviewTargetProject(p);
                    setReviewStars(5);
                    setReviewComment("");
                  }}
                >
                  Calificar a {p.companyName}
                </Button>
              </div>
            ))}

          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-bold">Evaluaciones recibidas</h2>
            </div>
            {reviewsReceived.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Aún no recibes evaluaciones. Completa tu primer proyecto para obtener reseñas
                verificadas.
              </p>
            ) : (
              <div className="divide-y">
                {reviewsReceived.map((r) => (
                  <div key={r.id} className="space-y-1.5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{r.reviewerName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Proyecto: {r.projectTitle}</p>
                    <Stars value={r.rating} />
                    <p className="text-sm text-foreground">“{r.comment}”</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MY EARNINGS */}
      {activeTab === "ganancias" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">Pagos liberados (Neto)</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
                {formatMxn(releasedTotal)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">
                En garantía (Pendiente de liberación)
              </p>
              <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
                {formatMxn(pendingReleaseTotal)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">Por pagar por la PyME</p>
              <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                {formatMxn(awaitingPaymentTotal)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-bold">Historial de transacciones</h2>
            </div>
            {payments.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Aún no tienes movimientos registrados. Cuando seas seleccionado en un proyecto,
                verás el desglose aquí.
              </p>
            ) : (
              <div className="divide-y">
                {payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{pay.projectTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {pay.companyName}
                        {pay.paymentMethod ? ` · ${pay.paymentMethod}` : ""}
                        {pay.referenceCode ? ` · Ref: ${pay.referenceCode}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Total proyecto: {formatMxn(pay.amount)} · Comisión Tandemy (10%):{" "}
                        {formatMxn(pay.platformFee)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-primary tabular-nums">
                        {formatMxn(pay.studentNetAmount)}
                      </p>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                          pay.status === "released"
                            ? "bg-emerald-100 text-emerald-800"
                            : pay.status === "pending_release" || pay.status === "paid"
                              ? "bg-primary/10 text-primary"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {PAYMENT_STATUS_LABEL[pay.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: MY CERTIFICATES */}
      {activeTab === "constancias" && (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.length === 0 ? (
            <div className="col-span-full rounded-xl border bg-card p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Aún no tienes constancias emitidas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Al finalizar un proyecto y confirmarlo junto con la PyME, tu constancia digital se
                generará automáticamente.
              </p>
            </div>
          ) : (
            certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col justify-between rounded-xl border bg-card p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-primary">
                      {cert.certificateCode}
                    </span>
                    <span className="text-muted-foreground">{cert.completedAt}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-foreground">{cert.projectTitle}</h3>
                  <p className="text-sm text-muted-foreground">Empresa: {cert.companyName}</p>
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                    {cert.activitiesSummary}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewCert(cert)}
                    className="flex-1 gap-1.5 rounded-full"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Vista previa
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => downloadCertificatePdf(cert)}
                    className="flex-1 gap-1.5 rounded-full"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar PDF
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS */}
      {activeTab === "notificaciones" && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-sm font-bold">Centro de notificaciones</h2>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => void markAllNotificationsRead()}>
                Marcar todas como leídas
              </Button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No tienes notificaciones por ahora.
            </p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center ${
                    n.read ? "bg-card" : "bg-primary/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <span className="text-xs text-muted-foreground">
                        · {formatTimestamp(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  {!n.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full"
                      onClick={() => void markNotificationRead(n.id)}
                    >
                      Marcar leída
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROJECT DETAILS & PROPOSAL MODAL */}
      <Dialog
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl">
          {selectedProject && (
            <>
              <DialogTitle>{selectedProject.title}</DialogTitle>
              <DialogDescription>
                {selectedProject.companyName} · {selectedProject.area} · Presupuesto{" "}
                {formatMxn(selectedProject.budget)}
              </DialogDescription>

              <div className="space-y-4 text-sm">
                <div className="grid gap-3 rounded-xl border bg-secondary/40 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Presupuesto</p>
                    <p className="font-bold text-primary tabular-nums">
                      {formatMxn(selectedProject.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duración estimada</p>
                    <p className="font-semibold">{selectedProject.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha límite</p>
                    <p className="font-semibold">{selectedProject.deadline}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descripción
                  </p>
                  <p className="mt-1 whitespace-pre-line">{selectedProject.description}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actividades por realizar
                  </p>
                  <p className="mt-1 whitespace-pre-line">{selectedProject.activities}</p>
                </div>

                {selectedProject.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Habilidades requeridas
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedProject.requiredSkills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(() => {
                  const alreadyApplied = applications.find(
                    (a) => a.projectId === selectedProject.id,
                  );
                  if (alreadyApplied) {
                    return (
                      <div className="rounded-xl border border-primary/30 bg-accent/50 p-4">
                        <p className="font-semibold text-foreground">
                          Ya te postulaste a este proyecto (
                          {APPLICATION_STATUS_LABEL[alreadyApplied.status]})
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Propuesta enviada: {formatMxn(alreadyApplied.proposedAmount)} ·{" "}
                          {alreadyApplied.proposedDuration}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <form onSubmit={handleApplySubmit} className="space-y-3 border-t pt-4">
                      <h3 className="text-base font-bold">Enviar mi postulación</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm font-medium">
                          Monto propuesto (MXN)
                          <input
                            required
                            type="number"
                            min={100}
                            value={proposalAmount}
                            onChange={(e) => setProposalAmount(e.target.value)}
                            className={inputClass}
                          />
                        </label>
                        <label className="block text-sm font-medium">
                          Plazo de entrega propuesto
                          <input
                            required
                            value={proposalDuration}
                            onChange={(e) => setProposalDuration(e.target.value)}
                            placeholder="Ej. 10 días"
                            className={inputClass}
                          />
                        </label>
                      </div>
                      <label className="block text-sm font-medium">
                        Mensaje / Carta de presentación para {selectedProject.companyName}
                        <textarea
                          required
                          minLength={5}
                          rows={3}
                          value={proposalLetter}
                          onChange={(e) => setProposalLetter(e.target.value)}
                          placeholder="Explica tu experiencia relevante y cómo abordarás el proyecto (mínimo 5 caracteres)."
                          className={textareaClass}
                        />
                      </label>
                      {applyError && (
                        <p role="alert" className="text-sm font-medium text-destructive">
                          {applyError}
                        </p>
                      )}
                      {applyFeedback && (
                        <p role="status" className="text-sm font-medium text-primary">
                          {applyFeedback}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedProject(null)}
                        >
                          Cerrar
                        </Button>
                        <Button type="submit" disabled={applyBusy} className="rounded-full px-6">
                          {applyBusy ? "Enviando…" : "Enviar postulación"}
                        </Button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* REVIEW MODAL */}
      <Dialog
        open={Boolean(reviewTargetProject)}
        onOpenChange={(open) => {
          if (!open) setReviewTargetProject(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          {reviewTargetProject && (
            <>
              <DialogTitle>Calificar a {reviewTargetProject.companyName}</DialogTitle>
              <DialogDescription>Proyecto: {reviewTargetProject.title}</DialogDescription>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Calificación</p>
                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewStars(n)}
                        className={`text-2xl ${n <= reviewStars ? "text-star" : "text-border"}`}
                        aria-label={`${n} estrellas`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block text-sm font-medium">
                  Comentario sobre tu experiencia
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Claridad en instrucciones, comunicación y cumplimiento de pago."
                    className={textareaClass}
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReviewTargetProject(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={reviewBusy} className="rounded-full">
                    {reviewBusy ? "Guardando…" : "Publicar calificación"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
    </DashboardShell>
  );
}
