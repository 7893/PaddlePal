import { Hono } from 'hono';
import * as XLSX from 'xlsx';

type Bindings = { DB: D1Database; FILES: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

// Import players from Excel: POST /api/import/players
app.post('/api/import/players', async (c) => {
  const body = await c.req.arrayBuffer();
  const wb = XLSX.read(body, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const db = c.env.DB;
  const teamCache: Record<string, number> = {};
  let imported = 0;

  for (let i = 4; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[1]) continue;

    const eventType = r[1]?.toString().toUpperCase();
    const teamStr = r[2]?.toString() || '';
    const [teamName, shortName] = teamStr.split('/');
    const name = r[3]?.toString()?.trim();
    const gender = r[4]?.toString()?.toUpperCase() === 'W' ? 'F' : 'M';
    const seed = r[9] || null;

    if (!name) continue;

    // Get or create team
    let teamId: number | null = null;
    if (teamName) {
      const cacheKey = teamName.trim();
      if (teamCache[cacheKey]) {
        teamId = teamCache[cacheKey];
      } else {
        const existing = await db.prepare('SELECT id FROM teams WHERE tournament_id=1 AND name=?').bind(cacheKey).first();
        if (existing) {
          teamId = existing.id as number;
        } else {
          const res = await db.prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1, ?, ?) RETURNING id')
            .bind(cacheKey, shortName?.trim() || cacheKey).first();
          teamId = res?.id as number;
        }
        teamCache[cacheKey] = teamId;
      }
    }

    // Insert player
    await db.prepare('INSERT INTO players (tournament_id, team_id, name, gender, seed) VALUES (1, ?, ?, ?, ?)')
      .bind(teamId, name, gender, seed).run();
    imported++;
  }

  return c.json({ imported, teams: Object.keys(teamCache).length });
});

// Import teams from Excel: POST /api/import/teams
app.post('/api/import/teams', async (c) => {
  const body = await c.req.arrayBuffer();
  const wb = XLSX.read(body, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const db = c.env.DB;
  let imported = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    const name = r[0]?.toString()?.trim();
    const shortName = r[1]?.toString()?.trim() || name;
    if (!name) continue;

    await db.prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1, ?, ?)')
      .bind(name, shortName).run();
    imported++;
  }

  return c.json({ imported });
});

// Import referees from Excel: POST /api/import/referees
app.post('/api/import/referees', async (c) => {
  const body = await c.req.arrayBuffer();
  const wb = XLSX.read(body, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const db = c.env.DB;
  let imported = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    const name = r[0]?.toString()?.trim();
    const gender = r[1]?.toString()?.toUpperCase() === 'W' ? 'F' : 'M';
    const level = r[2]?.toString() || '';
    const phone = r[3]?.toString() || '';
    if (!name) continue;

    await db.prepare('INSERT INTO referees (tournament_id, name, gender, level, phone) VALUES (1, ?, ?, ?, ?)')
      .bind(name, gender, level, phone).run();
    imported++;
  }

  return c.json({ imported });
});

// Import leaders from Excel: POST /api/import/leaders
app.post('/api/import/leaders', async (c) => {
  const body = await c.req.arrayBuffer();
  const wb = XLSX.read(body, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const db = c.env.DB;
  let imported = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    const teamName = r[0]?.toString()?.trim();
    const name = r[1]?.toString()?.trim();
    const gender = r[2]?.toString()?.toUpperCase() === 'W' ? 'F' : 'M';
    const title = r[3]?.toString() || '';
    const phone = r[4]?.toString() || '';
    if (!name) continue;

    // Find team
    const team = await db.prepare('SELECT id FROM teams WHERE tournament_id=1 AND name=?').bind(teamName).first();
    const teamId = team?.id as number || null;

    await db.prepare('INSERT INTO leaders (tournament_id, team_id, name, gender, title, phone) VALUES (1, ?, ?, ?, ?, ?)')
      .bind(teamId, name, gender, title, phone).run();
    imported++;
  }

  return c.json({ imported });
});

export { app as importApi };
