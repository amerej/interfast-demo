import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/render';
import { mockProject } from '../../../test/mocks';
import ProjectSummary from './ProjectSummary';

describe('ProjectSummary', () => {
  it('renders project name', () => {
    renderWithProviders(<ProjectSummary project={mockProject} />);
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
  });

  it('renders client name', () => {
    renderWithProviders(<ProjectSummary project={mockProject} />);
    expect(screen.getByText(`Client: ${mockProject.clientName}`)).toBeInTheDocument();
  });

  it('renders progress percentage', () => {
    renderWithProviders(<ProjectSummary project={mockProject} />);
    expect(screen.getByText(String(mockProject.progress))).toBeInTheDocument();
  });

  it('renders task stats', () => {
    renderWithProviders(<ProjectSummary project={mockProject} />);
    expect(screen.getByText(String(mockProject.taskStats.done))).toBeInTheDocument();
    expect(screen.getByText(`/ ${mockProject.taskStats.total}`)).toBeInTheDocument();
  });

  it('renders status badge', () => {
    renderWithProviders(<ProjectSummary project={mockProject} />);
    expect(screen.getByText('En cours')).toBeInTheDocument();
  });

  it('renders start and end dates in fr-FR format', () => {
    renderWithProviders(<ProjectSummary project={mockProject} />);
    const startDate = new Date(mockProject.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    expect(screen.getByText(startDate)).toBeInTheDocument();
  });

  it('renders dash when no dates', () => {
    renderWithProviders(<ProjectSummary project={{ ...mockProject, startDate: null, estimatedEndDate: null }} />);
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
