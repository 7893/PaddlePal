import { describe, it, expect } from 'vitest';
import {
  parseScoreString,
  scoreToString,
  isGameWon,
  countGamesWon,
  getMatchWinner,
  formatMatchResult,
  isDeuce,
  getGamePoint,
  isValidGameScore,
} from '../src/scoring';

describe('parseScoreString', () => {
  it('should parse valid score string', () => {
    expect(parseScoreString('11-9,11-7,9-11,11-5')).toEqual([
      { left: 11, right: 9 },
      { left: 11, right: 7 },
      { left: 9, right: 11 },
      { left: 11, right: 5 },
    ]);
  });

  it('should handle single game', () => {
    expect(parseScoreString('11-9')).toEqual([{ left: 11, right: 9 }]);
  });

  it('should handle empty string', () => {
    expect(parseScoreString('')).toEqual([]);
    expect(parseScoreString('  ')).toEqual([]);
  });

  it('should handle deuce scores', () => {
    expect(parseScoreString('14-12,11-9')).toEqual([
      { left: 14, right: 12 },
      { left: 11, right: 9 },
    ]);
  });
});

describe('scoreToString', () => {
  it('should convert games to string', () => {
    const games = [
      { left: 11, right: 9 },
      { left: 11, right: 7 },
    ];
    expect(scoreToString(games)).toBe('11-9,11-7');
  });

  it('should handle empty array', () => {
    expect(scoreToString([])).toBe('');
  });
});

describe('isGameWon', () => {
  it('should detect left winner', () => {
    expect(isGameWon({ left: 11, right: 9 })).toBe('left');
    expect(isGameWon({ left: 11, right: 0 })).toBe('left');
    expect(isGameWon({ left: 14, right: 12 })).toBe('left');
  });

  it('should detect right winner', () => {
    expect(isGameWon({ left: 9, right: 11 })).toBe('right');
    expect(isGameWon({ left: 12, right: 14 })).toBe('right');
  });

  it('should return null for incomplete game', () => {
    expect(isGameWon({ left: 10, right: 10 })).toBeNull();
    expect(isGameWon({ left: 11, right: 10 })).toBeNull(); // Need 2 point lead
    expect(isGameWon({ left: 5, right: 3 })).toBeNull();
  });
});

describe('countGamesWon', () => {
  it('should count games correctly', () => {
    const games = [
      { left: 11, right: 9 },
      { left: 11, right: 7 },
      { left: 9, right: 11 },
      { left: 11, right: 5 },
    ];
    expect(countGamesWon(games)).toEqual({ left: 3, right: 1 });
  });

  it('should handle empty array', () => {
    expect(countGamesWon([])).toEqual({ left: 0, right: 0 });
  });
});

describe('getMatchWinner', () => {
  it('should detect winner in best of 3', () => {
    expect(getMatchWinner([
      { left: 11, right: 9 },
      { left: 11, right: 7 },
    ], 3)).toBe('left');

    expect(getMatchWinner([
      { left: 9, right: 11 },
      { left: 7, right: 11 },
    ], 3)).toBe('right');
  });

  it('should detect winner in best of 5', () => {
    expect(getMatchWinner([
      { left: 11, right: 9 },
      { left: 11, right: 7 },
      { left: 11, right: 5 },
    ], 5)).toBe('left');

    expect(getMatchWinner([
      { left: 11, right: 9 },
      { left: 9, right: 11 },
      { left: 11, right: 7 },
      { left: 7, right: 11 },
      { left: 5, right: 11 },
    ], 5)).toBe('right');
  });

  it('should return null for incomplete match', () => {
    expect(getMatchWinner([
      { left: 11, right: 9 },
      { left: 9, right: 11 },
    ], 5)).toBeNull();
  });
});

describe('formatMatchResult', () => {
  it('should format result correctly', () => {
    const games = [
      { left: 11, right: 9 },
      { left: 11, right: 7 },
      { left: 9, right: 11 },
      { left: 11, right: 5 },
    ];
    expect(formatMatchResult(games)).toBe('3:1');
  });
});

describe('isDeuce', () => {
  it('should detect deuce', () => {
    expect(isDeuce({ left: 10, right: 10 })).toBe(true);
    expect(isDeuce({ left: 15, right: 15 })).toBe(true);
  });

  it('should return false for non-deuce', () => {
    expect(isDeuce({ left: 10, right: 9 })).toBe(false);
    expect(isDeuce({ left: 9, right: 9 })).toBe(false);
  });
});

describe('getGamePoint', () => {
  it('should detect game point for left', () => {
    expect(getGamePoint({ left: 10, right: 9 })).toBe('left');
    expect(getGamePoint({ left: 11, right: 10 })).toBe('left');
  });

  it('should detect game point for right', () => {
    expect(getGamePoint({ left: 9, right: 10 })).toBe('right');
  });

  it('should return null when no game point', () => {
    expect(getGamePoint({ left: 10, right: 10 })).toBeNull();
    expect(getGamePoint({ left: 5, right: 5 })).toBeNull();
  });
});

describe('isValidGameScore', () => {
  it('should accept valid completed games', () => {
    expect(isValidGameScore({ left: 11, right: 9 })).toBe(true);
    expect(isValidGameScore({ left: 11, right: 0 })).toBe(true);
    expect(isValidGameScore({ left: 14, right: 12 })).toBe(true);
    expect(isValidGameScore({ left: 9, right: 11 })).toBe(true);
  });

  it('should accept valid in-progress games', () => {
    expect(isValidGameScore({ left: 5, right: 3 })).toBe(true);
    expect(isValidGameScore({ left: 0, right: 0 })).toBe(true);
  });

  it('should reject invalid scores', () => {
    expect(isValidGameScore({ left: -1, right: 5 })).toBe(false);
    expect(isValidGameScore({ left: 11, right: 10 })).toBe(false); // Not won by 2
    expect(isValidGameScore({ left: 15, right: 12 })).toBe(false); // Deuce not won by 2
  });
});
