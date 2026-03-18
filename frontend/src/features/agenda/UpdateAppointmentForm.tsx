import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AppointmentData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface Props {
  appointment: AppointmentData;
  onSubmit: (id: string, data: { title: string; description?: string; startDate: string; endDate: string; allDay: boolean }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isPending: boolean;
  isDeleting: boolean;
}

export function UpdateAppointmentForm({ appointment, onSubmit, onDelete, onClose, isPending, isDeleting }: Props) {
  const [title, setTitle] = useState(appointment.title);
  const [description, setDescription] = useState(appointment.description);
  const [startDate, setStartDate] = useState(appointment.startDate);
  const [endDate, setEndDate] = useState(appointment.endDate);

  const canSave = title.trim() && startDate && endDate && !isPending;

  const handleSubmit = () => {
    if (!canSave) return;
    onSubmit(appointment.id, {
      title: title.trim(),
      description: description || undefined,
      startDate: startDate + "T00:00:00",
      endDate: endDate + "T00:00:00",
      allDay: true,
    });
  };

  return (
    <Dialog open onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Titre</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du rendez-vous"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description (optionnel)</Label>
            <Input
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-start">Début</Label>
              <Input
                id="edit-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-end">Fin</Label>
              <Input
                id="edit-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSubmit} disabled={!canSave} className="flex-1">
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(appointment.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
