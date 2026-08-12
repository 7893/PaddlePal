import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publicApi } from '../src/routes/public-api';

describe('Public API Routes', () => {
  const mockDb = {
    prepare: vi.fn(),
  };

  const mockKv = {
    get: vi.fn(),
    put: vi.fn(),
  };

  const env = {
    DB: mockDb as any,
    SESSIONS: mockKv as any,
  };

  const ctx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKv.get.mockResolvedValue(null);
  });

  it('GET /rawinfo should return tournament info', async () => {
    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('FROM tournaments')) {
        return {
          first: async () => ({ info: 'Test Tourney', addr: 'Test Venue', tables: 4, date: '2023-10-01', days: 2 }),
        };
      }
      if (query.includes('FROM events')) {
        return {
          all: async () => ({
            results: [
              {
                key: 'E1',
                event: 'MS',
                title: 'Mens Singles',
                groups: 4,
                plays: 10,
                finish: 5,
                beg_time: '09:00',
                end_time: '12:00',
              },
            ],
          }),
        };
      }
      return { first: async () => null, all: async () => ({ results: [] }) };
    });

    const res = await publicApi.request('/rawinfo', {}, env, ctx as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.info).toBe('Test Tourney');
    expect(data.addr).toBe('Test Venue');
    expect(data.tables).toBe(4);
    expect(data.match).toHaveLength(1);
    expect(data.match[0].progress).toBe('50%');
  });

  it('GET /notice should return notices', async () => {
    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('FROM notices')) {
        return {
          all: async () => ({
            results: [{ id: 1, title: 'Notice 1', content: 'Content 1', time: '2023-10-01T10:00:00Z' }],
          }),
        };
      }
      return { all: async () => ({ results: [] }) };
    });

    const res = await publicApi.request('/notice', {}, env, ctx as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notices).toHaveLength(1);
    expect(data.notices[0].title).toBe('Notice 1');
  });

  it('GET /toplay should return scheduled matches', async () => {
    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('FROM matches')) {
        return {
          all: async () => ({
            results: [{ id: 1, tb: 1, tm: '10:00', gp: 'A', ev: 'MS', nl: 'John', nr: 'Doe' }],
          }),
        };
      }
      return { all: async () => ({ results: [] }) };
    });

    const res = await publicApi.request('/toplay', {}, env, ctx as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.array).toHaveLength(1);
    expect(data.array[0].nl).toBe('John');
  });
});
