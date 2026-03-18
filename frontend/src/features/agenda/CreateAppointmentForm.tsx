import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export interface CreateFormData {
  startDate: string;
  endDate: string;
}

interface Props {
  initial: CreateFormData;
  onSubmit: (data: { title: string; description?: string; startDate: string; endDate: string; allDay: boolean; clientId: string }) => void;
  onClose: () => void;
  isPending: boolean;
}

export function CreateAppointmentForm({ initial, onSubmit, onClose, isPending }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [clientId, setClientId] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["pro-clients"],
    queryFn: api.getProClients,
  });

  const canSave = title.trim() && startDate && endDate && clientId && !isPending;

  const handleSubmit = () => {
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      description: description || undefined,
      startDate: startDate + "T00:00:00",
      endDate: endDate + "T00:00:00",
      allDay: true,
      clientId,
    });
  };

  return (
    <Dialog open onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="create-client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="create-client">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-title">Titre</Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du rendez-vous"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-desc">Description (optionnel)</Label>
            <Input
              id="create-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-start">Début</Label>
              <Input
                id="create-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-end">Fin</Label>
              <Input
                id="create-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSubmit} disabled={!canSave} className="flex-1">
              {isPending ? "Enregistrement..." : "Créer"}
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
