import { Hono } from 'hono';
import Papa from 'papaparse';

type Bindings = { DB: D1Database; FILES: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

// Export players as CSV: GET /api/export/players
app.get('/api/export/players', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT p.id, p.name, p.gender, p.rating, t.name as team, t.short_name
    FROM players p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.tournament_id = 1 ORDER BY t.name, p.name
  `).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="players.csv"',
    },
  });
});

// Export matches as CSV: GET /api/export/matches/:eventKey
app.get('/api/export/matches/:eventKey', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id, title FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const { results } = await db.prepare(`
    SELECT m.round, m.match_no, m.table_no,
      COALESCE(p1.name, t1.short_name) as player1,
      COALESCE(p2.name, t2.short_name) as player2,
      m.result, m.status, m.scheduled_time
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE m.event_id = ?
    ORDER BY m.round, m.match_no
  `).bind(event.id).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${eventKey}-matches.csv"`,
    },
  });
});

// Export scoresheet as CSV: GET /api/export/scoresheet/:matchId
app.get('/api/export/scoresheet/:matchId', async (c) => {
  const matchId = parseInt(c.req.param('matchId'));
  const db = c.env.DB;

  const match = await db.prepare(`
    SELECT m.*, e.title as event_title, e.scoring,
      COALESCE(p1.name, t1.short_name) as player1,
      COALESCE(p2.name, t2.short_name) as player2
    FROM matches m
    JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE m.id = ?
  `).bind(matchId).first();

  if (!match) return c.json({ error: 'Match not found' }, 404);

  const data = [
    ['Event', match.event_title],
    ['Round', match.round],
    ['Match No', match.match_no],
    ['Table', match.table_no],
    ['Player 1', match.player1],
    ['Player 2', match.player2],
    ['Result', match.result || ''],
    ['Status', match.status],
  ];

  const csv = Papa.unparse(data);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="match-${matchId}.csv"`,
    },
  });
});

export { app as exportApi };
