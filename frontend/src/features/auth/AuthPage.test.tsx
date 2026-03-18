import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/render';
import AuthPage from './AuthPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, Navigate: () => null };
});

vi.mock('../../lib/auth-client', () => ({
  useSession: vi.fn(() => ({ data: null, isPending: false })),
  signIn: { email: vi.fn() },
}));

import { signIn } from '../../lib/auth-client';

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByText('Bon retour')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
    });
  });

  it('calls signIn with email and password on submit', async () => {
    const user = userEvent.setup();
    (signIn.email as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: { id: '1' } },
    });

    renderWithProviders(<AuthPage />);

    await user.type(screen.getByPlaceholderText('vous@exemple.com'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: 'jean@example.com',
        password: 'password123',
      });
    });
  });

  it('navigates to /projects on successful login', async () => {
    const user = userEvent.setup();
    (signIn.email as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: { id: '1' } },
    });

    renderWithProviders(<AuthPage />);

    await user.type(screen.getByPlaceholderText('vous@exemple.com'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/projects');
    });
  });

  it('shows error message on failed login', async () => {
    const user = userEvent.setup();
    (signIn.email as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: { message: 'Identifiants invalides' },
    });

    renderWithProviders(<AuthPage />);

    await user.type(screen.getByPlaceholderText('vous@exemple.com'), 'bad@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong123');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });
  });

  it('renders demo credentials hint', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByText(/client@example\.com/)).toBeInTheDocument();
  });
});
