import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 获取设置
app.get('/api/settings', async (c) => {
  const db = c.env.DB;
  const settings = await db.prepare(`
    SELECT tables_count, minutes_per_match, auto_advance, require_confirm, allow_appeals, show_rating
    FROM tournaments WHERE id = 1
  `).first();

  return c.json(settings || {
    tables_count: 6,
    minutes_per_match: 15,
    auto_advance: 1,
    require_confirm: 1,
    allow_appeals: 1,
    show_rating: 1
  });
});

// 保存设置
app.post('/api/settings', async (c) => {
  const db = c.env.DB;
  const data = await c.req.json<{
    tables_count?: number;
    minutes_per_match?: number;
    auto_advance?: number;
    require_confirm?: number;
    allow_appeals?: number;
    show_rating?: number;
  }>();

  const updates: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (updates.length > 0) {
    await db.prepare(`UPDATE tournaments SET ${updates.join(', ')} WHERE id = 1`).bind(...params).run();
  }

  return c.json({ success: true });
});

// 数据备份
app.get('/api/backup', async (c) => {
  const db = c.env.DB;

  const [tournaments, teams, players, events] = await Promise.all([
    db.prepare('SELECT * FROM tournaments').all(),
    db.prepare('SELECT * FROM teams').all(),
    db.prepare('SELECT * FROM players').all(),
    db.prepare('SELECT * FROM events').all(),
  ]);

  const backup = {
    version: '1.0',
    created_at: new Date().toISOString(),
    data: {
      tournaments: tournaments.results,
      teams: teams.results,
      players: players.results,
      events: events.results,
    }
  };

  c.header('Content-Type', 'application/json');
  c.header('Content-Disposition', `attachment; filename="paddlepal-backup-${new Date().toISOString().slice(0,10)}.json"`);
  return c.body(JSON.stringify(backup, null, 2));
});

// 数据恢复
app.post('/api/restore', async (c) => {
  const db = c.env.DB;
  const backup = await c.req.json<{ data: any }>();

  if (!backup.data) return c.json({ error: '无效的备份文件' }, 400);

  // 清空现有数据
  await db.batch([
    db.prepare('DELETE FROM scores'),
    db.prepare('DELETE FROM matches'),
    db.prepare('DELETE FROM group_entries'),
    db.prepare('DELETE FROM group_tables'),
    db.prepare('DELETE FROM players'),
    db.prepare('DELETE FROM teams'),
    db.prepare('DELETE FROM events'),
  ]);

  // 恢复数据
  const { teams, players, events } = backup.data;

  for (const t of teams || []) {
    await db.prepare('INSERT INTO teams (id, tournament_id, name, short_name) VALUES (?, ?, ?, ?)')
      .bind(t.id, t.tournament_id, t.name, t.short_name).run();
  }

  for (const p of players || []) {
    await db.prepare('INSERT INTO players (id, tournament_id, team_id, name, gender, rating) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(p.id, p.tournament_id, p.team_id, p.name, p.gender, p.rating).run();
  }

  for (const e of events || []) {
    await db.prepare('INSERT INTO events (id, tournament_id, key, title, event_type, best_of) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(e.id, e.tournament_id, e.key, e.title, e.event_type, e.best_of).run();
  }

  return c.json({ success: true, restored: { teams: teams?.length, players: players?.length, events: events?.length } });
});

export { app as settingsApi };
