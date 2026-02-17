import { describe, it, expect } from 'vitest';
import type { Tournament, Event, Player, Match, ApiResponse } from '../src/types';

describe('Type definitions', () => {
  it('should define Tournament type correctly', () => {
    const tournament: Tournament = {
      id: 1,
      name: 'Test Tournament',
      info: 'Info',
      addr: 'Address',
      date: '2024-01-01',
      tables: 10,
      days: 3,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(tournament.id).toBe(1);
    expect(tournament.tables).toBe(10);
  });

  it('should define Event type with correct type literals', () => {
    const event: Event = {
      id: 1,
      tournament_id: 1,
      key: 'MS',
      title: 'Men Singles',
      type: 'singles',
      format: 'knockout',
      scoring: '11-5-3',
      beg_time: '09:00',
      end_time: '18:00',
    };
    expect(event.type).toBe('singles');
    expect(['singles', 'doubles', 'team']).toContain(event.type);
  });

  it('should define Player with optional fields', () => {
    const player: Player = {
      id: 1,
      tournament_id: 1,
      team_id: null,
      name: 'John',
      gender: 'M',
      rating: 1500,
      phone: null,
    };
    expect(player.team_id).toBeNull();
    expect(player.phone).toBeNull();
  });

  it('should define Match with all status options', () => {
    const statuses: Match['status'][] = ['pending', 'checkin', 'playing', 'finished'];
    statuses.forEach(status => {
      const match: Partial<Match> = { status };
      expect(['pending', 'checkin', 'playing', 'finished']).toContain(match.status);
    });
  });

  it('should define ApiResponse generically', () => {
    const success: ApiResponse<{ id: number }> = {
      success: true,
      data: { id: 1 },
    };
    const failure: ApiResponse = {
      success: false,
      error: 'Something went wrong',
    };
    expect(success.success).toBe(true);
    expect(success.data?.id).toBe(1);
    expect(failure.success).toBe(false);
    expect(failure.error).toBeDefined();
  });
});
