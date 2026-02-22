import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { LoginPage } from '../views/login';

type Bindings = {
  SESSIONS: KVNamespace;
  ADMIN_USER: string;
  ADMIN_PASS: string;
};

export const auth = new Hono<{ Bindings: Bindings }>();

// 生成随机 session ID
function generateSessionId(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
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
  const body = await c.req.parseBody();
  const username = body.username as string;
  const password = body.password as string;

  if (username === c.env.ADMIN_USER && password === c.env.ADMIN_PASS) {
    const sessionId = generateSessionId();
    await c.env.SESSIONS.put(sessionId, JSON.stringify({ user: username, role: 'admin' }), { expirationTtl: 86400 });
    setCookie(c, 'session', sessionId, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 86400 });
    return c.redirect('/admin');
  }

  return c.html(<LoginPage error="用户名或密码错误" />);
});

// 登出
auth.get('/logout', async (c) => {
  const sessionId = getCookie(c, 'session');
  if (sessionId) {
    await c.env.SESSIONS.delete(sessionId);
    deleteCookie(c, 'session', { path: '/' });
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
