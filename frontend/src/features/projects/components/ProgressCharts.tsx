import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../../../lib/api';
import type { Project, Task } from '../../../lib/types';
import { PieChartIcon, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const STATUS_CONFIG: Record<string, { label: string; color: () => string }> = {
  done: { label: 'Terminé', color: () => getCssVar('--primary') || '#e16349' },
  doing: { label: 'En cours', color: () => '#f0a899' },
  todo: { label: 'À faire', color: () => getCssVar('--chart-3') || '#d4d4d4' },
};

function DonutLabel({ viewBox, total }: { viewBox?: { cx?: number; cy?: number }; total: number }) {
  const { cx, cy } = viewBox ?? {};
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.4em" className="fill-foreground text-2xl font-bold font-display">
        {total}
      </tspan>
      <tspan x={cx} dy="1.5em" className="fill-muted-foreground text-[10px] tracking-wide uppercase">
        tâches
      </tspan>
    </text>
  );
}

interface TooltipEntry { name: string; value: number; color: string }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card px-4 py-3 shadow-xl shadow-black/5">
      {label && <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-semibold text-foreground ml-auto pl-3">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { color: string; value: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-3">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressCharts({
  project,
  projectId,
}: {
  project: Project;
  projectId: string;
}) {
  const [, setThemeTick] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeTick((t) => t + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getProjectTasks(projectId),
  });

  const statusCounts = (tasks ?? []).reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {},
  );

  const total = Object.values(statusCounts).reduce((a: number, b: number) => a + b, 0);

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_CONFIG[status]?.label ?? status,
    value: count,
    color: (STATUS_CONFIG[status]?.color ?? STATUS_CONFIG.todo.color)(),
  }));

  const categoryCounts = (tasks ?? []).reduce<Record<string, Record<string, number>>>(
    (acc, t) => {
      const cat = t.category || 'Autre';
      if (!acc[cat]) acc[cat] = { done: 0, doing: 0, todo: 0 };
      acc[cat][t.status] = (acc[cat][t.status] || 0) + 1;
      return acc;
    },
    {},
  );

  const barData = Object.entries(categoryCounts).map(([category, counts]) => ({
    category,
    ...counts,
  }));

  const mutedFg = getCssVar('--muted-foreground') || '#737373';

  const empty = (
    <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
      <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
      <span className="text-xs">Aucune tâche</span>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-card p-6 animate-fade-up stagger-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <PieChartIcon className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">Répartition des tâches</h3>
            <p className="text-xs text-muted-foreground">Vue d'ensemble par statut</p>
          </div>
        </div>
        {pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={3}
                  cornerRadius={6}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <DonutLabel total={total} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-5 mt-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-muted-foreground">{item.name}</span>
                  <span className="text-[11px] font-semibold ml-0.5">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : empty}
      </div>

      <div className="rounded-2xl bg-card p-6 animate-fade-up stagger-2 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">Par catégorie</h3>
            <p className="text-xs text-muted-foreground">Progression par domaine</p>
          </div>
        </div>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData} barCategoryGap="25%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis
                dataKey="category"
                fontSize={11}
                stroke={mutedFg}
                tickLine={false}
                axisLine={false}
                dy={4}
              />
              <YAxis
                allowDecimals={false}
                fontSize={11}
                stroke={mutedFg}
                tickLine={false}
                axisLine={false}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4, rx: 6 }} />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="done"
                name="Terminé"
                fill={STATUS_CONFIG.done.color()}
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="doing"
                name="En cours"
                fill={STATUS_CONFIG.doing.color()}
                stackId="a"
              />
              <Bar
                dataKey="todo"
                name="À faire"
                fill={STATUS_CONFIG.todo.color()}
                stackId="a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : empty}
      </div>
    </div>
  );
}
