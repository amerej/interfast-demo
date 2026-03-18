import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/render';
import { mockTasks } from '../../../test/mocks';
import TaskChecklist from './TaskChecklist';

vi.mock('../../../lib/api', () => ({
  api: {
    getProjectTasks: vi.fn(),
    updateTask: vi.fn(),
  },
}));

vi.mock('../../../lib/auth-client', () => ({
  useTypedSession: vi.fn(() => ({
    user: { id: 'user-1', name: 'Jean Dupont', role: 'client' },
  })),
}));

import { api } from '../../../lib/api';

describe('TaskChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    (api.getProjectTasks as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<TaskChecklist projectId="proj-1" />);
    expect(document.querySelectorAll('.animate-pulse').length).toBe(3);
  });

  it('renders task titles', async () => {
    (api.getProjectTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    renderWithProviders(<TaskChecklist projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText('Démolition murs porteurs')).toBeInTheDocument();
    });
    expect(screen.getByText('Installation électrique')).toBeInTheDocument();
    expect(screen.getByText('Peinture intérieure')).toBeInTheDocument();
  });

  it('renders done/total count', async () => {
    (api.getProjectTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    renderWithProviders(<TaskChecklist projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });
  });

  it('renders category badges', async () => {
    (api.getProjectTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    renderWithProviders(<TaskChecklist projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getAllByText('Gros œuvre').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('Électricité').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Finitions').length).toBeGreaterThanOrEqual(1);
  });

  it('applies line-through to done tasks', async () => {
    (api.getProjectTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    renderWithProviders(<TaskChecklist projectId="proj-1" />);

    await waitFor(() => {
      const doneTask = screen.getByText('Démolition murs porteurs');
      expect(doneTask.className).toContain('line-through');
    });
  });

  it('shows empty state when no tasks', async () => {
    (api.getProjectTasks as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderWithProviders(<TaskChecklist projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText('Aucune tâche')).toBeInTheDocument();
    });
  });
});
