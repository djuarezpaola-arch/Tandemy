import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTandemyAuth } from "@/components/student-session";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta · Tandemy" },
      { name: "description", content: "Redirigiendo a tu panel en Tandemy." },
    ],
  }),
  component: CuentaRedirect,
});

function CuentaRedirect() {
  const { profile, loading, needsOnboarding } = useTandemyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (needsOnboarding || !profile) {
      void navigate({ to: "/registro", replace: true });
    } else if (profile.role === "pyme") {
      void navigate({ to: "/panel-pyme", replace: true });
    } else {
      void navigate({ to: "/panel-estudiante", replace: true });
    }
  }, [loading, needsOnboarding, profile, navigate]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-sm text-muted-foreground">
      Cargando tu panel…
    </main>
  );
}
