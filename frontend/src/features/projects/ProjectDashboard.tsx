import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ChevronLeft } from 'lucide-react';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import ProjectSummary from './components/ProjectSummary';
import ProgressCharts from './components/ProgressCharts';
import TaskChecklist from './components/TaskChecklist';
import ActivityFeed from './components/ActivityFeed';

export default function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spinner />;
  if (error || !project) return <ErrorState message="Erreur lors du chargement du projet" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full px-3 py-1.5 hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
          Projets
        </Link>
      </div>

      <ProjectSummary project={project} />
      <ProgressCharts project={project} projectId={id!} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TaskChecklist projectId={id!} />
        <ActivityFeed projectId={id!} />
      </div>
    </div>
  );
}
