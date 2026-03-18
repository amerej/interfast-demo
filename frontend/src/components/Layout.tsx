import { Link, useNavigate } from "react-router-dom";
import { useTypedSession, signOut } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import NotificationBell from "@/components/NotificationBell";
import { CalendarDays } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useTypedSession();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
            <Link to="/projects" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs font-display transition-transform group-hover:scale-105">
                IF
              </div>
              <div className="hidden sm:flex items-baseline gap-1.5">
                <span className="text-sm font-display font-bold tracking-tight">
                  Interfast
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild className="rounded-xl px-2 text-muted-foreground hover:text-foreground">
                <Link to="/agenda" aria-label="Agenda">
                  <CalendarDays className="h-4 w-4" />
                </Link>
              </Button>
              <NotificationBell />
              <button
                onClick={toggle}
                className="relative h-7 w-12 rounded-full bg-muted transition-colors hover:bg-muted/80 p-0.5 cursor-pointer"
                aria-label="Toggle theme"
              >
                <div
                  className={`h-6 w-6 rounded-full bg-background shadow-sm transition-all duration-300 flex items-center justify-center ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {theme === "light" ? (
                    <svg
                      className="h-3.5 w-3.5 text-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-3.5 w-3.5 text-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                      />
                    </svg>
                  )}
                </div>
              </button>

              {user && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-2.5 rounded-xl px-3 hover:bg-card transition-colors"
                  >
                    <Link to={`/user/${user.id}`}>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                          {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5 capitalize">
                          {user.role || "client"}
                        </span>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label="Se déconnecter"
                    className="text-muted-foreground rounded-xl hover:bg-card hover:text-foreground transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      </div>
    </TooltipProvider>
  );
}
