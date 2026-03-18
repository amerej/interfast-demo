import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../lib/api";
import { useTypedSession } from "../../../lib/auth-client";
import { getSocket } from "../../../lib/socket";
import type { Attachment } from "../../../lib/types";
import CommentSection from "./CommentSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Activity, Plus, Paperclip, X } from "lucide-react";

function ActivityAttachments({ activityId }: { activityId: string }) {
  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", activityId],
    queryFn: () => api.getActivityAttachments(activityId),
  });

  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((a) => {
        const isImage = a.mimeType.startsWith("image/");
        const url = `/backend/uploads/${a.filename}`;
        return isImage ? (
          <a key={a.id} href={url} target="_blank" rel="noopener noreferrer">
            <img
              src={url}
              alt={a.originalName}
              className="h-16 w-16 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity"
            />
          </a>
        ) : (
          <a
            key={a.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <Paperclip className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-32 truncate">{a.originalName}</span>
          </a>
        );
      })}
    </div>
  );
}

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const { user } = useTypedSession();
  const isPro = user?.role === "pro";
  const queryClient = useQueryClient();
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const oversized = Array.from(files).find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setFileError(`"${oversized.name}" dépasse la limite de 5 Mo`);
      e.target.value = "";
      return;
    }
    setFileError(null);
    setPendingFiles(files);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const activity = await api.createActivity({ projectId, message: newMessage });
      if (pendingFiles?.length) {
        await api.uploadAttachments(activity.id, pendingFiles);
      }
      return activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      setNewMessage("");
      setPendingFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);
    },
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", projectId],
    queryFn: () => api.getProjectActivities(projectId),
  });

  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinProject", projectId);
    socket.on("newActivity", () =>
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] }),
    );
    socket.on("newComment", () =>
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] }),
    );
    socket.on("taskUpdate", () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    });
    return () => {
      socket.emit("leaveProject", projectId);
      socket.off("newActivity");
      socket.off("newComment");
      socket.off("taskUpdate");
    };
  }, [projectId, queryClient]);

  return (
    <div className="rounded-2xl bg-card p-6 animate-fade-up stagger-2 overflow-hidden min-w-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Activity className="h-4 w-4 text-foreground" />
          </div>
          <h3 className="font-display font-semibold text-sm">Activité</h3>
          {isPro && (
            <button
              onClick={() => setOpen(true)}
              aria-label="Ajouter une activité"
              className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {activities?.length ?? 0}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : (
        <ScrollArea className="max-h-[380px]">
          <div className="space-y-0.5 pr-3">
            {activities?.map((activity) => {
              const isExpanded = expandedActivity === activity.id;
              return (
                <div key={activity.id} className="rounded-xl px-4 py-3 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-muted-foreground/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {activity.userName ?? "Système"}
                        </span>
                        <span className="text-[11px] text-muted-foreground/40">
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleString("fr-FR")
                            : ""}
                        </span>
                      </div>
                      <ActivityAttachments activityId={activity.id} />
                      <button
                        onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                        className="text-[11px] font-medium text-primary hover:text-primary/80 mt-1.5 transition-colors cursor-pointer"
                      >
                        {isExpanded ? "Masquer" : "Commentaires"}
                      </button>
                      {isExpanded && (
                        <CommentSection activityId={activity.id} projectId={projectId} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {!isLoading && (!activities || activities.length === 0) && (
        <p className="text-muted-foreground text-sm text-center py-10">Aucune activité</p>
      )}

      {isPro && (
        <Dialog open={open} onOpenChange={(v: boolean) => { setOpen(v); if (!v) { setNewMessage(""); setPendingFiles(null); setFileError(null); } }}>
          <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
            <div className="px-6 pt-6 pb-4 border-b border-border/40">
              <DialogTitle className="text-base">Nouvelle activité</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Ajoutez une note au fil d'activité</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <label htmlFor="activity-message" className="text-xs font-semibold text-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <Input
                  id="activity-message"
                  autoFocus
                  placeholder="Ex : Réunion client effectuée"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newMessage.trim()) createMutation.mutate(); }}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5" />
                  Photos / Documents
                </label>
                <label className={`flex items-center gap-2 cursor-pointer rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors ${fileError ? "border-destructive" : "border-border"}`}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {pendingFiles?.length
                    ? `${pendingFiles.length} fichier(s) sélectionné(s)`
                    : "Cliquer pour sélectionner…"}
                </label>
                {fileError && (
                  <p className="text-[11px] text-destructive">{fileError}</p>
                )}
                {!fileError && (
                  <p className="text-[11px] text-muted-foreground">Images ou PDF · max 5 Mo par fichier</p>
                )}
                {pendingFiles?.length ? (
                  <button
                    onClick={() => { setPendingFiles(null); setFileError(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <X className="h-3 w-3" /> Retirer les fichiers
                  </button>
                ) : null}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 h-11 rounded-xl cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                onClick={() => { if (newMessage.trim()) createMutation.mutate(); }}
                disabled={!newMessage.trim() || createMutation.isPending}
                className="flex-1 h-11 rounded-xl cursor-pointer"
              >
                {createMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
