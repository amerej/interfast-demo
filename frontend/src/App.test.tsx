import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./features/auth/AuthPage', () => ({ default: () => <div>AuthPage</div> }));
vi.mock('./features/projects/ProjectsPage', () => ({ default: () => <div>ProjectsPage</div> }));
vi.mock('./features/projects/ProjectDashboard', () => ({
  default: () => <div>ProjectDashboard</div>,
}));
vi.mock('./features/users/UserPage', () => ({ default: () => <div>UserPage</div> }));
vi.mock('./features/pro/ProAuthPage', () => ({ default: () => <div>ProAuthPage</div> }));
vi.mock('./features/pro/ProProjectsPage', () => ({ default: () => <div>ProProjectsPage</div> }));
vi.mock('./features/pro/ProProjectDashboard', () => ({
  default: () => <div>ProProjectDashboard</div>,
}));
vi.mock('./features/pro/ProClientsPage', () => ({ default: () => <div>ProClientsPage</div> }));
vi.mock('./components/Layout', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('./components/ProLayout', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

const mockUseSession = vi.fn();
vi.mock('./lib/auth-client', () => ({
  useSession: (...args: unknown[]) => mockUseSession(...args),
  useTypedSession: () => {
    const { data, isPending } = mockUseSession();
    return { user: data?.user, isPending, session: data };
  },
}));

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

const noSession = { data: null, isPending: false };

const verifiedClient = {
  data: { user: { id: '1', email: 'jean@example.com', role: 'client' } },
  isPending: false,
};

const verifiedPro = {
  data: {
    user: {
      id: '2',
      email: 'pro@example.com',
      role: 'pro',
      tradeId: 'trade-1',
    },
  },
  isPending: false,
};

describe('ProtectedRoute – /projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects unauthenticated user to /auth', () => {
    mockUseSession.mockReturnValue(noSession);
    renderApp('/projects');
    expect(screen.getByText('AuthPage')).toBeInTheDocument();
  });

  it('renders ProjectsPage for authenticated user', () => {
    mockUseSession.mockReturnValue(verifiedClient);
    renderApp('/projects');
    expect(screen.getByText('ProjectsPage')).toBeInTheDocument();
  });
});

describe('ProProtectedRoute – /pro/projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects unauthenticated user to /pro/auth', () => {
    mockUseSession.mockReturnValue(noSession);
    renderApp('/pro/projects');
    expect(screen.getByText('ProAuthPage')).toBeInTheDocument();
  });

  it('renders ProProjectsPage for verified pro with tradeId', () => {
    mockUseSession.mockReturnValue(verifiedPro);
    renderApp('/pro/projects');
    expect(screen.getByText('ProProjectsPage')).toBeInTheDocument();
  });
});

