import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import {
  Award,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit3,
  FolderCheck,
  FolderKanban,
  PlusCircle,
  Star,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard-shell";
import { PaymentSimulatorModal } from "@/components/payment-simulator-modal";
import { CertificateModal } from "@/components/certificate-modal";
import { ProjectChatPanel } from "@/components/project-chat-panel";
import { useTandemyAuth } from "@/components/student-session";
import { Stars } from "@/components/site-chrome";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  acceptStudentApplication,
  closeOpenProject,
  compressImageToDataUrl,
  confirmProjectCompletion,
  deleteOpenProject,
  editOpenProject,
  markNotificationRead,
  parseSkillsInput,
  publishProject,
  rejectStudentApplication,
  submitProjectReview,
  updatePymeProfile,
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
  type UserProfile,
} from "@/lib/tandemy-types";

export const Route = createFileRoute("/panel-pyme")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de PyME · Tandemy" },
      {
        name: "description",
        content: "Publica proyectos, selecciona talento universitario y gestiona pagos en Tandemy.",
      },
    ],
  }),
  component: PymeDashboardPage,
});

type PymeTab =
  | "publicar"
  | "publicaciones"
  | "postulaciones"
  | "activos"
  | "finalizados"
  | "calificaciones"
  | "pagos"
  | "empresa"
  | "notificaciones";

function PymeDashboardPage() {
  const { user, profile, privateAccount, loading, needsOnboarding } = useTandemyAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PymeTab>("publicaciones");

  // Firestore collections
  const [projects, setProjects] = useState<TandemyProject[]>([]);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [payments, setPayments] = useState<SimulatedPayment[]>([]);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<ProjectReview[]>([]);
  const [reviewsGiven, setReviewsGiven] = useState<ProjectReview[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  // Publish project form
  const [projTitle, setProjTitle] = useState("");
  const [projArea, setProjArea] = useState<string>(PROJECT_AREAS[0]);
  const [projDescription, setProjDescription] = useState("");
  const [projActivities, setProjActivities] = useState("");
  const [projSkills, setProjSkills] = useState("");
  const [projDegrees, setProjDegrees] = useState<string[]>([]);
  const [projBudget, setProjBudget] = useState("2000");
  const [projDuration, setProjDuration] = useState("10 días");
  const [projDeadline, setProjDeadline] = useState("");
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishError, setPublishError] = useState("");

  // Edit project modal
  const [editingProject, setEditingProject] = useState<TandemyProject | null>(null);
  const [editBusy, setEditBusy] = useState(false);

  // Applicant inspection modal
  const [appProjectFilter, setAppProjectFilter] = useState("");
  const [inspectedApplicant, setInspectedApplicant] = useState<{
    application: ProjectApplication;
    studentProfile: UserProfile | null;
    studentReviews: ProjectReview[];
  } | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  // Company profile state
  const [compName, setCompName] = useState("");
  const [compPhotoUrl, setCompPhotoUrl] = useState("");
  const [compSector, setCompSector] = useState("");
  const [compDescription, setCompDescription] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [compRfc, setCompRfc] = useState("");
  const [compBusy, setCompBusy] = useState(false);
  const [compMsg, setCompMsg] = useState("");
  const [compErr, setCompErr] = useState("");

  // Payment / Certificate / Review modals
  const [paymentModalData, setPaymentModalData] = useState<{
    payment: SimulatedPayment;
    project: TandemyProject;
  } | null>(null);
  const [previewCert, setPreviewCert] = useState<DigitalCertificate | null>(null);
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
    } else if (profile?.role === "student") {
      void navigate({ to: "/panel-estudiante", replace: true });
    }
  }, [loading, user, profile, needsOnboarding, navigate]);

  // Sync company profile form
  useEffect(() => {
    if (!profile) return;
    setCompName(profile.companyName || profile.displayName || "");
    setCompPhotoUrl(profile.photoUrl || "");
    setCompSector(profile.businessType || "");
    setCompDescription(profile.companyDescription || "");
    setCompCity(profile.city || "Chihuahua, Chih.");
  }, [profile]);

  useEffect(() => {
    if (!privateAccount) return;
    setCompPhone(privateAccount.phone || "");
    setCompRfc(privateAccount.rfc || "");
  }, [privateAccount]);

  // Real-time Firestore subscriptions
  useEffect(() => {
    if (!user || profile?.role !== "pyme") return;
    const uid = user.uid;

    const unsubs = [
      onSnapshot(
        query(collection(db, "projects"), where("ownerId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<TandemyProject, "id">) }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
          setProjects(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "projects"),
      ),
      onSnapshot(
        query(collection(db, "applications"), where("pymeId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectApplication, "id">) }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
          setApplications(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "applications"),
      ),
      onSnapshot(
        query(collection(db, "payments"), where("pymeId", "==", uid)),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<SimulatedPayment, "id">) }))
            .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
          setPayments(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "payments"),
      ),
      onSnapshot(
        query(collection(db, "certificates"), where("pymeId", "==", uid)),
        (snap) => {
          setCertificates(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<DigitalCertificate, "id">),
            })),
          );
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

  if (loading || !user || !profile || profile.role !== "pyme") {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-sm text-muted-foreground">
        Cargando tu panel empresarial…
      </main>
    );
  }

  const pendingAppsCount = applications.filter((a) => a.status === "pending").length;
  const activeProjects = projects.filter((p) => p.status === "in_progress");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: DashboardNavItem<PymeTab>[] = [
    { id: "publicar", label: "Publicar proyecto", icon: PlusCircle },
    { id: "publicaciones", label: "Mis publicaciones", icon: Briefcase, badge: projects.length },
    { id: "postulaciones", label: "Postulaciones recibidas", icon: Users, badge: pendingAppsCount },
    { id: "activos", label: "Proyectos activos", icon: FolderKanban, badge: activeProjects.length },
    {
      id: "finalizados",
      label: "Proyectos finalizados",
      icon: FolderCheck,
      badge: completedProjects.length,
    },
    { id: "pagos", label: "Pagos", icon: CreditCard },
    { id: "calificaciones", label: "Calificaciones", icon: Star },
    { id: "notificaciones", label: "Notificaciones y mensajes", icon: Bell, badge: unreadCount },
    { id: "empresa", label: "Perfil de empresa", icon: Building2 },
  ];

  const sectionMeta: Record<PymeTab, { title: string; subtitle: string }> = {
    publicar: {
      title: "Publicar un proyecto",
      subtitle: "Define alcance, actividades, habilidades y presupuesto para recibir propuestas.",
    },
    publicaciones: {
      title: "Mis publicaciones",
      subtitle: "Administra tus convocatorias abiertas, edita detalles o cierra publicaciones.",
    },
    postulaciones: {
      title: "Postulaciones recibidas",
      subtitle:
        "Revisa perfiles de estudiantes, compara propuestas y selecciona al candidato ideal.",
    },
    activos: {
      title: "Proyectos activos",
      subtitle: "Da seguimiento al trabajo en curso, chatea con el estudiante y confirma entregas.",
    },
    finalizados: {
      title: "Proyectos finalizados",
      subtitle: "Historial de proyectos concluidos, constancias digitales y evaluaciones.",
    },
    pagos: {
      title: "Pagos de proyectos",
      subtitle: "Realiza pagos simulados con garantía Tandemy y revisa tu historial.",
    },
    calificaciones: {
      title: "Calificaciones",
      subtitle: "Evalúa el desempeño de los estudiantes y consulta las reseñas sobre tu empresa.",
    },
    notificaciones: {
      title: "Notificaciones y mensajes",
      subtitle: "Alertas de nuevas postulaciones, confirmaciones y mensajes directos.",
    },
    empresa: {
      title: "Perfil de empresa",
      subtitle: "Actualiza logotipo, giro comercial, descripción y datos de contacto.",
    },
  };

  const totalPaid = payments
    .filter((p) => p.status === "released" || p.status === "pending_release" || p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPendingPayment = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  function toggleDegreeSelection(deg: string) {
    setProjDegrees((prev) => (prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]));
  }

  async function handlePublishProject(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setPublishBusy(true);
    setPublishMessage("");
    setPublishError("");
    try {
      await publishProject(profile, {
        title: projTitle,
        area: projArea,
        description: projDescription,
        activities: projActivities,
        requiredSkills: parseSkillsInput(projSkills),
        targetDegrees: projDegrees.length ? projDegrees : ["Contador Público"],
        budget: Number(projBudget) || 1500,
        duration: projDuration,
        deadline: projDeadline,
      });
      setProjTitle("");
      setProjDescription("");
      setProjActivities("");
      setProjSkills("");
      setProjDegrees([]);
      setPublishMessage("Proyecto publicado correctamente. Ya es visible para estudiantes.");
      setActiveTab("publicaciones");
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "No pudimos publicar el proyecto.");
    } finally {
      setPublishBusy(false);
    }
  }

  async function handleEditProjectSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingProject) return;
    const form = new FormData(e.currentTarget);
    setEditBusy(true);
    try {
      await editOpenProject(editingProject.id, {
        title: String(form.get("title") ?? ""),
        area: String(form.get("area") ?? editingProject.area),
        description: String(form.get("description") ?? ""),
        activities: String(form.get("activities") ?? ""),
        requiredSkills: parseSkillsInput(String(form.get("skills") ?? "")),
        targetDegrees: editingProject.targetDegrees,
        budget: Number(form.get("budget") ?? editingProject.budget),
        duration: String(form.get("duration") ?? ""),
        deadline: String(form.get("deadline") ?? ""),
      });
      setEditingProject(null);
    } finally {
      setEditBusy(false);
    }
  }

  async function inspectStudent(app: ProjectApplication) {
    setInspectLoading(true);
    setInspectedApplicant({ application: app, studentProfile: null, studentReviews: [] });
    try {
      const [profSnap, revSnap] = await Promise.all([
        getDoc(doc(db, "profiles", app.studentId)),
        getDocs(query(collection(db, "reviews"), where("revieweeId", "==", app.studentId))),
      ]);
      setInspectedApplicant({
        application: app,
        studentProfile: profSnap.exists() ? (profSnap.data() as UserProfile) : null,
        studentReviews: revSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ProjectReview, "id">),
        })),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `profiles/${app.studentId}`);
    } finally {
      setInspectLoading(false);
    }
  }

  async function handleAcceptApplication(app: ProjectApplication) {
    const project = projects.find((p) => p.id === app.projectId);
    if (!project) return;
    setActionBusyId(app.id);
    try {
      const others = applications.filter((a) => a.projectId === app.projectId);
      await acceptStudentApplication({
        project,
        application: app,
        otherApplications: others,
      });
      setInspectedApplicant(null);
      setActiveTab("activos");
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleRejectApplication(app: ProjectApplication) {
    if (!user) return;
    setActionBusyId(app.id);
    try {
      await rejectStudentApplication(app, user.uid);
      setInspectedApplicant(null);
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleConfirmCompletion(project: TandemyProject) {
    if (!user) return;
    setActionBusyId(project.id);
    try {
      let studentProfile: UserProfile | null = null;
      if (project.selectedStudentId) {
        const snap = await getDoc(doc(db, "profiles", project.selectedStudentId));
        if (snap.exists()) studentProfile = snap.data() as UserProfile;
      }
      const payment = payments.find((p) => p.projectId === project.id) ?? null;
      await confirmProjectCompletion({
        project,
        actorRole: "pyme",
        actorId: user.uid,
        studentProfile,
        payment,
      });
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setCompPhotoUrl(dataUrl);
      setCompMsg("Logotipo cargado. Haz clic en 'Guardar cambios' para aplicar.");
    } catch (err) {
      setCompErr(err instanceof Error ? err.message : "No se pudo leer la imagen.");
    }
  }

  async function handleSaveCompanyProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setCompBusy(true);
    setCompMsg("");
    setCompErr("");
    try {
      await updatePymeProfile(user.uid, {
        companyName: compName,
        photoUrl: compPhotoUrl,
        businessType: compSector,
        companyDescription: compDescription,
        city: compCity,
        phone: compPhone,
        rfc: compRfc,
      });
      setCompMsg("Perfil empresarial actualizado correctamente.");
    } catch (err) {
      setCompErr(err instanceof Error ? err.message : "No se pudo guardar el perfil.");
    } finally {
      setCompBusy(false);
    }
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reviewTargetProject || !profile || !reviewTargetProject.selectedStudentId) return;
    setReviewBusy(true);
    try {
      await submitProjectReview({
        project: reviewTargetProject,
        reviewerProfile: profile,
        revieweeId: reviewTargetProject.selectedStudentId,
        revieweeName: reviewTargetProject.selectedStudentName || "Estudiante FCA",
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

  const filteredApplications = appProjectFilter
    ? applications.filter((a) => a.projectId === appProjectFilter)
    : applications;

  return (
    <DashboardShell
      roleLabel="PyME"
      title={sectionMeta[activeTab].title}
      subtitle={sectionMeta[activeTab].subtitle}
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      unreadNotifications={unreadCount}
      onOpenNotifications={() => setActiveTab("notificaciones")}
    >
      {/* Top KPI Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Publicaciones totales</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{projects.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Postulaciones pendientes</p>
          <p className="mt-1 text-2xl font-bold text-primary tabular-nums">{pendingAppsCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Proyectos activos</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
            {activeProjects.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total invertido en proyectos</p>
          <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
            {formatMxn(totalPaid)}
          </p>
        </div>
      </div>

      {/* TAB 1: PUBLISH PROJECT */}
      {activeTab === "publicar" && (
        <form
          onSubmit={handlePublishProject}
          className="mx-auto max-w-3xl space-y-5 rounded-xl border bg-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium sm:col-span-2">
              Título del proyecto *
              <input
                required
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                placeholder="Ej. Estructura de costos y punto de equilibrio"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Área de trabajo *
              <select
                required
                value={projArea}
                onChange={(e) => setProjArea(e.target.value)}
                className={inputClass}
              >
                {PROJECT_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Presupuesto estimado (MXN) *
              <input
                required
                type="number"
                min={100}
                value={projBudget}
                onChange={(e) => setProjBudget(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Duración estimada *
              <input
                required
                value={projDuration}
                onChange={(e) => setProjDuration(e.target.value)}
                placeholder="Ej. 10 días / 2 semanas"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Fecha límite para postularse *
              <input
                required
                type="date"
                value={projDeadline}
                onChange={(e) => setProjDeadline(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Descripción del proyecto *
            <textarea
              required
              rows={3}
              value={projDescription}
              onChange={(e) => setProjDescription(e.target.value)}
              placeholder="Explica la necesidad de tu negocio y el objetivo que esperan lograr."
              className={textareaClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Actividades por realizar / Entregables *
            <textarea
              required
              rows={3}
              value={projActivities}
              onChange={(e) => setProjActivities(e.target.value)}
              placeholder="Enumera las tareas específicas y lo que deberá entregar el estudiante."
              className={textareaClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Habilidades requeridas (separadas por coma) *
            <input
              required
              value={projSkills}
              onChange={(e) => setProjSkills(e.target.value)}
              placeholder="Ej. Excel, Contabilidad de costos, Análisis financiero"
              className={inputClass}
            />
          </label>

          <div>
            <p className="text-sm font-medium">Carreras sugeridas</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DEGREES.map((deg) => (
                <label
                  key={deg}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium"
                >
                  <input
                    type="checkbox"
                    checked={projDegrees.includes(deg)}
                    onChange={() => toggleDegreeSelection(deg)}
                  />
                  <span>{deg}</span>
                </label>
              ))}
            </div>
          </div>

          {publishError && (
            <p role="alert" className="text-sm text-destructive">
              {publishError}
            </p>
          )}
          {publishMessage && (
            <p role="status" className="text-sm font-medium text-primary">
              {publishMessage}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={publishBusy} className="rounded-full px-7">
              {publishBusy ? "Publicando…" : "Publicar proyecto"}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: MY PUBLICATIONS */}
      {activeTab === "publicaciones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {projects.length} publicación(es) registrada(s)
            </p>
            <Button onClick={() => setActiveTab("publicar")} className="gap-2 rounded-full">
              <PlusCircle className="h-4 w-4" />
              Nuevo proyecto
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-semibold">Aún no has publicado proyectos</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea tu primer proyecto para comenzar a recibir propuestas de estudiantes.
              </p>
              <Button className="mt-4 rounded-full" onClick={() => setActiveTab("publicar")}>
                Publicar mi primer proyecto
              </Button>
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card">
              {projects.map((p) => {
                const countApps = applications.filter((a) => a.projectId === p.id).length;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {p.area}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                            p.status === "open"
                              ? "bg-primary/10 text-primary"
                              : p.status === "in_progress"
                                ? "bg-amber-100 text-amber-800"
                                : p.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {PROJECT_STATUS_LABEL[p.status]}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          {countApps} postulación(es)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{p.title}</h3>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatMxn(p.budget)} · {p.duration} · Límite {p.deadline}
                        {p.selectedStudentName ? ` · Estudiante: ${p.selectedStudentName}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {countApps > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setAppProjectFilter(p.id);
                            setActiveTab("postulaciones");
                          }}
                        >
                          Ver postulaciones ({countApps})
                        </Button>
                      )}
                      {p.status === "open" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProject(p)}
                            className="gap-1.5 rounded-full"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void closeOpenProject(p.id)}
                            className="rounded-full"
                          >
                            Cerrar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => void deleteOpenProject(p.id)}
                            aria-label="Eliminar publicación"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPLICATIONS RECEIVED */}
      {activeTab === "postulaciones" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <span>Filtrar por proyecto:</span>
              <select
                value={appProjectFilter}
                onChange={(e) => setAppProjectFilter(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos mis proyectos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredApplications.length} postulación(es)
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-semibold">Aún no recibes postulaciones</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando un estudiante envíe su propuesta, podrás revisar su perfil completo aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card">
              {filteredApplications.map((app) => {
                const project = projects.find((p) => p.id === app.projectId);
                const projectOpen = project?.status === "open";
                return (
                  <div key={app.id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-foreground">{app.studentName}</h3>
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
                          {[app.studentDegree, app.studentSemester].filter(Boolean).join(" · ")} ·
                          Proyecto: <strong className="text-foreground">{app.projectTitle}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-base font-bold text-primary tabular-nums">
                          {formatMxn(app.proposedAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Plazo propuesto: {app.proposedDuration}
                        </p>
                      </div>
                    </div>

                    <p className="rounded-lg bg-secondary/50 p-3 text-sm text-foreground">
                      “{app.coverLetter}”
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void inspectStudent(app)}
                        className="rounded-full"
                      >
                        Ver perfil y calificaciones del estudiante
                      </Button>
                      {app.status === "pending" && projectOpen && (
                        <>
                          <Button
                            size="sm"
                            disabled={actionBusyId === app.id}
                            onClick={() => void handleAcceptApplication(app)}
                            className="gap-1.5 rounded-full"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aceptar y seleccionar estudiante
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionBusyId === app.id}
                            onClick={() => void handleRejectApplication(app)}
                            className="gap-1.5 rounded-full text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACTIVE PROJECTS */}
      {activeTab === "activos" && (
        <div className="space-y-5">
          {activeProjects.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-semibold">No tienes proyectos activos en curso</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona a un estudiante en “Postulaciones recibidas” para iniciar un proyecto.
              </p>
            </div>
          ) : (
            activeProjects.map((project) => {
              const payment = payments.find((p) => p.projectId === project.id);
              const needsPayment = !payment || payment.status === "pending";
              return (
                <section key={project.id} className="space-y-4 rounded-xl border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {project.area}
                        </span>
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          En proceso
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold">{project.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        Estudiante seleccionado:{" "}
                        <strong className="text-foreground">
                          {project.selectedStudentName || "Estudiante FCA"}
                        </strong>{" "}
                        · Monto:{" "}
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
                      {needsPayment && payment && (
                        <Button
                          variant="outline"
                          onClick={() => setPaymentModalData({ payment, project })}
                          className="gap-2 rounded-full border-primary text-primary hover:bg-primary/5"
                        >
                          <CreditCard className="h-4 w-4" />
                          Realizar pago simulado
                        </Button>
                      )}
                      {!project.pymeConfirmedComplete ? (
                        <Button
                          disabled={actionBusyId === project.id}
                          onClick={() => void handleConfirmCompletion(project)}
                          className="gap-2 rounded-full"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {actionBusyId === project.id
                            ? "Confirmando…"
                            : "Confirmar proyecto completado"}
                        </Button>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                          Esperando confirmación del estudiante
                        </span>
                      )}
                    </div>
                  </div>

                  {project.selectedStudentId && (
                    <ProjectChatPanel
                      project={project}
                      currentProfile={profile}
                      recipientId={project.selectedStudentId}
                      recipientLabel={project.selectedStudentName || "Estudiante"}
                    />
                  )}
                </section>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: COMPLETED PROJECTS */}
      {activeTab === "finalizados" && (
        <div className="space-y-4">
          {completedProjects.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-semibold">Aún no hay proyectos finalizados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando tú y el estudiante confirmen la entrega final, el proyecto aparecerá aquí
                junto con su constancia.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card">
              {completedProjects.map((project) => {
                const payment = payments.find((p) => p.projectId === project.id);
                const cert = certificates.find((c) => c.projectId === project.id);
                const alreadyRated = reviewsGiven.some((r) => r.projectId === project.id);
                return (
                  <div
                    key={project.id}
                    className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          Finalizado
                        </span>
                        <span className="text-xs text-muted-foreground">{project.area}</span>
                      </div>
                      <h3 className="text-base font-bold">{project.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Estudiante: {project.selectedStudentName} · Pago:{" "}
                        {payment ? PAYMENT_STATUS_LABEL[payment.status] : "Sin registro"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {payment?.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentModalData({ payment, project })}
                          className="gap-1.5 rounded-full"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Liberar pago simulado
                        </Button>
                      )}
                      {cert && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewCert(cert)}
                          className="gap-1.5 rounded-full"
                        >
                          <Award className="h-3.5 w-3.5" />
                          Ver constancia
                        </Button>
                      )}
                      {!alreadyRated && project.selectedStudentId && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReviewTargetProject(project);
                            setReviewStars(5);
                            setReviewComment("");
                          }}
                          className="gap-1.5 rounded-full"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Calificar estudiante
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PAYMENTS */}
      {activeTab === "pagos" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Pagos realizados / liberados
              </p>
              <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
                {formatMxn(totalPaid)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Pagos pendientes de realizar
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                {formatMxn(totalPendingPayment)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-bold">Historial de pagos</h2>
            </div>
            {payments.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Los pagos se generan automáticamente al seleccionar a un estudiante en un proyecto.
              </p>
            ) : (
              <div className="divide-y">
                {payments.map((pay) => {
                  const relatedProject = projects.find((p) => p.id === pay.projectId);
                  return (
                    <div
                      key={pay.id}
                      className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{pay.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Estudiante: {pay.studentName}
                          {pay.paymentMethod ? ` · ${pay.paymentMethod}` : ""}
                          {pay.referenceCode ? ` · Folio: ${pay.referenceCode}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          Comisión Tandemy (10%): {formatMxn(pay.platformFee)} · Neto estudiante:{" "}
                          {formatMxn(pay.studentNetAmount)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold text-foreground tabular-nums">
                            {formatMxn(pay.amount)}
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
                        {pay.status === "pending" && relatedProject && (
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              setPaymentModalData({ payment: pay, project: relatedProject })
                            }
                          >
                            Pagar ahora
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: REVIEWS */}
      {activeTab === "calificaciones" && (
        <div className="space-y-6">
          {completedProjects
            .filter((p) => p.selectedStudentId && !reviewsGiven.some((r) => r.projectId === p.id))
            .map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent/50 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    Evalúa el desempeño de {p.selectedStudentName}
                  </p>
                  <p className="text-xs text-muted-foreground">Proyecto: {p.title}</p>
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
                  Calificar estudiante
                </Button>
              </div>
            ))}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card">
              <div className="border-b px-5 py-3">
                <h2 className="text-sm font-bold">Calificaciones que has otorgado</h2>
              </div>
              {reviewsGiven.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  Aún no has calificado a ningún estudiante.
                </p>
              ) : (
                <div className="divide-y">
                  {reviewsGiven.map((r) => (
                    <div key={r.id} className="space-y-1 p-5">
                      <p className="font-semibold text-foreground">{r.revieweeName}</p>
                      <p className="text-xs text-muted-foreground">{r.projectTitle}</p>
                      <Stars value={r.rating} />
                      <p className="text-sm">“{r.comment}”</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card">
              <div className="border-b px-5 py-3">
                <h2 className="text-sm font-bold">Calificaciones recibidas de estudiantes</h2>
              </div>
              {reviewsReceived.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  Aún no recibes calificaciones de estudiantes.
                </p>
              ) : (
                <div className="divide-y">
                  {reviewsReceived.map((r) => (
                    <div key={r.id} className="space-y-1 p-5">
                      <p className="font-semibold text-foreground">{r.reviewerName}</p>
                      <p className="text-xs text-muted-foreground">{r.projectTitle}</p>
                      <Stars value={r.rating} />
                      <p className="text-sm">“{r.comment}”</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS & MESSAGES */}
      {activeTab === "notificaciones" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-bold">Notificaciones recientes</h2>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => void markAllNotificationsRead()}>
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No tienes notificaciones por el momento.
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
                        <p className="text-sm font-semibold">{n.title}</p>
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

          {activeProjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold">Conversaciones activas con estudiantes</h2>
              {activeProjects.map((p) =>
                p.selectedStudentId ? (
                  <div key={p.id} className="rounded-xl border bg-card p-5">
                    <p className="mb-3 text-sm font-bold">{p.title}</p>
                    <ProjectChatPanel
                      project={p}
                      currentProfile={profile}
                      recipientId={p.selectedStudentId}
                      recipientLabel={p.selectedStudentName || "Estudiante"}
                    />
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: COMPANY PROFILE */}
      {activeTab === "empresa" && (
        <form
          onSubmit={handleSaveCompanyProfile}
          className="mx-auto max-w-3xl space-y-6 rounded-xl border bg-card p-6"
        >
          <div className="flex flex-wrap items-center gap-5 border-b pb-5">
            {compPhotoUrl ? (
              <img
                src={compPhotoUrl}
                alt={compName}
                className="h-20 w-20 rounded-2xl border object-cover"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-hero text-xl font-bold text-navy-foreground">
                {compName.slice(0, 2).toUpperCase() || "PY"}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Logotipo de empresa</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  Subir logotipo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handleLogoUpload(e)}
                    className="sr-only"
                  />
                </label>
                {compPhotoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompPhotoUrl("")}
                  >
                    Quitar logotipo
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Correo empresarial: {privateAccount?.email || user.email}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Nombre de la empresa
              <input
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Giro comercial
              <input
                required
                value={compSector}
                onChange={(e) => setCompSector(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Teléfono de contacto
              <input
                required
                value={compPhone}
                onChange={(e) => setCompPhone(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              RFC (opcional)
              <input
                value={compRfc}
                onChange={(e) => setCompRfc(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Ciudad
            <input
              value={compCity}
              onChange={(e) => setCompCity(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Descripción de la empresa
            <textarea
              required
              rows={4}
              value={compDescription}
              onChange={(e) => setCompDescription(e.target.value)}
              className={textareaClass}
            />
          </label>

          {compErr && (
            <p role="alert" className="text-sm text-destructive">
              {compErr}
            </p>
          )}
          {compMsg && (
            <p role="status" className="text-sm font-medium text-primary">
              {compMsg}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={compBusy} className="rounded-full px-6">
              {compBusy ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      )}

      {/* EDIT OPEN PROJECT MODAL */}
      <Dialog
        open={Boolean(editingProject)}
        onOpenChange={(open) => {
          if (!open) setEditingProject(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl">
          {editingProject && (
            <>
              <DialogTitle>Editar proyecto</DialogTitle>
              <DialogDescription>
                Actualiza los detalles de tu publicación mientras esté abierta.
              </DialogDescription>
              <form onSubmit={handleEditProjectSubmit} className="space-y-3">
                <label className="block text-sm font-medium">
                  Título
                  <input
                    required
                    name="title"
                    defaultValue={editingProject.title}
                    className={inputClass}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Área
                    <select name="area" defaultValue={editingProject.area} className={inputClass}>
                      {PROJECT_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    Presupuesto (MXN)
                    <input
                      required
                      type="number"
                      min={100}
                      name="budget"
                      defaultValue={editingProject.budget}
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Duración
                    <input
                      required
                      name="duration"
                      defaultValue={editingProject.duration}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Fecha límite
                    <input
                      required
                      type="date"
                      name="deadline"
                      defaultValue={editingProject.deadline}
                      className={inputClass}
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  Descripción
                  <textarea
                    required
                    rows={3}
                    name="description"
                    defaultValue={editingProject.description}
                    className={textareaClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Actividades
                  <textarea
                    required
                    rows={2}
                    name="activities"
                    defaultValue={editingProject.activities}
                    className={textareaClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Habilidades (separadas por coma)
                  <input
                    required
                    name="skills"
                    defaultValue={editingProject.requiredSkills.join(", ")}
                    className={inputClass}
                  />
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={editBusy} className="rounded-full">
                    {editBusy ? "Guardando…" : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* INSPECT STUDENT PROFILE MODAL */}
      <Dialog
        open={Boolean(inspectedApplicant)}
        onOpenChange={(open) => {
          if (!open) setInspectedApplicant(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl">
          {inspectedApplicant && (
            <>
              <DialogTitle>Perfil de {inspectedApplicant.application.studentName}</DialogTitle>
              <DialogDescription>
                Postulación para “{inspectedApplicant.application.projectTitle}”
              </DialogDescription>

              {inspectLoading ? (
                <p className="py-6 text-sm text-muted-foreground">Cargando perfil completo…</p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-4 rounded-xl border bg-secondary/40 p-4">
                    {inspectedApplicant.studentProfile?.photoUrl ? (
                      <img
                        src={inspectedApplicant.studentProfile.photoUrl}
                        alt={inspectedApplicant.application.studentName}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-hero text-base font-bold text-navy-foreground">
                        {inspectedApplicant.application.studentName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-foreground">
                        {inspectedApplicant.studentProfile?.displayName ||
                          inspectedApplicant.application.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[
                          inspectedApplicant.studentProfile?.degree ||
                            inspectedApplicant.application.studentDegree,
                          inspectedApplicant.studentProfile?.semester ||
                            inspectedApplicant.application.studentSemester,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inspectedApplicant.studentProfile?.university ||
                          "Universidad Autónoma de Chihuahua (FCA)"}
                      </p>
                    </div>
                  </div>

                  {inspectedApplicant.studentProfile?.bio && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Presentación
                      </p>
                      <p className="mt-1">{inspectedApplicant.studentProfile.bio}</p>
                    </div>
                  )}

                  {inspectedApplicant.studentProfile?.experience && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Experiencia
                      </p>
                      <p className="mt-1">{inspectedApplicant.studentProfile.experience}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Habilidades
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(
                        inspectedApplicant.studentProfile?.skills ??
                        inspectedApplicant.application.studentSkills ??
                        []
                      ).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Calificaciones recibidas ({inspectedApplicant.studentReviews.length})
                    </p>
                    {inspectedApplicant.studentReviews.length === 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Aún no tiene evaluaciones previas registradas.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {inspectedApplicant.studentReviews.map((r) => (
                          <div key={r.id} className="rounded-xl bg-secondary p-3">
                            <Stars value={r.rating} />
                            <p className="mt-1 text-xs">
                              “{r.comment}” — {r.reviewerName}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {inspectedApplicant.application.status === "pending" &&
                    projects.find((p) => p.id === inspectedApplicant.application.projectId)
                      ?.status === "open" && (
                      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                        <Button
                          variant="outline"
                          disabled={actionBusyId === inspectedApplicant.application.id}
                          onClick={() =>
                            void handleRejectApplication(inspectedApplicant.application)
                          }
                          className="rounded-full text-destructive"
                        >
                          Rechazar propuesta
                        </Button>
                        <Button
                          disabled={actionBusyId === inspectedApplicant.application.id}
                          onClick={() =>
                            void handleAcceptApplication(inspectedApplicant.application)
                          }
                          className="rounded-full"
                        >
                          Aceptar y seleccionar estudiante
                        </Button>
                      </div>
                    )}
                </div>
              )}
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
              <DialogTitle>Calificar a {reviewTargetProject.selectedStudentName}</DialogTitle>
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
                  Comentario sobre su desempeño
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Puntualidad, calidad de entregables y comunicación."
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
                    {reviewBusy ? "Guardando…" : "Publicar evaluación"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PaymentSimulatorModal
        open={Boolean(paymentModalData)}
        onOpenChange={(open) => {
          if (!open) setPaymentModalData(null);
        }}
        payment={paymentModalData?.payment ?? null}
        project={paymentModalData?.project ?? null}
      />

      <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
    </DashboardShell>
  );
}
