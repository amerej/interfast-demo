import { useNavigate, Navigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession, signIn } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AuthPage() {
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

  if (session) return <Navigate to="/projects" replace />;

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
    navigate("/projects");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[380px] animate-fade-up relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#e16349] to-[#ea7e66] text-white font-bold text-lg font-display mb-8 shadow-[0_8px_16px_-6px_rgba(225,99,73,0.4)] ring-1 ring-white/20">
            IF
          </div>

          <h1 className="text-[26px] font-display font-bold tracking-tight text-zinc-900">
            Bon retour
          </h1>
          <p className="mt-2 text-[14px] text-zinc-500">
            Connectez-vous à votre espace projet.
          </p>

          {error && (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-destructive/5 border border-destructive/15 px-4 py-3 animate-scale-in">
              <svg
                className="w-4 h-4 text-destructive shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-[13px] font-medium text-destructive">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="mt-7 space-y-4"
          >
            <div className="space-y-1.5 animate-fade-up stagger-1">
              <Label
                htmlFor="login-email"
                className="text-[13px] font-medium text-zinc-700"
              >
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:border-primary/40 transition-all duration-200 focus:ring-4 focus:ring-primary/10 hover:border-zinc-300 px-4"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-destructive text-xs">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 animate-fade-up stagger-2">
              <Label
                htmlFor="login-password"
                className="text-[13px] font-medium text-zinc-700"
              >
                Mot de passe
              </Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:border-primary/40 transition-all duration-200 focus:ring-4 focus:ring-primary/10 hover:border-zinc-300 px-4"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-destructive text-xs">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="pt-2 animate-fade-up stagger-3">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold text-[14px] bg-linear-to-r from-[#e16349] to-[#ea7e66] hover:from-[#d15339] hover:to-[#e16349] text-white shadow-lg shadow-primary/25 border-0 hover:shadow-primary/40 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/pro/auth"
              className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-zinc-100/50 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-200"
            >
              Vous êtes artisan ?{" "}
              <span className="font-semibold text-primary ml-1">
                Espace professionnel
              </span>
            </Link>
          </div>

          <p className="mt-8 text-[11px] text-zinc-400 text-center font-mono">
            Demo : client@example.com / client123
          </p>
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden rounded-l-[40px] m-3 mr-0 order-first"
        style={{
          background:
            "linear-gradient(145deg, #e16349 0%, #c9533d 50%, #b8442f 100%)",
        }}
      >
        <div className="absolute inset-0 noise-texture" />

        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/6 blur-[2px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-black/8 blur-[2px]" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-medium text-white/80 tracking-wide">
                240+ projets suivis en temps réel
              </span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="animate-fade-up stagger-2">
              <h2 className="text-[clamp(2.2rem,4.5vw,3.8rem)] font-display font-extrabold text-white leading-[1.05] tracking-tight">
                Pilotez vos
                <br />
                chantiers avec
                <br />
                clarté.
              </h2>
              <p className="mt-5 text-[15px] text-white leading-relaxed max-w-md">
                Suivi d'avancement, gestion des tâches et collaboration en temps
                réel sur tous vos projets de construction.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg animate-fade-up stagger-4">
              {[
                { value: "98%", label: "Satisfaction" },
                { value: "2x", label: "Plus rapide" },
                { value: "24/7", label: "Temps réel" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/10 backdrop-blur-sm p-4"
                >
                  <p className="text-2xl font-display font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 animate-fade-up stagger-6">
            <div className="flex -space-x-2.5">
              {["bg-white", "bg-white/90", "bg-white/80", "bg-white/70"].map(
                (bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${bg} ring-2 ring-[#e16349] flex items-center justify-center`}
                  >
                    <span className="text-[10px] font-bold text-[#e16349]">
                      {["M", "A", "S", "L"][i]}
                    </span>
                  </div>
                ),
              )}
            </div>
            <div>
              <p className="text-[13px] font-medium text-white/90">
                +240 professionnels
              </p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-3 h-3 text-white/80"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[11px] text-white/50 ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
