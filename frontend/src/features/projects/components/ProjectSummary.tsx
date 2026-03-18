import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  ListChecks,
  CalendarDays,
  CalendarCheck,
} from "lucide-react";
import { statusLabels, statusDot } from "@/lib/project-status";
import type { Project } from "@/lib/types";

export default function ProjectSummary({ project }: { project: Project }) {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            {project.name}
          </h1>
          {project.clientName && (
            <p className="text-sm text-muted-foreground mt-1">
              Client: {project.clientName}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className="rounded-full text-xs px-4 py-2 gap-2 pl-3"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              statusDot[project.status] ?? statusDot.planning
            }`}
          />
          {statusLabels[project.status] ?? project.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="rounded-2xl bg-card p-4 sm:p-7 min-h-32.5 sm:min-h-40 flex flex-col animate-fade-up stagger-1">
          <div className="flex items-center justify-between mb-auto">
            <p className="text-xs font-medium text-muted-foreground">
              Progression
            </p>
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-5xl font-display font-extrabold text-primary tracking-tight">
                {project.progress}
              </span>
              <span className="text-2xl font-bold text-primary/30">%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 mt-3 gap-0" />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 sm:p-7 min-h-32.5 sm:min-h-40 flex flex-col animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-auto">
            <p className="text-xs font-medium text-muted-foreground">
              Tâches
            </p>
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <ListChecks className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-display font-extrabold tracking-tight">
              {project.taskStats?.done ?? 0}
            </span>
            <span className="text-2xl font-bold text-muted-foreground/30">
              / {project.taskStats?.total ?? 0}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 sm:p-7 min-h-32.5 sm:min-h-40 flex flex-col animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-auto">
            <p className="text-xs font-medium text-muted-foreground">
              Début
            </p>
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold tracking-tight">
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </p>
          {project.startDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(project.startDate).getFullYear()}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-card p-4 sm:p-7 min-h-32.5 sm:min-h-40 flex flex-col animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-auto">
            <p className="text-xs font-medium text-muted-foreground">
              Fin estimée
            </p>
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold tracking-tight">
            {project.estimatedEndDate
              ? new Date(project.estimatedEndDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </p>
          {project.estimatedEndDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(project.estimatedEndDate).getFullYear()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
