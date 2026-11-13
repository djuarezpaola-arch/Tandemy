import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, GraduationCap, ArrowLeft, LogIn, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteChrome, type Utility } from "@/components/site-chrome";
import { useTandemyAuth } from "@/components/student-session";
import {
  authErrorToSpanish,
  loginWithEmail,
  loginWithGoogle,
  parseSkillsInput,
  registerPymeAccount,
  registerStudentAccount,
  savePymeAccountDocs,
  saveStudentAccountDocs,
} from "@/lib/tandemy-db";
import { DEGREES } from "@/lib/tandemy-types";
import capturedCSS from "../styles/pages/registro.css?raw";

type RegistroSearch = {
  modo?: string | undefined;
  tipo?: string | undefined;
};

export const Route = createFileRoute("/registro")({
  validateSearch: (search: Record<string, unknown>): RegistroSearch => ({
    modo: typeof search["modo"] === "string" ? search["modo"] : undefined,
    tipo: typeof search["tipo"] === "string" ? search["tipo"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Acceso y registro · Tandemy" },
      {
        name: "description",
        content:
          "Inicia sesión o crea tu cuenta de estudiante FCA UACH o PyME de Chihuahua en Tandemy.",
      },
      { property: "og:title", content: "Acceso y registro · Tandemy" },
      {
        property: "og:description",
        content: "Inicia sesión o crea tu cuenta de estudiante o PyME en Tandemy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  staticData: { importedDocument: { html: { lang: "es" } } },
  component: RegistroPage,
});

function RegistroPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile, loading, needsOnboarding, signOut } = useTandemyAuth();

  const [utility, setUtility] = useState<Utility>(null);
  const [authTab, setAuthTab] = useState<"login" | "register">(
    search.modo === "login" ? "login" : "register",
  );
  const [roleChoice, setRoleChoice] = useState<"estudiante" | "pyme" | null>(
    search.tipo === "estudiante" || search.tipo === "pyme" ? search.tipo : null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (search.modo === "login") {
      setAuthTab("login");
    } else if (search.tipo === "estudiante" || search.tipo === "pyme") {
      setAuthTab("register");
      setRoleChoice(search.tipo);
    }
  }, [search.modo, search.tipo]);

  // Redirect already authenticated users with completed profiles directly to their panel
  useEffect(() => {
    if (!loading && user && profile) {
      void navigate({
        to: profile.role === "pyme" ? "/panel-pyme" : "/panel-estudiante",
        replace: true,
      });
    }
  }, [loading, user, profile, navigate]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setInfoMessage("");
    try {
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      const res = await loginWithEmail(email, password);
      if (res.profile?.role === "pyme") {
        await navigate({ to: "/panel-pyme", replace: true });
      } else if (res.profile?.role === "student") {
        await navigate({ to: "/panel-estudiante", replace: true });
      } else {
        setInfoMessage("Sesión iniciada. Completa los datos de tu perfil para continuar.");
      }
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const studentInput = {
        displayName: String(form.get("displayName") ?? ""),
        studentNumber: String(form.get("studentNumber") ?? ""),
        degree: String(form.get("degree") ?? ""),
        semester: String(form.get("semester") ?? ""),
        university:
          String(form.get("university") ?? "").trim() || "Universidad Autónoma de Chihuahua (FCA)",
        bio: String(form.get("bio") ?? ""),
        skills: parseSkillsInput(String(form.get("skills") ?? "")),
        experience: String(form.get("experience") ?? ""),
      };

      if (user && needsOnboarding) {
        await saveStudentAccountDocs(user.uid, user.email || "", studentInput);
      } else {
        await registerStudentAccount({
          ...studentInput,
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
        });
      }
      await navigate({ to: "/panel-estudiante", replace: true });
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  async function handlePymeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const pymeInput = {
        companyName: String(form.get("companyName") ?? ""),
        businessType: String(form.get("businessType") ?? ""),
        companyDescription: String(form.get("companyDescription") ?? ""),
        phone: String(form.get("phone") ?? ""),
        rfc: String(form.get("rfc") ?? ""),
        city: String(form.get("city") ?? "").trim() || "Chihuahua, Chih.",
      };

      if (user && needsOnboarding) {
        await savePymeAccountDocs(user.uid, user.email || "", pymeInput);
      } else {
        await registerPymeAccount({
          ...pymeInput,
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
        });
      }
      await navigate({ to: "/panel-pyme", replace: true });
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setBusy(true);
    setError("");
    setInfoMessage("");
    try {
      const res = await loginWithGoogle();
      if (!res.needsOnboarding && res.profile) {
        await navigate({
          to: res.profile.role === "pyme" ? "/panel-pyme" : "/panel-estudiante",
          replace: true,
        });
      } else {
        setAuthTab("register");
        setInfoMessage(
          "Sesión con Google conectada. Selecciona tu tipo de cuenta y completa tu perfil.",
        );
      }
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const textareaClass =
    "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const progressWidth = authTab === "login" ? "50%" : roleChoice ? "85%" : "30%";

  return (
    <>
      <style>{capturedCSS}</style>
      <SiteChrome active="/registro" utility={utility} setUtility={setUtility}>
        <section className="bg-hero text-navy-foreground">
          <div className="container-page py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan">
              Plataforma Tandemy
            </p>
            <h1 className="mt-1.5 text-3xl font-bold md:text-4xl">
              {needsOnboarding
                ? "Completa tu perfil"
                : authTab === "login"
                  ? "Inicia sesión en tu cuenta"
                  : "Crea tu cuenta en Tandemy"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-navy-foreground/80">
              Conecta como estudiante universitario o como PyME para publicar proyectos, recibir
              propuestas, realizar pagos simulados y emitir constancias digitales.
            </p>
          </div>
        </section>

        <div className="container-page max-w-2xl py-10">
          <div
            className="relative mb-6 h-1.5 w-full overflow-hidden rounded-full bg-primary/15"
            aria-valuemax={100}
            aria-valuemin={0}
            role="progressbar"
          >
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>

          {!needsOnboarding && (
            <div className="mb-8 inline-flex w-full rounded-xl border bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setError("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  authTab === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setError("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  authTab === "register"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Registrarse
              </button>
            </div>
          )}

          {needsOnboarding && user && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-accent/60 p-4 text-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Conectado como {user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Elige si usarás la plataforma como estudiante o como PyME para finalizar.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Usar otra cuenta
              </Button>
            </div>
          )}

          {infoMessage && (
            <p
              role="status"
              className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
            >
              {infoMessage}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {/* LOGIN VIEW */}
          {authTab === "login" && !needsOnboarding && (
            <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
              <h2 className="text-xl font-bold">Accede a tu panel</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Te llevaremos automáticamente a tu panel de estudiante o de PyME según tu cuenta.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
                <label className="block text-sm font-medium">
                  Correo electrónico
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Contraseña
                  <input
                    required
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    minLength={6}
                    className={fieldClass}
                  />
                </label>

                <div className="flex items-center justify-between text-xs">
                  <Link to="/reset-password" className="text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                  <button
                    type="button"
                    className="font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setAuthTab("register");
                      setError("");
                    }}
                  >
                    ¿No tienes cuenta? Regístrate
                  </button>
                </div>

                <Button type="submit" className="h-11 w-full rounded-full" disabled={busy}>
                  {busy ? "Verificando acceso…" : "Iniciar sesión"}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>o continúa con</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleGoogleAuth}
                className="h-11 w-full gap-2 rounded-full"
              >
                <GoogleIcon />
                Continuar con Google
              </Button>
            </div>
          )}

          {/* REGISTRATION ROLE SELECTOR */}
          {(authTab === "register" || needsOnboarding) && !roleChoice && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">¿Cómo quieres usar Tandemy?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Elige el tipo de cuenta que deseas crear. Podrás acceder a herramientas diseñadas
                  para tu rol.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoleChoice("estudiante");
                    setError("");
                  }}
                  className="rounded-2xl border bg-card p-6 text-left shadow-card transition hover:border-primary hover:shadow-lift"
                >
                  <GraduationCap className="h-9 w-9 text-primary" />
                  <p className="mt-4 text-lg font-bold">Soy estudiante</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explora proyectos de PyMEs, envía propuestas, recibe pagos y obtén constancias
                    digitales.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleChoice("pyme");
                    setError("");
                  }}
                  className="rounded-2xl border bg-card p-6 text-left shadow-card transition hover:border-primary hover:shadow-lift"
                >
                  <Building2 className="h-9 w-9 text-primary" />
                  <p className="mt-4 text-lg font-bold">Soy PyME</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Publica proyectos, evalúa postulaciones de estudiantes, selecciona talento y
                    gestiona entregas.
                  </p>
                </button>
              </div>

              {!needsOnboarding && (
                <div className="rounded-2xl border bg-card p-5">
                  <p className="text-sm font-medium text-foreground">
                    ¿Prefieres registrarte rápido con tu cuenta de Google?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={handleGoogleAuth}
                    className="mt-3 h-10 w-full gap-2 rounded-full"
                  >
                    <GoogleIcon />
                    Continuar con Google
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STUDENT REGISTRATION FORM */}
          {(authTab === "register" || needsOnboarding) && roleChoice === "estudiante" && (
            <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRoleChoice(null);
                    setError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cambiar tipo de cuenta
                </button>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  Cuenta de estudiante
                </span>
              </div>

              <h2 className="text-xl font-bold">Registro de estudiante</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea tu perfil profesional para postularte a proyectos reales con PyMEs.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={handleStudentSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Nombre completo *
                    <input
                      required
                      name="displayName"
                      defaultValue={user?.displayName ?? ""}
                      placeholder="Ej. Andrea Morales Díaz"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Matrícula UACH *
                    <input
                      required
                      name="studentNumber"
                      placeholder="Ej. 361428"
                      className={fieldClass}
                    />
                  </label>
                </div>

                {!needsOnboarding && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Correo electrónico institucional UACH *
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="a361428@uach.mx"
                        className={fieldClass}
                      />
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        Modo demo: acepta cualquier correo válido sin códigos ni validación de
                        dominio.
                      </span>
                    </label>
                    <label className="block text-sm font-medium">
                      Contraseña *
                      <input
                        required
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm font-medium sm:col-span-2">
                    Carrera *
                    <select required name="degree" defaultValue="" className={fieldClass}>
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
                    Semestre *
                    <input
                      required
                      name="semester"
                      placeholder="Ej. 7° semestre"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium">
                  Universidad / Facultad
                  <input
                    name="university"
                    defaultValue="Universidad Autónoma de Chihuahua (FCA)"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Habilidades (separadas por coma) *
                  <input
                    required
                    name="skills"
                    placeholder="Ej. Contabilidad general, Excel avanzado, Costos, Power BI"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Descripción / Presentación *
                  <textarea
                    required
                    name="bio"
                    rows={3}
                    placeholder="Cuéntale a las PyMEs en qué áreas destacas y cómo puedes ayudarles."
                    className={textareaClass}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Experiencia previa o proyectos escolares *
                  <textarea
                    required
                    name="experience"
                    rows={3}
                    placeholder="Ej. Prácticas en despacho contable, proyecto de costos para negocio local, análisis financiero en clase."
                    className={textareaClass}
                  />
                </label>

                <Button type="submit" className="mt-2 h-11 w-full rounded-full" disabled={busy}>
                  {busy ? "Creando cuenta…" : "Crear cuenta de estudiante"}
                </Button>
              </form>

              {!needsOnboarding && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>o regístrate con</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={handleGoogleAuth}
                    className="h-11 w-full gap-2 rounded-full"
                  >
                    <GoogleIcon />
                    Continuar con Google
                  </Button>
                </>
              )}
            </div>
          )}

          {/* PYME REGISTRATION FORM */}
          {(authTab === "register" || needsOnboarding) && roleChoice === "pyme" && (
            <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRoleChoice(null);
                    setError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cambiar tipo de cuenta
                </button>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  Cuenta PyME
                </span>
              </div>

              <h2 className="text-xl font-bold">Registro empresarial (PyME)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Publica tus proyectos y colabora con estudiantes universitarios listos para apoyar
                tu negocio.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={handlePymeSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Nombre de la empresa *
                    <input
                      required
                      name="companyName"
                      defaultValue={user?.displayName ?? ""}
                      placeholder="Ej. Panadería La Sierra"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Giro comercial *
                    <input
                      required
                      name="businessType"
                      placeholder="Ej. Alimentos y bebidas / Comercio"
                      className={fieldClass}
                    />
                  </label>
                </div>

                {!needsOnboarding && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Correo electrónico empresarial *
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="contacto@tuempresa.com"
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Contraseña *
                      <input
                        required
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm font-medium">
                    Teléfono de contacto *
                    <input
                      required
                      type="tel"
                      name="phone"
                      placeholder="614 123 4567"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    RFC (opcional)
                    <input name="rfc" placeholder="XAXX010101000" className={fieldClass} />
                  </label>
                  <label className="block text-sm font-medium">
                    Ciudad
                    <input name="city" defaultValue="Chihuahua, Chih." className={fieldClass} />
                  </label>
                </div>

                <label className="block text-sm font-medium">
                  Descripción de la empresa *
                  <textarea
                    required
                    name="companyDescription"
                    rows={3}
                    placeholder="Describe brevemente a qué se dedica tu negocio, tamaño de equipo y qué áreas buscan fortalecer."
                    className={textareaClass}
                  />
                </label>

                <p className="text-xs text-muted-foreground">
                  No se solicitan documentos oficiales ni validación fiscal presencial para comenzar
                  a publicar proyectos.
                </p>

                <Button type="submit" className="mt-1 h-11 w-full rounded-full" disabled={busy}>
                  {busy ? "Creando cuenta empresarial…" : "Crear cuenta de PyME"}
                </Button>
              </form>

              {!needsOnboarding && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>o regístrate con</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={handleGoogleAuth}
                    className="h-11 w-full gap-2 rounded-full"
                  >
                    <GoogleIcon />
                    Continuar con Google
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </SiteChrome>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}
