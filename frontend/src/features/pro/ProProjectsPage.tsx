import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import Spinner from "@/components/Spinner";
import ErrorState from "@/components/ErrorState";
import { statusLabels, statusDot } from "@/lib/project-status";

export default function ProProjectsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("planning");
  const [startDate, setStartDate] = useState("");
  const [estimatedEndDate, setEstimatedEndDate] = useState("");
  const [formError, setFormError] = useState("");

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ["proClients"],
    queryFn: api.getProClients,
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createProject({
        name,
        clientId,
        status,
        startDate: startDate || undefined,
        estimatedEndDate: estimatedEndDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
    },
    onError: (err: Error) =>
      setFormError(err.message || "Erreur lors de la création"),
  });

  const resetForm = () => {
    setOpen(false);
    setName("");
    setClientId("");
    setStatus("planning");
    setStartDate("");
    setEstimatedEndDate("");
    setFormError("");
  };

  const handleCreate = () => {
    if (!name || !clientId) {
      setFormError("Nom et client sont requis");
      return;
    }
    setFormError("");
    createMutation.mutate();
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Erreur lors du chargement des projets" />;

  const grouped = (projects ?? []).reduce<Record<string, NonNullable<typeof projects>>>((acc, p) => {
    const key = p.clientName || "Sans client";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-10 animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Gérez vos projets par client
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-xl gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-24 text-muted-foreground animate-fade-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
            <svg className="h-7 w-7 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <p className="text-base font-display font-semibold">Aucun projet</p>
          <p className="text-sm mt-1">Créez votre premier projet pour commencer</p>
        </div>
      )}

      {Object.entries(grouped).map(([clientName, clientProjects]) => (
        <div key={clientName} className="mb-10 animate-fade-up">
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {clientName}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clientProjects.map((project) => (
              <Link key={project.id} to={`/pro/projects/${project.id}`} className="group">
                <div className="rounded-2xl bg-card p-6 min-h-[220px] flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-black/6 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-display font-semibold text-sm leading-snug group-hover:text-primary transition-colors pr-3">
                      {project.name}
                    </h3>
                    <Badge variant="outline" className="shrink-0 rounded-full text-[11px] border-border gap-1.5 pl-3 pr-3.5 py-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusDot[project.status] ?? statusDot.planning}`} />
                      {statusLabels[project.status] ?? project.status}
                    </Badge>
                  </div>

                  <div className="flex items-end justify-between mb-3 mt-auto">
                    <span className="text-3xl font-display font-bold tracking-tight">
                      {project.progress}<span className="text-lg text-muted-foreground/70 font-normal ml-0.5">%</span>
                    </span>
                  </div>

                  <Progress value={project.progress} className="h-1.5 gap-0" />

                  <div className="grid grid-cols-2 gap-4 text-[11px] text-muted-foreground mt-4">
                    <div>
                      <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block">Début</span>
                      <p className="font-medium mt-0.5">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString("fr-FR") : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block">Fin estimée</span>
                      <p className="font-medium mt-0.5">
                        {project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString("fr-FR") : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Create project modal */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
          <div className="px-6 pt-6 pb-4 border-b border-border/40">
            <DialogTitle className="text-base">Nouveau projet</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Créez un projet pour un de vos clients</p>
          </div>

          <div className="px-6 py-5 space-y-5">
            {formError && (
              <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="new-client" className="text-xs font-semibold text-foreground">
                Client <span className="text-destructive">*</span>
              </label>
              {loadingClients ? (
                <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="new-client">
                    <SelectValue placeholder="Sélectionnez un client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="new-name" className="text-xs font-semibold text-foreground">
                Nom du projet <span className="text-destructive">*</span>
              </label>
              <Input
                id="new-name"
                autoFocus
                placeholder="Rénovation salle de bain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && clientId) handleCreate(); }}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-status" className="text-xs font-semibold text-foreground">Statut</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="new-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planification</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="new-start" className="text-xs font-semibold text-foreground">
                  Date de début
                </label>
                <Input
                  id="new-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-end" className="text-xs font-semibold text-foreground">
                  Fin estimée
                </label>
                <Input
                  id="new-end"
                  type="date"
                  value={estimatedEndDate}
                  onChange={(e) => setEstimatedEndDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || !clientId || createMutation.isPending}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              {createMutation.isPending ? "Création..." : "Créer le projet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
