import { DurableObject } from 'cloudflare:workers';

export class LiveDO extends DurableObject {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/ws/live') {
      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (url.pathname === '/broadcast' && req.method === 'POST') {
      const data = await req.text();
      for (const ws of this.ctx.getWebSockets()) {
        try {
          ws.send(data);
        } catch {
          /* ignore closed */
        }
      }
      return new Response('ok');
    }

    return new Response('Not found', { status: 404 });
  }

  webSocketMessage() {}
  webSocketClose() {}
}
