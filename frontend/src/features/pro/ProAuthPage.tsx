import { useNavigate, Navigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession, signIn, signOut } from "../../lib/auth-client";
import type { SessionUser } from "../../lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { inputClass } from "@/lib/input-class";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function ProAuthPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.user) {
    const user = session.user as unknown as SessionUser;
    if (user.role === "pro") {
      return <Navigate to="/pro/projects" replace />;
    }
    return <Navigate to="/projects" replace />;
  }

  const handleLogin = async (data: LoginForm) => {
    setError("");
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });
    if (result.error) {
      setError(result.error.message || "Identifiants invalides");
      return;
    }
    const u = result.data?.user as unknown as SessionUser | undefined;
    if (u?.role !== "pro") {
      await signOut();
      setError("Accès réservé aux professionnels. Utilisez l'espace client.");
      return;
    }
    navigate("/pro/projects");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm font-display">
            IF
          </div>
          <div>
            <span className="text-sm font-display font-bold tracking-tight">
              Interfast
            </span>
            <span className="text-[11px] text-muted-foreground font-medium ml-1.5">
              Pro
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold tracking-tight">
          Espace professionnel
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connectez-vous à votre espace artisan
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive animate-scale-in">
            {error}
          </div>
        )}

        <form
          onSubmit={loginForm.handleSubmit(handleLogin)}
          className="mt-8 space-y-5"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="pro-email"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Email
            </Label>
            <Input
              id="pro-email"
              type="email"
              autoComplete="email"
              placeholder="pro@example.com"
              className={inputClass}
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-destructive text-xs">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="pro-password"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Mot de passe
            </Label>
            <Input
              id="pro-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              className={inputClass}
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-destructive text-xs">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold text-sm tracking-wide cursor-pointer"
            disabled={loginForm.formState.isSubmitting}
          >
            {loginForm.formState.isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/auth"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Vous êtes client ?{" "}
            <span className="font-semibold text-primary">Espace client</span>
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground/50 text-center">
          Demo: pro@example.com / pro123
        </p>
      </div>
    </div>
  );
}
