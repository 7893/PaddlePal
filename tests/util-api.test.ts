import { describe, it, expect, vi } from 'vitest';
import { utilApi } from '../src/routes/util-api';

describe('Util API Routes', () => {
  const mockDb = {
    prepare: vi.fn(),
  };

  const env = {
    DB: mockDb as any,
  };

  it('GET /api/health should return ok when DB is connected', async () => {
    mockDb.prepare.mockImplementation(() => ({
      first: async () => ({ '1': 1 }),
    }));

    const res = await utilApi.request('/api/health', {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.db).toBe('connected');
  });

  it('GET /api/health should return error when DB fails', async () => {
    mockDb.prepare.mockImplementation(() => ({
      first: async () => {
        throw new Error('DB Error');
      },
    }));

    const res = await utilApi.request('/api/health', {}, env);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.status).toBe('error');
    expect(data.db).toBe('disconnected');
  });

  it('GET /api/version should return version info', async () => {
    const res = await utilApi.request('/api/version', {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('PaddlePal');
    expect(data.version).toBe('1.0.0');
  });

  it('GET /api/search should return empty for short query', async () => {
    const res = await utilApi.request('/api/search?q=a', {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.players).toEqual([]);
    expect(data.matches).toEqual([]);
  });

  it('GET /api/search should return players and matches for valid query', async () => {
    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('FROM players')) {
        return {
          bind: () => ({
            all: async () => ({ results: [{ id: 1, name: 'John', team: 'Team A' }] }),
          }),
        };
      }
      if (query.includes('FROM matches')) {
        return {
          bind: () => ({
            all: async () => ({ results: [{ id: 10, time: '10:00', p1: 'John', p2: 'Doe', status: 'playing' }] }),
          }),
        };
      }
      return { bind: () => ({ all: async () => ({ results: [] }) }) };
    });

    const res = await utilApi.request('/api/search?q=John', {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.players).toHaveLength(1);
    expect(data.players[0].name).toBe('John');
    expect(data.matches).toHaveLength(1);
    expect(data.matches[0].p1).toBe('John');
  });

  it('GET /api/dashboard should return stats', async () => {
    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('COUNT(*) FROM players')) {
        return {
          first: async () => ({ players: 10, teams: 2, total_matches: 5, finished: 2, playing: 1, scheduled: 2 }),
        };
      }
      if (query.includes('LIMIT 5')) {
        return {
          all: async () => ({ results: [{ id: 1, p1: 'A', p2: 'B', score1: 3, score2: 0 }] }),
        };
      }
      return { first: async () => ({}), all: async () => ({ results: [] }) };
    });

    const res = await utilApi.request('/api/dashboard', {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.stats.players).toBe(10);
    expect(data.recentResults).toHaveLength(1);
  });
});
