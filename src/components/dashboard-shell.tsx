import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, X, ExternalLink, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTandemyAuth } from "./student-session";

export interface DashboardNavItem<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function DashboardShell<T extends string>({
  roleLabel,
  title,
  subtitle,
  navItems,
  activeTab,
  onSelectTab,
  unreadNotifications,
  onOpenNotifications,
  children,
}: {
  roleLabel: string;
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  children: ReactNode;
}) {
  const { user, profile, signOut } = useTandemyAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName =
    profile?.role === "pyme"
      ? profile.companyName || profile.displayName
      : profile?.displayName || user?.email || "Usuario";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  async function handleLogout() {
    await signOut();
    await navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy text-navy-foreground lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-navy-foreground/10 px-5">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            T<span className="text-cyan">andemy</span>
          </Link>
          <span className="rounded-md bg-navy-foreground/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan">
            {roleLabel}
          </span>
        </div>

        <div className="border-b border-navy-foreground/10 p-4">
          <div className="flex items-center gap-3">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={displayName}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-navy-foreground/20"
              />
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initials || "TD"}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy-foreground">{displayName}</p>
              <p className="truncate text-xs text-navy-foreground/65">
                {profile?.role === "pyme"
                  ? profile.businessType || "PyME"
                  : profile?.degree || "Estudiante FCA"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Menú del panel">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-navy-foreground/80 hover:bg-navy-foreground/10 hover:text-navy-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      active ? "bg-navy/30 text-navy-foreground" : "bg-cyan text-cyan-foreground"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1.5 border-t border-navy-foreground/10 p-3">
          <Link
            to="/proyectos"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-navy-foreground/75 transition hover:bg-navy-foreground/10 hover:text-navy-foreground"
          >
            <span>Explorar sitio público</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-navy-foreground/80 transition hover:bg-destructive/20 hover:text-navy-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-lg border p-2 text-foreground lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Ver notificaciones"
              className="relative inline-flex h-9 items-center gap-2 rounded-full border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <Bell className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Notificaciones</span>
              {unreadNotifications > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground tabular-nums">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full sm:inline-flex"
              asChild
            >
              <Link to="/">Inicio</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground lg:hidden"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="border-b bg-navy p-3 text-navy-foreground lg:hidden">
            <nav className="grid gap-1" aria-label="Menú móvil">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                      active ? "bg-primary text-primary-foreground" : "text-navy-foreground/85"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="rounded-full bg-cyan px-2 py-0.5 text-xs font-bold text-cyan-foreground tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="mt-2 flex items-center justify-between border-t border-navy-foreground/15 pt-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-xs text-navy-foreground/80"
                >
                  Ir al sitio público
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan"
                >
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
