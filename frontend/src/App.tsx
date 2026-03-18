import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './lib/auth-client';
import Layout from './components/Layout';
import AuthPage from './features/auth/AuthPage';
import ProjectsPage from './features/projects/ProjectsPage';
import ProjectDashboard from './features/projects/ProjectDashboard';
import UserPage from './features/users/UserPage';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;
  if (!session?.user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

function RootRedirect() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;
  if (!session?.user) return <Navigate to="/auth" replace />;
  return <Navigate to="/projects" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <UserPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
