import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { LoginPage } from '../views/login';

type Bindings = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ADMIN_USER: string;
  ADMIN_PASS: string;
};

export const auth = new Hono<{ Bindings: Bindings }>();

// Role permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  referee: ['admin', 'draw', 'schedule', 'control', 'score', 'export', 'users'],
  deputy_referee: ['admin', 'draw', 'schedule', 'control', 'score', 'export'],
  scheduler: ['admin', 'draw', 'schedule', 'export'],
  recorder: ['admin', 'score', 'control'],
  umpire: ['score'],
  public: [],
};

export function hasPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// 登录页面
auth.get('/login', async (c) => {
  const sessionId = getCookie(c, 'session');
  if (sessionId) {
    const session = await c.env.SESSIONS.get(sessionId);
    if (session) return c.redirect('/admin');
  }
  return c.html(<LoginPage />);
});

// 登录处理
auth.post('/login', async (c) => {
  const db = c.env.DB;
  const body = await c.req.parseBody();
  const username = body.username as string;
  const password = body.password as string;

  // Check database
  const user = await db.prepare('SELECT id, username, password_hash, role, name FROM users WHERE username = ?')
    .bind(username).first();

  let validUser: { id: number; username: string; role: string; name: string } | null = null;

  if (user && user.password_hash === password) {
    validUser = { id: user.id as number, username: user.username as string, role: user.role as string, name: (user.name as string) || username };
  } else if (username === c.env.ADMIN_USER && password === c.env.ADMIN_PASS) {
    validUser = { id: 0, username: 'admin', role: 'referee', name: '管理员' };
  }

  if (!validUser) {
    return c.html(<LoginPage error="用户名或密码错误" />);
  }

  const sessionId = crypto.randomUUID();
  await c.env.SESSIONS.put(sessionId, JSON.stringify(validUser), { expirationTtl: 86400 });
  setCookie(c, 'session', sessionId, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 86400 });
  setCookie(c, 'logged_in', '1', { path: '/', httpOnly: false, secure: true, sameSite: 'Lax', maxAge: 86400 });
  return c.redirect('/admin');
});

// 登出
auth.get('/logout', async (c) => {
  const sessionId = getCookie(c, 'session');
  if (sessionId) {
    await c.env.SESSIONS.delete(sessionId);
    deleteCookie(c, 'session', { path: '/' });
    deleteCookie(c, 'logged_in', { path: '/' });
  }
  return c.redirect('/');
});

// 认证中间件
export async function requireAuth(c: any, next: () => Promise<void>) {
  const sessionId = getCookie(c, 'session');
  if (!sessionId) return c.redirect('/login');

  const session = await c.env.SESSIONS.get(sessionId);
  if (!session) {
    deleteCookie(c, 'session', { path: '/' });
    return c.redirect('/login');
  }

  c.set('user', JSON.parse(session));
  await next();
}

// 权限中间件
export function requirePermission(permission: string) {
  return async (c: any, next: () => Promise<void>) => {
    const user = c.get('user');
    if (!user || !hasPermission(user.role, permission)) {
      return c.text('权限不足', 403);
    }
    await next();
  };
}

export { ROLE_PERMISSIONS };
