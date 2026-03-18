import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/Spinner";
import ErrorState from "@/components/ErrorState";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.getUser(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spinner />;
  if (error || !userData) return <ErrorState message="Erreur lors du chargement du profil" />;

  return (
    <div className="max-w-lg mx-auto animate-fade-up">
      <div className="rounded-2xl bg-card p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-primary/4 to-transparent" />

        <div className="flex flex-col items-center text-center relative">
          <Avatar className="h-20 w-20 mb-4 ring-4 ring-background">
            <AvatarFallback className="text-2xl font-display font-bold bg-primary/10 text-primary">
              {userData.name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-display font-bold tracking-tight">
            {userData.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {userData.email}
          </p>
          <Badge
            variant="outline"
            className="mt-3 capitalize rounded-lg border-border"
          >
            {userData.role}
          </Badge>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Membre depuis
          </p>
          <p className="text-sm font-semibold mt-1.5">
            {userData.createdAt
              ? new Date(userData.createdAt).toLocaleDateString("fr-FR")
              : "-"}
          </p>
        </div>

        {userData.projects && userData.projects.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Projets
            </p>
            <div className="space-y-1">
              {userData.projects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-background group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {p.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] rounded-lg border-border/80"
                  >
                    {p.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
