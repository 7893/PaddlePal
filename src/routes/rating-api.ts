import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// CTTA rating levels: [maxDiff, winnerGain, loserLoss]
const RATING_LEVELS = [
  [12, 8, 8], [37, 7, 10], [62, 6, 13], [87, 5, 16], [112, 4, 20],
  [137, 3, 25], [162, 2, 30], [187, 2, 35], [212, 1, 40], [237, 1, 45], [Infinity, 0, 50]
];

function calcRatingChange(winnerRating: number, loserRating: number): [number, number] {
  const diff = Math.abs(winnerRating - loserRating);
  const level = RATING_LEVELS.find(l => diff <= l[0])!;
  
  if (winnerRating >= loserRating) {
    // Favorite wins: normal
    return [level[1], -level[2]];
  } else {
    // Upset: swap gains
    return [level[2], -level[1]];
  }
}

// Calculate rating for a match: POST /api/rating/calc/:matchId
app.post('/api/rating/calc/:matchId', async (c) => {
  const matchId = parseInt(c.req.param('matchId'));
  const db = c.env.DB;

  const match = await db.prepare(`
    SELECT m.id, m.event_id, m.player1_id, m.player2_id, m.winner_side, m.status,
      p1.rating as r1, p2.rating as r2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.id = ?
  `).bind(matchId).first();

  if (!match) return c.json({ error: 'Match not found' }, 404);
  if (match.status !== 'finished') return c.json({ error: 'Match not finished' }, 400);
  if (!match.winner_side) return c.json({ error: 'No winner' }, 400);

  const r1 = (match.r1 as number) || 0;
  const r2 = (match.r2 as number) || 0;
  const winnerId = match.winner_side === 1 ? match.player1_id : match.player2_id;
  const loserId = match.winner_side === 1 ? match.player2_id : match.player1_id;
  const winnerRating = match.winner_side === 1 ? r1 : r2;
  const loserRating = match.winner_side === 1 ? r2 : r1;

  const [winChange, loseChange] = calcRatingChange(winnerRating, loserRating);

  // Check if already calculated
  const existing = await db.prepare('SELECT id FROM ratings WHERE match_id = ?').bind(matchId).first();
  if (existing) return c.json({ error: 'Already calculated' }, 400);

  // Insert rating records
  await db.batch([
    db.prepare(`INSERT INTO ratings (tournament_id, player_id, event_id, match_id, rating_before, rating_after, rating_change)
      VALUES (1, ?, ?, ?, ?, ?, ?)`).bind(winnerId, match.event_id, matchId, winnerRating, winnerRating + winChange, winChange),
    db.prepare(`INSERT INTO ratings (tournament_id, player_id, event_id, match_id, rating_before, rating_after, rating_change)
      VALUES (1, ?, ?, ?, ?, ?, ?)`).bind(loserId, match.event_id, matchId, loserRating, loserRating + loseChange, loseChange),
    db.prepare('UPDATE players SET rating = rating + ? WHERE id = ?').bind(winChange, winnerId),
    db.prepare('UPDATE players SET rating = rating + ? WHERE id = ?').bind(loseChange, loserId)
  ]);

  return c.json({
    winner: { id: winnerId, before: winnerRating, change: winChange, after: winnerRating + winChange },
    loser: { id: loserId, before: loserRating, change: loseChange, after: loserRating + loseChange }
  });
});

// Get player rating history: GET /api/rating/player/:playerId
app.get('/api/rating/player/:playerId', async (c) => {
  const playerId = parseInt(c.req.param('playerId'));
  const db = c.env.DB;

  const player = await db.prepare('SELECT id, name, rating FROM players WHERE id = ?').bind(playerId).first();
  if (!player) return c.json({ error: 'Player not found' }, 404);

  const { results: history } = await db.prepare(`
    SELECT r.match_id, r.rating_before, r.rating_after, r.rating_change, e.title as event
    FROM ratings r JOIN events e ON r.event_id = e.id
    WHERE r.player_id = ? ORDER BY r.id DESC
  `).bind(playerId).all();

  return c.json({ player, history });
});

// Get rating leaderboard: GET /api/rating/leaderboard
app.get('/api/rating/leaderboard', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') || '50');

  const { results } = await db.prepare(`
    SELECT p.id, p.name, p.rating, t.short_name as team
    FROM players p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.tournament_id = 1 AND p.rating > 0
    ORDER BY p.rating DESC LIMIT ?
  `).bind(limit).all();

  return c.json({ leaderboard: results });
});

// Batch calculate ratings for event: POST /api/rating/batch/:eventKey
app.post('/api/rating/batch/:eventKey', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const { results: matches } = await db.prepare(`
    SELECT m.id, m.player1_id, m.player2_id, m.winner_side,
      p1.rating as r1, p2.rating as r2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN ratings r ON r.match_id = m.id
    WHERE m.event_id = ? AND m.status = 'finished' AND m.winner_side IS NOT NULL AND r.id IS NULL
    ORDER BY m.id
  `).bind(event.id).all();

  let calculated = 0;
  for (const m of matches) {
    const r1 = (m.r1 as number) || 0;
    const r2 = (m.r2 as number) || 0;
    const winnerId = m.winner_side === 1 ? m.player1_id : m.player2_id;
    const loserId = m.winner_side === 1 ? m.player2_id : m.player1_id;
    const winnerRating = m.winner_side === 1 ? r1 : r2;
    const loserRating = m.winner_side === 1 ? r2 : r1;

    const [winChange, loseChange] = calcRatingChange(winnerRating, loserRating);

    await db.batch([
      db.prepare(`INSERT INTO ratings (tournament_id, player_id, event_id, match_id, rating_before, rating_after, rating_change)
        VALUES (1, ?, ?, ?, ?, ?, ?)`).bind(winnerId, event.id, m.id, winnerRating, winnerRating + winChange, winChange),
      db.prepare(`INSERT INTO ratings (tournament_id, player_id, event_id, match_id, rating_before, rating_after, rating_change)
        VALUES (1, ?, ?, ?, ?, ?, ?)`).bind(loserId, event.id, m.id, loserRating, loserRating + loseChange, loseChange),
      db.prepare('UPDATE players SET rating = rating + ? WHERE id = ?').bind(winChange, winnerId),
      db.prepare('UPDATE players SET rating = rating + ? WHERE id = ?').bind(loseChange, loserId)
    ]);
    calculated++;
  }

  return c.json({ calculated });
});

export { app as ratingApi };
