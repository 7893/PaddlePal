export class LiveDO {
  private clients = new Set<WebSocket>();

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgrade = req.headers.get('Upgrade');
      if (upgrade !== 'websocket') return new Response('Expected websocket', { status: 426 });
      const { 0: client, 1: server } = new WebSocketPair();
      server.accept();
      this.clients.add(server);
      server.addEventListener('close', () => this.clients.delete(server));
      return new Response(null, { status: 101, webSocket: client });
    }

    // Broadcast endpoint (called internally by Workers)
    if (url.pathname === '/broadcast' && req.method === 'POST') {
      const data = await req.text();
      for (const ws of this.clients) {
        try {
          ws.send(data);
        } catch {
          this.clients.delete(ws);
        }
      }
      return new Response('ok');
    }

    return new Response('Not found', { status: 404 });
  }
}
