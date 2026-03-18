import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { mockUserWithProjects } from '../../test/mocks';
import UserPage from './UserPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'user-1' }) };
});

vi.mock('../../lib/api', () => ({
  api: {
    getUser: vi.fn(),
  },
}));

import { api } from '../../lib/api';

describe('UserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    (api.getUser as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UserPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders user name after loading', async () => {
    (api.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserWithProjects);
    renderWithProviders(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });
  });

  it('renders user email', async () => {
    (api.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserWithProjects);
    renderWithProviders(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('jean@example.com')).toBeInTheDocument();
    });
  });

  it('renders user projects', async () => {
    (api.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserWithProjects);
    renderWithProviders(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('Rénovation Bureau')).toBeInTheDocument();
    });
    expect(screen.getByText('Construction Entrepôt')).toBeInTheDocument();
  });
});
