// Big screen with team flags
export const BigScreenFlags = ({ matches }: { matches: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>实时比分 - 大屏</title>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', sans-serif; background: #1a1a2e; color: #fff; padding: 20px; }
        h1 { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-bottom: 30px; border-radius: 10px; font-size: 28px; }
        .matches { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 20px; }
        .match { background: #2d2d44; border-radius: 12px; padding: 20px; }
        .match-header { display: flex; justify-content: space-between; color: #888; font-size: 14px; margin-bottom: 15px; }
        .players { display: flex; align-items: center; justify-content: space-between; }
        .player { display: flex; align-items: center; flex: 1; }
        .player.right { flex-direction: row-reverse; }
        .flag { width: 60px; height: 40px; object-fit: contain; background: #444; border-radius: 4px; margin: 0 15px; }
        .flag-placeholder { width: 60px; height: 40px; background: #444; border-radius: 4px; margin: 0 15px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .name { font-size: 20px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .score { font-size: 36px; font-weight: bold; color: #ffd700; padding: 0 20px; min-width: 100px; text-align: center; }
        .table-no { background: #4a4a6a; border-radius: 4px; padding: 4px 12px; }
        .empty { text-align: center; padding: 50px; color: #666; font-size: 20px; }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => location.reload(), 10000);` }} />
    </head>
    <body>
      <h1>🏓 实时比分</h1>
      <div class="matches">
        {matches.map((m: any) => (
          <div class="match">
            <div class="match-header">
              <span>{m.event}</span>
              <span class="table-no">台 {m.tb}</span>
            </div>
            <div class="players">
              <div class="player">
                {m.flag1 ? <img class="flag" src={m.flag1} alt="" /> : <div class="flag-placeholder">🏳️</div>}
                <span class="name">{m.p1}</span>
              </div>
              <div class="score">{m.score || '0:0'}</div>
              <div class="player right">
                {m.flag2 ? <img class="flag" src={m.flag2} alt="" /> : <div class="flag-placeholder">🏳️</div>}
                <span class="name">{m.p2}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {matches.length === 0 && <div class="empty">暂无比赛</div>}
    </body>
  </html>
);

// Flag upload page
export const FlagUploadPage = ({ teams }: { teams: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>队旗管理</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
      <style>{`
        body { max-width: 900px; }
        .requirements { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .requirements h3 { margin-top: 0; color: #856404; }
        .requirements ul { margin: 10px 0; padding-left: 20px; }
        .team-row { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee; gap: 15px; }
        .team-flag { width: 80px; height: 50px; object-fit: contain; background: #f5f5f5; border-radius: 4px; }
        .team-flag-empty { width: 80px; height: 50px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; }
        .team-name { flex: 1; font-weight: bold; }
        .upload-form { display: flex; gap: 10px; align-items: center; }
        input[type="file"] { font-size: 12px; }
        button { padding: 5px 15px; }
        .success { color: green; }
        .error { color: red; }
      `}</style>
    </head>
    <body>
      <h1>🚩 队旗管理</h1>
      <p><a href="/admin">← 返回管理</a></p>
      
      <div class="requirements">
        <h3>📋 队旗上传要求</h3>
        <ul>
          <li><strong>格式：</strong>PNG 或 JPG</li>
          <li><strong>尺寸：</strong>建议 200×120 像素（宽高比 5:3）</li>
          <li><strong>大小：</strong>不超过 500KB</li>
          <li><strong>背景：</strong>建议使用透明背景 PNG</li>
          <li><strong>命名：</strong>系统自动以队伍ID命名</li>
        </ul>
      </div>

      <h2>队伍列表</h2>
      {teams.map((t: any) => (
        <div class="team-row">
          {t.flag ? 
            <img class="team-flag" src={t.flag} alt="" /> : 
            <div class="team-flag-empty">无</div>
          }
          <span class="team-name">{t.name}</span>
          <form class="upload-form" method="POST" action={`/api/flag/${t.id}`} enctype="multipart/form-data">
            <input type="file" name="flag" accept="image/png,image/jpeg" required />
            <button type="submit">上传</button>
          </form>
        </div>
      ))}
      {teams.length === 0 && <p>暂无队伍</p>}

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.upload-form').forEach(form => {
          form.onsubmit = async (e) => {
            e.preventDefault();
            const file = form.querySelector('input[type="file"]').files[0];
            if (!file) return;
            if (file.size > 500 * 1024) { alert('文件大小不能超过500KB'); return; }
            if (!['image/png', 'image/jpeg'].includes(file.type)) { alert('只支持PNG或JPG格式'); return; }
            const res = await fetch(form.action, { method: 'POST', body: file, headers: { 'Content-Type': file.type } });
            if (res.ok) { alert('上传成功'); location.reload(); } else { alert('上传失败'); }
          };
        });
      `}} />
    </body>
  </html>
);
