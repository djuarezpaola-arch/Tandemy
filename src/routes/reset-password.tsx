import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { authErrorToSpanish } from "@/lib/tandemy-db";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña · Tandemy" },
      { name: "description", content: "Restablece la contraseña de tu cuenta en Tandemy." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Enviamos un correo con el enlace para restablecer tu contraseña.");
    } catch (err) {
      setError(authErrorToSpanish(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
        T<span className="text-primary">andemy</span>
      </Link>
      <h1 className="mt-6 text-2xl font-bold">Restablecer contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ingresa el correo con el que te registraste y te enviaremos instrucciones para crear una
        nueva contraseña.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Correo electrónico
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu-correo@ejemplo.com"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm font-medium text-primary">
            {message}
          </p>
        )}
        <Button disabled={busy} type="submit" className="w-full rounded-full">
          {busy ? "Enviando…" : "Enviar enlace de recuperación"}
        </Button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/registro" search={{ modo: "login" }} className="text-primary hover:underline">
          Volver a Iniciar sesión
        </Link>
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
