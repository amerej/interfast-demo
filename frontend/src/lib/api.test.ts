import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalFetch = globalThis.fetch;

describe('api', () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('makes GET request with credentials', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1' }]),
    });

    const { api } = await import('./api');
    const result = await api.getProjects();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/backend/projects',
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(result).toEqual([{ id: '1' }]);
  });

  it('makes POST request with body', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'new-task' }),
    });

    const { api } = await import('./api');
    await api.createTask({ projectId: 'p1', title: 'Test task' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/backend/tasks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ projectId: 'p1', title: 'Test task' }),
      }),
    );
  });

  it('throws on HTTP error', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ message: 'Not authenticated' }),
    });

    const { api } = await import('./api');
    await expect(api.getProjects()).rejects.toThrow('Not authenticated');
  });

  it('handles json parse failure on error response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('parse error')),
    });

    const { api } = await import('./api');
    await expect(api.getProjects()).rejects.toThrow('Internal Server Error');
  });

  it('makes PATCH request', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 't1', status: 'done' }),
    });

    const { api } = await import('./api');
    await api.updateTask('t1', { status: 'done' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/backend/tasks/t1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('makes DELETE request', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    });

    const { api } = await import('./api');
    await api.deleteTask('t1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/backend/tasks/t1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('fetches comments for an activity', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'c1', message: 'test' }]),
    });

    const { api } = await import('./api');
    const result = await api.getActivityComments('act-1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/backend/activities/act-1/comments',
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(result).toEqual([{ id: 'c1', message: 'test' }]);
  });
});
