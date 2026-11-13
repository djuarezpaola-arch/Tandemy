import { Link } from "@tanstack/react-router";
import { useTandemyAuth } from "./student-session";

export function useDashboardPath() {
  const { profile } = useTandemyAuth();
  if (!profile) return "/registro";
  return profile.role === "pyme" ? "/panel-pyme" : "/panel-estudiante";
}

/** Header account link: role-aware dashboard when signed in, otherwise login page. */
export function AccountLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { user, profile } = useTandemyAuth();
  if (user && profile) {
    const to = profile.role === "pyme" ? "/panel-pyme" : "/panel-estudiante";
    return (
      <Link to={to} className={className} onClick={onClick}>
        Mi panel
      </Link>
    );
  }
  if (user) {
    return (
      <Link to="/registro" className={className} onClick={onClick}>
        Completar perfil
      </Link>
    );
  }
  return (
    <Link to="/registro" search={{ modo: "login" }} className={className} onClick={onClick}>
      Iniciar sesión
    </Link>
  );
}

export function HeaderAuthControls({
  variant = "header",
  onNavigate,
}: {
  variant?: "header" | "mobile";
  onNavigate?: () => void;
}) {
  const { user, profile } = useTandemyAuth();
  const dashboardTo =
    profile?.role === "pyme"
      ? "/panel-pyme"
      : profile?.role === "student"
        ? "/panel-estudiante"
        : "/registro";

  if (variant === "mobile") {
    if (user) {
      return (
        <Link
          to={dashboardTo}
          onClick={onNavigate}
          className="rounded-lg bg-primary/20 px-3 py-2 font-semibold text-navy-foreground hover:bg-primary"
        >
          {profile ? "Ir a mi panel" : "Completar registro"}
        </Link>
      );
    }
    return (
      <>
        <Link
          to="/registro"
          search={{ modo: "login" }}
          onClick={onNavigate}
          className="rounded-lg px-3 py-2 hover:bg-primary"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/registro"
          onClick={onNavigate}
          className="rounded-lg px-3 py-2 font-semibold text-cyan hover:bg-primary"
        >
          Crear cuenta
        </Link>
      </>
    );
  }

  if (user) {
    return (
      <Link
        to={dashboardTo}
        className="hidden h-8 items-center justify-center rounded-full border border-navy-foreground/40 px-3 text-xs font-medium text-navy-foreground transition hover:bg-navy-foreground/10 sm:inline-flex"
      >
        {profile ? "Mi panel" : "Completar registro"}
      </Link>
    );
  }

  return (
    <>
      <Link
        to="/registro"
        search={{ modo: "login" }}
        className="hidden h-8 items-center justify-center rounded-full px-3 text-xs font-medium text-navy-foreground/90 transition hover:bg-navy-foreground/10 sm:inline-flex"
      >
        Iniciar sesión
      </Link>
      <Link
        to="/registro"
        className="hidden h-8 items-center justify-center rounded-full border border-navy-foreground/40 px-3 text-xs font-medium text-navy-foreground transition hover:bg-navy-foreground/10 sm:inline-flex"
      >
        Registrarse
      </Link>
    </>
  );
}
