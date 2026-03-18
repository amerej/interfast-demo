import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Spinner from "@/components/Spinner";
import ErrorState from "@/components/ErrorState";
import { statusLabels, statusDot } from "@/lib/project-status";
import { useTypedSession } from "../../lib/auth-client";
import { getSocket } from "../../lib/socket";

export default function ProjectsPage() {
  const { user } = useTypedSession();
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    socket.emit("joinClient", user.id);

    const handleProjectUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    };

    socket.on("projectUpdate", handleProjectUpdate);

    return () => {
      socket.emit("leaveClient", user.id);
      socket.off("projectUpdate", handleProjectUpdate);
    };
  }, [user?.id, queryClient]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Erreur lors du chargement des projets" />;

  return (
    <div>
      <div className="mb-10 animate-fade-up">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Mes projets
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Suivez l'avancement de vos chantiers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects?.map((project, i) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className={`group animate-fade-up stagger-${Math.min(i + 1, 8)}`}
          >
            <div className="rounded-2xl bg-card p-8 min-h-[280px] flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-black/6 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-display font-semibold text-base leading-snug group-hover:text-primary transition-colors pr-3">
                  {project.name}
                </h3>
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-full text-[11px] border-border gap-1.5 pl-3 pr-3.5 py-1.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      statusDot[project.status] ?? statusDot.planning
                    }`}
                  />
                  {statusLabels[project.status] ?? project.status}
                </Badge>
              </div>

              {project.proName && (
                <p className="text-xs text-muted-foreground mb-6">
                  {project.proName}{project.tradeName ? ` — ${project.tradeName}` : ""}
                </p>
              )}

              <div className="flex items-end justify-between mb-3">
                <span className="text-4xl font-display font-bold tracking-tight">
                  {project.progress}
                  <span className="text-xl text-muted-foreground/70 font-normal ml-0.5">
                    %
                  </span>
                </span>
              </div>

              <Progress value={project.progress} className="h-2 gap-0" />

              <div className="grid grid-cols-2 gap-4 text-[11px] text-muted-foreground mt-auto pt-5">
                <div>
                  <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block">
                    Début
                  </span>
                  <p className="font-medium mt-1">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString("fr-FR")
                      : "-"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block">
                    Fin estimée
                  </span>
                  <p className="font-medium mt-1">
                    {project.estimatedEndDate
                      ? new Date(project.estimatedEndDate).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-24 text-muted-foreground animate-fade-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
            <svg
              className="h-7 w-7 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <p className="text-base font-display font-semibold">Aucun projet</p>
          <p className="text-sm mt-1">Vos projets apparaîtront ici</p>
        </div>
      )}
    </div>
  );
}
