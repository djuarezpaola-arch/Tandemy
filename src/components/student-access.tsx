import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { findShowcaseProjectByTitle } from "@/lib/tandemy-showcase";
import {
  applyToProject,
  authErrorToSpanish,
  loginWithEmail,
  loginWithGoogle,
  parseSkillsInput,
  registerStudentAccount,
} from "@/lib/tandemy-db";
import {
  APPLICATION_STATUS_LABEL,
  DEGREES,
  formatMxn,
  type ProjectApplication,
} from "@/lib/tandemy-types";
import { useTandemyAuth } from "./student-session";

export function StudentAccess({
  project,
  onDone,
}: {
  project?: string | undefined;
  onDone?: () => void;
}) {
  const { user, profile, loading, signOut } = useTandemyAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const matchedProject = findShowcaseProjectByTitle(project);
  const [proposedAmount, setProposedAmount] = useState("");
  const [proposedDuration, setProposedDuration] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [existingApp, setExistingApp] = useState<ProjectApplication | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [applySuccess, setApplySuccess] = useState("");

  useEffect(() => {
    if (!matchedProject) return;
    setProposedAmount(String(matchedProject.budget));
    setProposedDuration(matchedProject.duration);
    setCoverLetter("");
    setApplySuccess("");
    setError("");
  }, [matchedProject]);

  useEffect(() => {
    if (!user || profile?.role !== "student" || !matchedProject) {
      setExistingApp(null);
      return;
    }
    let active = true;
    setCheckingExisting(true);
    getDoc(doc(db, "applications", `${matchedProject.id}_${user.uid}`))
      .then((snap) => {
        if (!active) return;
        setExistingApp(
          snap.exists()
            ? { id: snap.id, ...(snap.data() as Omit<ProjectApplication, "id">) }
            : null,
        );
      })
      .catch(() => {
        if (active) setExistingApp(null);
      })
      .finally(() => {
        if (active) setCheckingExisting(false);
      });
    return () => {
      active = false;
    };
  }, [user, profile?.role, matchedProject]);

  async function handleProposalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matchedProject || !profile || profile.role !== "student") return;
    setBusy(true);
    setError("");
    setApplySuccess("");
    try {
      await applyToProject({
        project: matchedProject,
        studentProfile: profile,
        proposedAmount: Number(proposedAmount) || matchedProject.budget,
        proposedDuration: proposedDuration || matchedProject.duration,
        coverLetter,
      });
      setApplySuccess(
        `¡Postulación enviada a ${matchedProject.companyName}! Ya puedes darle seguimiento en "Mis postulaciones".`,
      );
      setExistingApp({
        id: `${matchedProject.id}_${profile.uid}`,
        projectId: matchedProject.id,
        projectTitle: matchedProject.title,
        pymeId: matchedProject.ownerId,
        companyName: matchedProject.companyName,
        studentId: profile.uid,
        studentName: profile.displayName,
        studentDegree: profile.degree ?? "",
        studentSemester: profile.semester ?? "",
        studentSkills: profile.skills ?? [],
        proposedAmount: Number(proposedAmount) || matchedProject.budget,
        proposedDuration: proposedDuration || matchedProject.duration,
        coverLetter: coverLetter.trim(),
        status: "pending",
      });
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        setMessage("Enviamos un enlace para restablecer tu contraseña a tu correo.");
      } else if (mode === "signup") {
        await registerStudentAccount({
          email,
          password,
          displayName: String(form.get("display_name") ?? ""),
          studentNumber: String(form.get("student_number") ?? ""),
          degree: String(form.get("degree") ?? ""),
          semester: String(form.get("semester") ?? ""),
          university: "Universidad Autónoma de Chihuahua (FCA)",
          bio: String(form.get("bio") ?? ""),
          skills: parseSkillsInput(String(form.get("skills") ?? "")),
          experience: String(form.get("experience") ?? ""),
        });
        setMessage("Cuenta creada exitosamente.");
        if (!matchedProject) {
          onDone?.();
          await navigate({ to: "/panel-estudiante" });
        }
      } else {
        const result = await loginWithEmail(email, password);
        setMessage("Sesión iniciada.");
        if (!matchedProject || result.profile?.role !== "student") {
          onDone?.();
          if (result.profile?.role === "pyme") {
            await navigate({ to: "/panel-pyme" });
          } else if (result.profile?.role === "student") {
            await navigate({ to: "/panel-estudiante" });
          } else {
            await navigate({ to: "/registro" });
          }
        }
      }
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      const res = await loginWithGoogle();
      if (res.needsOnboarding) {
        onDone?.();
        await navigate({ to: "/registro", search: { tipo: "estudiante" } });
      } else if (res.profile?.role === "pyme") {
        onDone?.();
        await navigate({ to: "/panel-pyme" });
      } else if (!matchedProject) {
        onDone?.();
        await navigate({ to: "/panel-estudiante" });
      }
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    onDone?.();
    await navigate({ to: "/", replace: true });
  }

  const fieldClass =
    "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";

  if (user && loading) {
    return <p className="py-4 text-sm text-muted-foreground">Cargando datos de tu cuenta…</p>;
  }

  if (user) {
    if (!profile) {
      return (
        <div className="space-y-4">
          <p className="font-semibold text-foreground">Completa tu perfil de estudiante</p>
          <p className="text-sm text-muted-foreground">
            Tu cuenta ({user.email}) aún no tiene registrado tu perfil académico (carrera, matrícula
            y semestre). Complétalo para poder postularte a proyectos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild onClick={() => onDone?.()}>
              <Link to="/registro" search={{ tipo: "estudiante" }}>
                Completar mi registro de estudiante
              </Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      );
    }

    if (profile.role === "pyme") {
      return (
        <div className="space-y-4">
          <p className="font-semibold">Sesión iniciada como PyME</p>
          <p className="text-sm text-muted-foreground">
            {profile.companyName || profile.displayName || user.email}. Solo las cuentas de
            estudiante pueden postularse a proyectos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild onClick={() => onDone?.()}>
              <Link to="/panel-pyme">Ir a mi panel de PyME</Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      );
    }

    if (matchedProject) {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border bg-secondary/40 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {matchedProject.area} · {matchedProject.companyName}
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{matchedProject.title}</p>
            <p className="mt-1 text-muted-foreground">{matchedProject.description}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-foreground">
              <span>Presupuesto: {formatMxn(matchedProject.budget)}</span>
              <span>Plazo: {matchedProject.duration}</span>
              <span>Fecha límite: {matchedProject.deadline}</span>
            </div>
          </div>

          {checkingExisting ? (
            <p className="text-sm text-muted-foreground">Verificando estado de tu postulación…</p>
          ) : applySuccess ? (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">{applySuccess}</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" onClick={() => onDone?.()}>
                  <Link to="/panel-estudiante">Ir a mi panel de estudiante</Link>
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => onDone?.()}>
                  Seguir explorando
                </Button>
              </div>
            </div>
          ) : existingApp ? (
            <div className="space-y-3 rounded-xl border border-primary/30 bg-accent/50 p-4 text-sm">
              <p className="font-semibold text-foreground">
                Ya te postulaste a este proyecto ({APPLICATION_STATUS_LABEL[existingApp.status]})
              </p>
              <p className="text-xs text-muted-foreground">
                Propuesta enviada: {formatMxn(existingApp.proposedAmount)} ·{" "}
                {existingApp.proposedDuration}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" onClick={() => onDone?.()}>
                  <Link to="/panel-estudiante">Ver en Mis postulaciones</Link>
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => onDone?.()}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleProposalSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">
                  Monto propuesto (MXN)
                  <input
                    required
                    type="number"
                    min={100}
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-xs font-medium">
                  Plazo de entrega propuesto
                  <input
                    required
                    value={proposedDuration}
                    onChange={(e) => setProposedDuration(e.target.value)}
                    placeholder="Ej. 10 días"
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="block text-xs font-medium">
                Mensaje / propuesta para {matchedProject.companyName}
                <textarea
                  required
                  minLength={5}
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Cuéntale a la empresa cómo abordarás el proyecto y tu experiencia relacionada…"
                  className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm text-foreground"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onDone?.()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy} className="rounded-full px-6">
                  {busy ? "Enviando…" : "Enviar postulación"}
                </Button>
              </div>
            </form>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="font-semibold">Sesión iniciada como estudiante</p>
        <p className="break-all text-sm text-muted-foreground">
          {profile.displayName || user.email}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild onClick={() => onDone?.()}>
            <Link to="/panel-estudiante">Ir a mi panel</Link>
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {project && <p className="text-sm font-medium text-foreground">{project}</p>}
      <div className="grid grid-cols-2 gap-2" aria-label="Acceso de estudiantes">
        <Button
          type="button"
          variant={mode === "login" ? "default" : "outline"}
          onClick={() => {
            setMode("login");
            setMessage("");
            setError("");
          }}
        >
          Iniciar sesión
        </Button>
        <Button
          type="button"
          variant={mode === "signup" ? "default" : "outline"}
          onClick={() => {
            setMode("signup");
            setMessage("");
            setError("");
          }}
        >
          Registrarme
        </Button>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        {mode === "signup" && (
          <>
            <label className="block text-sm font-medium">
              Nombre completo
              <input required name="display_name" autoComplete="name" className={fieldClass} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Matrícula
                <input
                  required
                  name="student_number"
                  placeholder="Ej. 358910"
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm font-medium">
                Semestre
                <input
                  required
                  name="semester"
                  placeholder="Ej. 7° semestre"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Carrera
              <select required name="degree" className={fieldClass} defaultValue="">
                <option value="" disabled>
                  Selecciona tu carrera
                </option>
                {DEGREES.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Habilidades (separadas por coma)
              <input
                name="skills"
                placeholder="Excel, Costos, Power BI, Canva"
                className={fieldClass}
              />
            </label>
          </>
        )}
        <label className="block text-sm font-medium">
          {mode === "signup" ? "Correo electrónico institucional UACH" : "Correo electrónico"}
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ejemplo@uach.mx"
            className={fieldClass}
          />
          {mode === "signup" && (
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Modo demostración: puedes usar cualquier correo electrónico válido sin código de
              confirmación.
            </span>
          )}
        </label>
        {mode !== "forgot" && (
          <label className="block text-sm font-medium">
            Contraseña
            <input
              required
              type="password"
              name="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              className={fieldClass}
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-foreground">
            {message}
          </p>
        )}
        <Button className="w-full" type="submit" disabled={busy}>
          {busy
            ? "Espera…"
            : mode === "signup"
              ? "Crear cuenta de estudiante"
              : mode === "forgot"
                ? "Enviar enlace de recuperación"
                : matchedProject
                  ? "Entrar y postularme"
                  : "Entrar a mi panel"}
        </Button>
      </form>
      {mode === "login" && (
        <div className="flex items-center justify-between text-xs">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => {
              setMode("forgot");
              setMessage("");
              setError("");
            }}
          >
            Olvidé mi contraseña
          </Button>
          <Link
            to="/registro"
            onClick={() => onDone?.()}
            className="font-medium text-primary hover:underline"
          >
            ¿Eres PyME? Regístrate aquí
          </Link>
        </div>
      )}
      {mode !== "forgot" && (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          className="h-10 w-full gap-2"
          onClick={handleGoogle}
        >
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
          Continuar con Google
        </Button>
      )}
    </div>
  );
}
