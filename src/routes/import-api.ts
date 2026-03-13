import { Hono } from 'hono';
import Papa from 'papaparse';

type Bindings = { DB: D1Database; FILES: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

// Import players from CSV: POST /api/import/players
// CSV format: event_type,team/short,name,gender,phone,id_card,org,job,level,seed
app.post('/api/import/players', async (c) => {
  const text = await c.req.text();
  const { data: rows } = Papa.parse(text, { skipEmptyLines: true });
  const db = c.env.DB;
  const teamCache: Record<string, number> = {};
  const stmts = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as string[];
    if (!r || !r[2]) continue;
    const teamStr = r[1]?.toString() || '';
    const [teamName, shortName] = teamStr.split('/');
    const name = r[2]?.toString()?.trim();
    const gender = r[3]?.toString()?.toUpperCase() === 'W' ? 'F' : 'M';
    const seed = r[9] || null;
    if (!name) continue;

    let teamId: number | null = null;
    if (teamName) {
      if (teamCache[teamName]) {
        teamId = teamCache[teamName];
      } else {
        const existing = await db
          .prepare('SELECT id FROM teams WHERE name = ? AND tournament_id = 1')
          .bind(teamName)
          .first();
        if (existing) {
          teamId = existing.id as number;
        } else {
          const res = await db
            .prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1, ?, ?)')
            .bind(teamName, shortName || teamName)
            .run();
          teamId = res.meta.last_row_id as number;
        }
        teamCache[teamName] = teamId;
      }
    }
    stmts.push(
      db
        .prepare('INSERT INTO players (tournament_id, team_id, name, gender, rating) VALUES (1, ?, ?, ?, ?)')
        .bind(teamId, name, gender, seed ? parseInt(seed) : 1500)
    );
  }
  if (stmts.length > 0) await db.batch(stmts);
  return c.json({ success: true, imported: stmts.length });
});

// Import teams from CSV: POST /api/import/teams
app.post('/api/import/teams', async (c) => {
  const text = await c.req.text();
  const { data: rows } = Papa.parse(text, { skipEmptyLines: true });
  const db = c.env.DB;
  const stmts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as string[];
    const name = r[0]?.trim();
    if (!name) continue;
    stmts.push(
      db
        .prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1, ?, ?)')
        .bind(name, r[1]?.trim() || name)
    );
  }
  if (stmts.length > 0) await db.batch(stmts);
  return c.json({ success: true, imported: stmts.length });
});

// Import referees from CSV: POST /api/import/referees
app.post('/api/import/referees', async (c) => {
  const text = await c.req.text();
  const { data: rows } = Papa.parse(text, { skipEmptyLines: true });
  const db = c.env.DB;
  const stmts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as string[];
    const name = r[0]?.trim();
    if (!name) continue;
    stmts.push(
      db
        .prepare('INSERT INTO referees (tournament_id, name, role) VALUES (1, ?, ?)')
        .bind(name, r[1]?.trim() || 'referee')
    );
  }
  if (stmts.length > 0) await db.batch(stmts);
  return c.json({ success: true, imported: stmts.length });
});

// Import leaders from CSV: POST /api/import/leaders
app.post('/api/import/leaders', async (c) => {
  const text = await c.req.text();
  const { data: rows } = Papa.parse(text, { skipEmptyLines: true });
  const db = c.env.DB;
  const stmts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as string[];
    const name = r[0]?.trim();
    if (!name) continue;
    stmts.push(
      db.prepare('INSERT INTO leaders (tournament_id, name, title) VALUES (1, ?, ?)').bind(name, r[1]?.trim() || '')
    );
  }
  if (stmts.length > 0) await db.batch(stmts);
  return c.json({ success: true, imported: stmts.length });
});

export { app as importApi };
