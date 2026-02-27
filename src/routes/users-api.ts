import { Hono } from 'hono';
import { hasPermission } from './auth';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 获取用户列表
app.get('/api/users', async (c) => {
  const user = (c as any).get('user');
  if (!user || !hasPermission(user.role, 'users')) {
    return c.json({ error: '权限不足' }, 403);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT id, username, role, name, created_at FROM users ORDER BY id'
  ).all();

  return c.json({ users: results });
});

// 创建用户
app.post('/api/users', async (c) => {
  const user = (c as any).get('user');
  if (!user || !hasPermission(user.role, 'users')) {
    return c.json({ error: '权限不足' }, 403);
  }

  const { username, password, role, name } = await c.req.json<{
    username: string;
    password: string;
    role: string;
    name: string;
  }>();

  if (!username || !password) {
    return c.json({ error: '用户名和密码必填' }, 400);
  }

  try {
    await c.env.DB.prepare('INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)')
      .bind(username, password, role || 'recorder', name || username)
      .run();
    return c.json({ success: true });
  } catch {
    return c.json({ error: '用户名已存在' }, 400);
  }
});

// 更新用户
app.put('/api/users/:id', async (c) => {
  const user = (c as any).get('user');
  if (!user || !hasPermission(user.role, 'users')) {
    return c.json({ error: '权限不足' }, 403);
  }

  const id = c.req.param('id');
  const { password, role, name } = await c.req.json<{
    password?: string;
    role?: string;
    name?: string;
  }>();

  const updates: string[] = [];
  const params: any[] = [];

  if (password) {
    updates.push('password_hash = ?');
    params.push(password);
  }
  if (role) {
    updates.push('role = ?');
    params.push(role);
  }
  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (updates.length === 0) return c.json({ error: '无更新内容' }, 400);

  params.push(id);
  await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();

  return c.json({ success: true });
});

// 删除用户
app.delete('/api/users/:id', async (c) => {
  const user = (c as any).get('user');
  if (!user || !hasPermission(user.role, 'users')) {
    return c.json({ error: '权限不足' }, 403);
  }

  const id = c.req.param('id');

  // 不能删除自己
  if (user.id === parseInt(id)) {
    return c.json({ error: '不能删除自己' }, 400);
  }

  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export { app as usersApi };
