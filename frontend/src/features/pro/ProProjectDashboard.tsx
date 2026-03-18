import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import Spinner from "@/components/Spinner";
import ErrorState from "@/components/ErrorState";
import ProjectSummary from "../projects/components/ProjectSummary";
import ProgressCharts from "../projects/components/ProgressCharts";
import TaskChecklist from "../projects/components/TaskChecklist";
import ActivityFeed from "../projects/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, ChevronLeft } from "lucide-react";

export default function ProProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => api.getProject(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; status?: string }) => api.updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteProject(id!),
    onSuccess: () => navigate("/pro/projects"),
  });

  if (isLoading) return <Spinner />;
  if (error || !project) return <ErrorState message="Erreur lors du chargement du projet" />;

  const openEdit = () => {
    setEditName(project.name);
    setEditStatus(project.status);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full text-muted-foreground">
          <Link to="/pro/projects">
            <ChevronLeft className="h-4 w-4" />
            Projets
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit} className="rounded-xl gap-1.5 cursor-pointer">
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Supprimer le projet"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ProjectSummary project={project} />
      <ProgressCharts project={project} projectId={id!} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TaskChecklist projectId={id!} />
        <ActivityFeed projectId={id!} />
      </div>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) updateMutation.reset(); }}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
          <div className="px-6 pt-6 pb-4 border-b border-border/40">
            <DialogTitle className="text-base">Modifier le projet</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Modifiez le nom ou le statut du projet</p>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-xs font-semibold text-foreground">
                Nom du projet <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-name"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && editName.trim()) updateMutation.mutate({ name: editName, status: editStatus }); }}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-status" className="text-xs font-semibold text-foreground">Statut</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planification</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              onClick={() => updateMutation.mutate({ name: editName, status: editStatus })}
              disabled={!editName.trim() || updateMutation.isPending}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
          <div className="px-6 pt-6 pb-4 border-b border-border/40">
            <DialogTitle className="text-base">Supprimer le projet</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Cette action est irréversible</p>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer le projet <span className="font-medium text-foreground">{project.name}</span> ? Toutes les données associées seront définitivement perdues.
            </p>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 h-11 rounded-xl cursor-pointer"
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
