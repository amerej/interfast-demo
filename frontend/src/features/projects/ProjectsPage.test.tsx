import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { mockProjects } from '../../test/mocks';
import ProjectsPage from './ProjectsPage';

vi.mock('../../lib/api', () => ({
  api: {
    getProjects: vi.fn(),
  },
}));

import { api } from '../../lib/api';

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ProjectsPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders project cards after loading', async () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);
    renderWithProviders(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rénovation Bureau')).toBeInTheDocument();
    });
    expect(screen.getByText('Construction Entrepôt')).toBeInTheDocument();
  });

  it('renders progress percentages', async () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);
    renderWithProviders(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('65')).toBeInTheDocument();
    });
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    renderWithProviders(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des projets')).toBeInTheDocument();
    });
  });

  it('shows empty state when no projects', async () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderWithProviders(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun projet')).toBeInTheDocument();
    });
  });

  it('renders status badges', async () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);
    renderWithProviders(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('En cours')).toBeInTheDocument();
    });
    expect(screen.getByText('Planification')).toBeInTheDocument();
  });

  it('renders pro names', async () => {
    (api.getProjects as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);
    renderWithProviders(<ProjectsPage />);

    await waitFor(() => {
      const proLabels = screen.getAllByText('Admin User');
      expect(proLabels.length).toBe(2);
    });
  });
});
