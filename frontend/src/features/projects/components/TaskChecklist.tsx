import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../lib/api";
import { useTypedSession } from "../../../lib/auth-client";
import type { Task, TradeCategory } from "../../../lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, Plus } from "lucide-react";

const statusLabels: Record<string, string> = {
  todo: "À faire",
  doing: "En cours",
  done: "Terminé",
};

const nextStatus: Record<string, string> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

export default function TaskChecklist({ projectId }: { projectId: string }) {
  const { user } = useTypedSession();
  const isPro = user?.role === "pro";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => api.getProjectTasks(projectId),
  });

  const { data: categories } = useQuery({
    queryKey: ["tradeCategories", user?.tradeId],
    queryFn: () => api.getTradeCategories(user!.tradeId!),
    enabled: isPro && !!user?.tradeId,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createTask({ projectId, title: newTitle, category: newCategory || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setNewTitle("");
      setNewCategory("");
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
      const previous = queryClient.getQueryData<Task[]>(["tasks", projectId]);
      queryClient.setQueryData<Task[]>(["tasks", projectId], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, status } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(["tasks", projectId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onSuccess: () => {},
  });

  const statusOrder: Record<string, number> = { doing: 0, todo: 1, done: 2 };
  const sortedTasks = tasks ? [...tasks].sort((a, b) => (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)) : [];

  const doneCount = tasks?.filter((t) => t.status === "done").length ?? 0;
  const totalCount = tasks?.length ?? 0;

  return (
    <div className="rounded-2xl bg-card p-6 animate-fade-up stagger-1 overflow-hidden min-w-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <ClipboardCheck className="h-4 w-4 text-foreground" />
          </div>
          <h3 className="font-display font-semibold text-sm">Checklist</h3>
          {isPro && (
            <button onClick={() => setOpen(true)} aria-label="Ajouter une tâche" className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {doneCount}/{totalCount}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : (
        <ScrollArea className="max-h-[380px]">
          <div className="space-y-1 pr-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-primary/5 group"
              >
                {isPro ? (
                  <button
                    onClick={() =>
                      updateMutation.mutate({
                        id: task.id,
                        status: nextStatus[task.status] ?? "todo",
                      })
                    }
                    className="shrink-0 transition-transform hover:scale-110 cursor-pointer mt-0.5"
                    title={`Changer en: ${statusLabels[nextStatus[task.status] ?? "todo"]}`}
                  >
                    <CheckIcon status={task.status} />
                  </button>
                ) : (
                  <div className="shrink-0 mt-0.5"><CheckIcon status={task.status} /></div>
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm block truncate transition-colors ${
                      task.status === "done" ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.category && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px] rounded-lg font-normal border-border/80 sm:hidden"
                    >
                      {task.category}
                    </Badge>
                  )}
                </div>
                {task.category && (
                  <Badge
                    variant="outline"
                    className="hidden sm:inline-flex shrink-0 text-[10px] rounded-lg font-normal border-border/80"
                  >
                    {task.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {!isLoading && (!tasks || tasks.length === 0) && (
        <p className="text-muted-foreground text-sm text-center py-10">Aucune tâche</p>
      )}

      {isPro && (
        <>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setNewTitle(""); setNewCategory(""); } }}>
            <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-border/40">
                <DialogTitle className="text-base">Nouvelle tâche</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Ajoutez une tâche à la checklist</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="task-title" className="text-xs font-semibold text-foreground">
                    Nom <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="task-title"
                    autoFocus
                    placeholder="Ex : Poser le carrelage"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newTitle.trim()) createMutation.mutate(); }}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="task-category" className="text-xs font-semibold text-foreground">
                    Catégorie <span className="text-muted-foreground font-normal">(optionnel)</span>
                  </label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger id="task-category">
                      <SelectValue placeholder="Choisir une catégorie..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-11 rounded-xl cursor-pointer"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => { if (newTitle.trim()) createMutation.mutate(); }}
                  disabled={!newTitle.trim() || createMutation.isPending}
                  className="flex-1 h-11 rounded-xl cursor-pointer"
                >
                  {createMutation.isPending ? "Création..." : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function CheckIcon({ status }: { status: string }) {
  if (status === "done") {
    return (
      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center transition-colors">
        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (status === "doing") {
    return <div className="h-5 w-5 rounded-full border-[2.5px] border-primary/50 bg-primary/15 transition-colors" />;
  }
  return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 bg-muted/40 transition-colors" />;
}
