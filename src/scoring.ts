// Table tennis scoring utilities

export type GameScore = { left: number; right: number };

/**
 * Parse score string like "11-9,11-7,9-11,11-5" into game scores
 */
export function parseScoreString(str: string): GameScore[] {
  if (!str || !str.trim()) return [];
  return str.split(',').map(g => {
    const [l, r] = g.trim().split('-').map(n => parseInt(n, 10) || 0);
    return { left: l, right: r };
  });
}

/**
 * Convert game scores to string format
 */
export function scoreToString(games: GameScore[]): string {
  return games.map(g => `${g.left}-${g.right}`).join(',');
}

/**
 * Check if a game is won (standard 11-point, win by 2)
 */
export function isGameWon(score: GameScore): 'left' | 'right' | null {
  const { left, right } = score;
  if (left >= 11 && left - right >= 2) return 'left';
  if (right >= 11 && right - left >= 2) return 'right';
  return null;
}

/**
 * Count games won by each side
 */
export function countGamesWon(games: GameScore[]): { left: number; right: number } {
  let left = 0, right = 0;
  for (const g of games) {
    const winner = isGameWon(g);
    if (winner === 'left') left++;
    else if (winner === 'right') right++;
  }
  return { left, right };
}

/**
 * Determine match winner based on best-of format
 * @param games Array of game scores
 * @param bestOf Best of N games (3, 5, 7)
 * @returns 'left' | 'right' | null (if match not finished)
 */
export function getMatchWinner(games: GameScore[], bestOf: number): 'left' | 'right' | null {
  const needed = Math.ceil(bestOf / 2);
  const won = countGamesWon(games);
  if (won.left >= needed) return 'left';
  if (won.right >= needed) return 'right';
  return null;
}

/**
 * Format match result for display (e.g., "3:1")
 */
export function formatMatchResult(games: GameScore[]): string {
  const won = countGamesWon(games);
  return `${won.left}:${won.right}`;
}

/**
 * Check if score is at deuce (10-10 or higher, equal)
 */
export function isDeuce(score: GameScore): boolean {
  return score.left >= 10 && score.right >= 10 && score.left === score.right;
}

/**
 * Check if it's game point for either side
 */
export function getGamePoint(score: GameScore): 'left' | 'right' | null {
  const { left, right } = score;
  // Standard game point at 10
  if (left >= 10 && left > right && left - right >= 1) return 'left';
  if (right >= 10 && right > left && right - left >= 1) return 'right';
  return null;
}

/**
 * Validate a single game score
 */
export function isValidGameScore(score: GameScore): boolean {
  const { left, right } = score;
  if (left < 0 || right < 0) return false;
  // Game must be won by someone
  const winner = isGameWon(score);
  if (!winner) return left < 11 && right < 11; // Game in progress is valid
  // If won, check it's valid win
  const max = Math.max(left, right);
  const min = Math.min(left, right);
  if (max < 11) return false;
  if (max === 11 && min > 9) return false; // 11-10 is not valid
  if (max > 11 && max - min !== 2) return false; // Deuce must win by 2
  return true;
}
