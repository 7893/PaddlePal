import type { FC } from 'hono/jsx';

export const QRCodePage: FC<{ url: string; title: string }> = ({ url, title }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>扫码入口 - {title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', system-ui, sans-serif; 
          background: linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%); 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          padding: 20px;
        }
        .bg-pattern {
          position: fixed; inset: 0; opacity: 0.1;
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .glow { position: fixed; width: 400px; height: 400px; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .glow-1 { top: 20%; left: 20%; background: rgba(16,185,129,0.2); }
        .glow-2 { bottom: 20%; right: 20%; background: rgba(20,184,166,0.2); }
        .card { 
          background: rgba(255,255,255,0.95); 
          border-radius: 24px; 
          padding: 50px 40px; 
          text-align: center; 
          box-shadow: 0 25px 80px rgba(0,0,0,0.4);
          position: relative;
          z-index: 10;
          max-width: 400px;
          width: 100%;
        }
        .logo { width: 70px; height: 70px; background: linear-gradient(135deg, #34d399, #14b8a6); border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 10px 40px rgba(16,185,129,0.3); }
        .logo span { font-size: 32px; }
        h1 { color: #1e293b; margin-bottom: 8px; font-size: 26px; font-weight: 700; }
        p { color: #64748b; margin-bottom: 30px; font-size: 15px; }
        #qr { margin: 0 auto; border-radius: 12px; }
        .url { font-size: 13px; color: #94a3b8; margin-top: 25px; word-break: break-all; padding: 12px 16px; background: #f1f5f9; border-radius: 12px; }
        .links { margin-top: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .links a { 
          padding: 14px 20px; 
          background: linear-gradient(135deg, #f8fafc, #f1f5f9); 
          border-radius: 12px; 
          text-decoration: none; 
          color: #475569; 
          font-size: 14px; 
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }
        .links a:hover { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-color: #a7f3d0; color: #059669; }
      `,
        }}
      />
    </head>
    <body>
      <div class="bg-pattern"></div>
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="card">
        <div class="logo">
          <span>🏓</span>
        </div>
        <h1>{title}</h1>
        <p>扫描二维码访问赛事系统</p>
        <canvas id="qr"></canvas>
        <div class="url">{url}</div>
        <div class="links">
          <a href="/">🏠 首页</a>
          <a href="/live">📺 实时比分</a>
          <a href="/schedule">📅 赛程</a>
          <a href="/my">🏓 我的比赛</a>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        QRCode.toCanvas(document.getElementById('qr'), '${url}', { width: 220, margin: 2 });
      `,
        }}
      />
    </body>
  </html>
);
