import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTypedSession, signOut } from "../lib/auth-client";
import { useTheme } from "@/hooks/use-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FolderKanban, Users, LogOut, CalendarDays } from "lucide-react";

const navItems = [
  { to: "/pro/projects", label: "Projets", icon: FolderKanban },
  { to: "/pro/clients", label: "Clients", icon: Users },
  { to: "/pro/agenda", label: "Agenda", icon: CalendarDays },
];

function ThemeIcon({ theme }: { theme: string }) {
  return theme === "light" ? (
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
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  ) : (
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
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  const { user } = useTypedSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/pro/auth");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex w-64 border-r border-border/40 bg-card flex-col shrink-0">
          <div className="p-6 border-b border-border/40">
            <Link to="/pro/projects" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs font-display transition-transform group-hover:scale-105">
                IF
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-display font-bold tracking-tight">
                    Interfast
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Pro
                  </span>
                </div>
                {user && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-35">
                    {user.name}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border/40 space-y-1">
            <button
              onClick={toggle}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full cursor-pointer"
            >
              <ThemeIcon theme={theme} />
              {theme === "light" ? "Mode sombre" : "Mode clair"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
          {/* Mobile header */}
          <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-card/80 backdrop-blur-xl border-b border-border/40">
            <Link to="/pro/projects" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs font-display">
                IF
              </div>
              <span className="text-sm font-display font-bold tracking-tight">
                Interfast Pro
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={toggle}
                aria-label={
                  theme === "light"
                    ? "Activer le mode sombre"
                    : "Activer le mode clair"
                }
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ThemeIcon theme={theme} />
              </button>
              <button
                onClick={handleLogout}
                aria-label="Se déconnecter"
                className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto pb-24 lg:pb-8">
            <div className="mx-auto max-w-300 min-w-0">{children}</div>
          </main>

          {/* Bottom nav — mobile only */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-card border-t border-border/40">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${active ? "text-primary" : ""}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
