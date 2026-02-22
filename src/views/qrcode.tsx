import type { FC } from 'hono/jsx';

export const QRCodePage: FC<{ url: string; title: string }> = ({ url, title }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>扫码入口 - {title}</title>
      <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { background: white; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 10px; font-size: 24px; }
        p { color: #666; margin-bottom: 30px; }
        #qr { margin: 0 auto; }
        .url { font-size: 12px; color: #999; margin-top: 20px; word-break: break-all; max-width: 300px; }
        .links { margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        .links a { padding: 10px 20px; background: #f0f0f0; border-radius: 10px; text-decoration: none; color: #333; font-size: 14px; }
        .links a:hover { background: #e0e0e0; }
      `}} />
    </head>
    <body>
      <div class="card">
        <h1>🏓 {title}</h1>
        <p>扫描二维码访问赛事系统</p>
        <canvas id="qr"></canvas>
        <div class="url">{url}</div>
        <div class="links">
          <a href="/">首页</a>
          <a href="/live">实时比分</a>
          <a href="/schedule">赛程</a>
          <a href="/my">我的比赛</a>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        QRCode.toCanvas(document.getElementById('qr'), '${url}', { width: 200, margin: 2 });
      `}} />
    </body>
  </html>
);
