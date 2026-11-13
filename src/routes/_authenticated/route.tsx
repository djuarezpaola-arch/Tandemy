import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useTandemyAuth } from "@/components/student-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useTandemyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/registro", search: { modo: "login" }, replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-sm text-muted-foreground">
        Verificando sesión…
      </main>
    );
  }

  return <Outlet />;
}
