import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer, View, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { api } from "@/lib/api";
import { useTypedSession } from "@/lib/auth-client";
import { getSocket } from "@/lib/socket";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CreateAppointmentForm, CreateFormData } from "./CreateAppointmentForm";
import { UpdateAppointmentForm, AppointmentData } from "./UpdateAppointmentForm";

// --- Constants ---

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
});

const messages = {
  allDay: "Journée",
  previous: "Précédent",
  next: "Suivant",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Liste",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement dans cette période",
};

const VIEWS: View[] = ["month", "week", "day", "agenda"];

const PROJECT_STYLE = {
  style: {
    backgroundColor: "var(--agenda-project-bg)",
    color: "var(--agenda-project)",
    borderLeft: "3px solid var(--agenda-project)",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500 as const,
    padding: "2px 8px",
    border: "none",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid" as const,
    borderLeftColor: "var(--agenda-project)",
  },
};

const APPOINTMENT_STYLE = {
  style: {
    backgroundColor: "var(--agenda-appointment-bg)",
    color: "var(--agenda-appointment)",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500 as const,
    padding: "2px 8px",
    border: "none",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid" as const,
    borderLeftColor: "var(--agenda-appointment)",
  },
};

// --- Types ---

// --- Helpers ---

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}


// --- Components ---

function Legend() {
  return (
    <div className="flex items-center gap-5 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm bg-agenda-project-bg border-l-[3px] border-agenda-project" />
        <span className="font-medium">Projets</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm bg-agenda-appointment-bg border-l-[3px] border-agenda-appointment" />
        <span className="font-medium">Rendez-vous</span>
      </span>
    </div>
  );
}

// --- Main Page ---

export default function AgendaPage() {
  const { user } = useTypedSession();
  const isPro = user?.role === "pro";
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(() => new Date());

  const [createData, setCreateData] = useState<CreateFormData | null>(null);
  const [editData, setEditData] = useState<AppointmentData | null>(null);

  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.getProjects });
  const { data: appointments = [] } = useQuery({ queryKey: ["appointments"], queryFn: api.getAppointments });

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    socket.emit("joinClient", user.id);

    const handleAppointmentUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    };

    socket.on("appointmentUpdate", handleAppointmentUpdate);

    return () => {
      socket.emit("leaveClient", user.id);
      socket.off("appointmentUpdate", handleAppointmentUpdate);
    };
  }, [user?.id, queryClient]);

  const invalidate = { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }) };

  const createMutation = useMutation({ mutationFn: api.createAppointment, ...invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateAppointment>[1] }) =>
      api.updateAppointment(id, data),
    ...invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: api.deleteAppointment, ...invalidate });

  interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: { type: "project" } | { type: "appointment"; id: string };
  }

  const events = useMemo(() => {
    const result: CalendarEvent[] = [];

    for (const p of projects) {
      if (p.startDate || p.estimatedEndDate) {
        result.push({
          id: `project-${p.id}`,
          title: p.name,
          start: new Date((p.startDate ?? p.estimatedEndDate)!),
          end: new Date((p.estimatedEndDate ?? p.startDate)!),
          allDay: true,
          resource: { type: "project" },
        });
      }
    }

    for (const a of appointments) {
      result.push({
        id: `appt-${a.id}`,
        title: a.title,
        start: new Date(a.startDate),
        end: new Date(a.endDate),
        allDay: a.allDay,
        resource: { type: "appointment", id: a.id },
      });
    }

    return result;
  }, [projects, appointments]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return event.resource?.type === "project" ? PROJECT_STYLE : APPOINTMENT_STYLE;
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    if (!isPro) return;
    const { start } = slotInfo;
    const dateStr = toDateStr(start);
    setEditData(null);
    setCreateData({ startDate: dateStr, endDate: dateStr });
  }, [isPro]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (!isPro || event.resource?.type !== "appointment") return;
    const appt = appointments.find((a) => a.id === (event.resource as { type: "appointment"; id: string }).id);
    if (!appt) return;

    setCreateData(null);
    setEditData({
      id: appt.id,
      title: appt.title,
      description: appt.description ?? "",
      startDate: toDateStr(new Date(appt.startDate)),
      endDate: toDateStr(new Date(appt.endDate)),
    });
  }, [isPro, appointments]);

  const closeCreate = useCallback(() => setCreateData(null), []);
  const closeEdit = useCallback(() => setEditData(null), []);

  const handleCreate = useCallback((data: Parameters<typeof api.createAppointment>[0]) => {
    createMutation.mutate(data, { onSuccess: closeCreate });
  }, [createMutation, closeCreate]);

  const handleUpdate = useCallback((id: string, data: Parameters<typeof api.updateAppointment>[1]) => {
    updateMutation.mutate({ id, data }, { onSuccess: closeEdit });
  }, [updateMutation, closeEdit]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id, { onSuccess: closeEdit });
  }, [deleteMutation, closeEdit]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isPro ? "Planifiez et gérez vos rendez-vous clients" : "Consultez vos prochains rendez-vous"}
          </p>
        </div>
        <Legend />
      </div>

      <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="fr"
          messages={messages}
          style={{ height: 640 }}
          eventPropGetter={eventStyleGetter}
          views={VIEWS}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable={isPro ? "ignoreEvents" : false}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {createData ? (
        <CreateAppointmentForm
          key="create"
          initial={createData}
          onSubmit={handleCreate}
          onClose={closeCreate}
          isPending={createMutation.isPending}
        />
      ) : null}

      {editData ? (
        <UpdateAppointmentForm
          key={editData.id}
          appointment={editData}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
          onClose={closeEdit}
          isPending={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      ) : null}
    </div>
  );
}
