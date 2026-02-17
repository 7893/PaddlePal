import { Layout, Nav, Card, Button, Table, Th, Td, PageHeader, EmptyState } from '../components/layout';

// Flag upload management page
export const FlagUploadPage = ({ teams }: { teams: any[] }) => (
  <Layout title="队旗管理">
    <Nav current="/admin/flags" />
    <div class="max-w-4xl mx-auto px-8 py-10 fade-in">
      <PageHeader title="队旗管理" subtitle="上传和管理队伍旗帜" />
      
      <Card hover={false} class="mb-6">
        <div class="flex items-start gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
          <div class="text-2xl">📋</div>
          <div class="text-sm">
            <h4 class="font-medium text-amber-800 mb-1">上传要求</h4>
            <ul class="text-amber-700 space-y-0.5">
              <li>格式：PNG 或 JPG</li>
              <li>尺寸：建议 200×120 像素（宽高比 5:3）</li>
              <li>大小：不超过 500KB</li>
              <li>背景：建议使用透明背景 PNG</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="队伍列表" hover={false}>
        {teams.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th class="w-24">队旗</Th>
                <Th>队伍名称</Th>
                <Th class="w-48">操作</Th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t: any) => (
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <Td>
                    {t.flag ? (
                      <img src={t.flag} alt="" class="w-16 h-10 object-contain rounded bg-slate-100" />
                    ) : (
                      <div class="w-16 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-xs">无</div>
                    )}
                  </Td>
                  <Td class="font-medium text-slate-800">{t.name}</Td>
                  <Td>
                    <form class="upload-form flex items-center gap-2" data-team-id={t.id}>
                      <input 
                        type="file" 
                        name="flag" 
                        accept="image/png,image/jpeg" 
                        class="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer file:transition-colors"
                      />
                      <Button type="submit" size="sm" variant="secondary">上传</Button>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="🚩" title="暂无队伍" description="请先添加队伍" />
        )}
      </Card>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
      document.querySelectorAll('.upload-form').forEach(form => {
        form.onsubmit = async (e) => {
          e.preventDefault();
          const teamId = form.dataset.teamId;
          const file = form.querySelector('input[type="file"]').files[0];
          if (!file) { alert('请选择文件'); return; }
          if (file.size > 500 * 1024) { alert('文件大小不能超过500KB'); return; }
          if (!['image/png', 'image/jpeg'].includes(file.type)) { alert('只支持PNG或JPG格式'); return; }
          const res = await fetch('/api/flag/' + teamId, { method: 'POST', body: file, headers: { 'Content-Type': file.type } });
          if (res.ok) { alert('上传成功'); location.reload(); } else { alert('上传失败'); }
        };
      });
    `}} />
  </Layout>
);

// Big screen with team flags (standalone, no nav)
export const BigScreenFlags = ({ matches }: { matches: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>实时比分 - 大屏</title>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; min-height: 100vh; padding: 40px; }
        h1 { text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%); border: 1px solid rgba(16,185,129,0.3); margin-bottom: 40px; border-radius: 20px; font-size: 32px; font-weight: 600; letter-spacing: -0.02em; }
        .matches { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 24px; }
        .match { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; }
        .match-header { display: flex; justify-content: space-between; color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 20px; }
        .players { display: flex; align-items: center; justify-content: space-between; }
        .player { display: flex; align-items: center; flex: 1; }
        .player.right { flex-direction: row-reverse; }
        .flag { width: 64px; height: 40px; object-fit: contain; background: rgba(255,255,255,0.1); border-radius: 6px; margin: 0 16px; }
        .flag-placeholder { width: 64px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 6px; margin: 0 16px; display: flex; align-items: center; justify-content: center; font-size: 18px; opacity: 0.5; }
        .name { font-size: 20px; font-weight: 500; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .score { font-size: 42px; font-weight: 700; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding: 0 24px; min-width: 120px; text-align: center; }
        .table-no { background: rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 12px; font-weight: 500; }
        .empty { text-align: center; padding: 80px; color: rgba(255,255,255,0.4); font-size: 18px; }
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
