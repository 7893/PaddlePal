import { Env } from './types';
import { json } from './utils';
import { handlePublicRoute } from './routes/public';
import { handleAdminRoute } from './routes/admin';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      // Public API routes
      const publicRoutes = [
        '/rawinfo', '/allplay', '/playing', '/toplay', '/oneplay',
        '/playscore', '/playrank', '/playtime', '/playcull',
        '/teammember', '/notice', '/member',
        '/InquiryPage', '/PlayinfoPage',
      ];
      if (publicRoutes.includes(path)) {
        return addCors(await handlePublicRoute(path, request, env));
      }

      // Admin API routes
      if (path.startsWith('/api/admin/') || path === '/RecordPage') {
        return addCors(await handleAdminRoute(path, request, env));
      }

      // Static assets handled by [assets] in wrangler.toml
      return new Response('Not Found', { status: 404 });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  },
};

function addCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(response.body, { status: response.status, headers });
}
