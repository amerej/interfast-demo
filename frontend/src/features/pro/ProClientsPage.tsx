import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, X, Plus } from "lucide-react";
import { inputClass } from "@/lib/input-class";

export default function ProClientsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ["proClients"],
    queryFn: api.getProClients,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createClient({ name, email }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proClients"] });
      setName("");
      setEmail("");
      setError("");
      setSuccess(`Le client ${data.name} a été créé avec succès.`);
    },
    onError: (err: Error) => setError(err.message || "Erreur lors de la création"),
  });

  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => api.deleteClient(clientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proClients"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Tous les champs sont requis");
      return;
    }
    setError("");
    createMutation.mutate();
  };

  const handleClose = () => {
    setShowForm(false);
    setSuccess("");
    setError("");
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-10 animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Gérez vos clients</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-card p-6 mb-8 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Nouveau client</h2>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-green-500/8 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
              <Button variant="outline" onClick={handleClose} className="rounded-xl cursor-pointer">
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@example.com" className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl cursor-pointer">
                  Annuler
                </Button>
                <Button type="submit" className="rounded-xl cursor-pointer" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Création..." : "Ajouter"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {clients?.map((client) => (
            <div key={client.id} className="rounded-2xl bg-card p-5 flex items-center justify-between animate-fade-up">
              <div>
                <p className="font-medium text-sm">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.email}</p>
              </div>
              <button
                onClick={() => { if (confirm(`Délier ${client.name} ?`)) deleteMutation.mutate(client.id); }}
                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-2 rounded-xl hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {clients?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground animate-fade-up">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
                <svg className="h-7 w-7 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-base font-display font-semibold">Aucun client</p>
              <p className="text-sm mt-1">Ajoutez votre premier client</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
