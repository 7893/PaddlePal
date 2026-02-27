import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

export const ImportPlayersPage: FC<{ teamId?: number; teams: { id: number; name: string }[] }> = ({ teamId, teams }) => (
  <Layout title="批量导入选手">
    <Nav current="/import-players" title="批量导入选手" />
    <PageWrapper>
      <div class="max-w-2xl mx-auto">
        <Card title="选择队伍" class="mb-6">
          <select id="teamId" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">-- 个人参赛 --</option>
            {teams.map(t => <option value={t.id} selected={t.id === teamId}>{t.name}</option>)}
          </select>
        </Card>

        <Card title="输入选手名单" class="mb-6">
          <p class="text-sm text-slate-500 mb-3">每行一个选手姓名</p>
          <textarea id="names" rows={10} class="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="张三&#10;李四&#10;王五"></textarea>
          
          <div class="mt-4 flex gap-3">
            <button onclick="importPlayers()" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25">导入</button>
            <button onclick="clearText()" class="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">清空</button>
          </div>
        </Card>

        <Card title="CSV 导入">
          <p class="text-sm text-slate-500 mb-3">格式：姓名,性别,积分</p>
          <input type="file" id="csvFile" accept=".csv" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100" />
          <button onclick="importCSV()" class="mt-4 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">导入 CSV</button>
        </Card>
      </div>
    </PageWrapper>
    <Footer />

    <script dangerouslySetInnerHTML={{ __html: `
function importPlayers() {
  var teamId = document.getElementById('teamId').value || null;
  var names = document.getElementById('names').value.split('\\n').map(n => n.trim()).filter(n => n);
  if (names.length === 0) { alert('请输入选手名单'); return; }
  fetch('/api/import/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId: teamId ? parseInt(teamId) : null, players: names.map(n => ({ name: n })) }) })
    .then(r => r.json()).then(res => { if (res.success) { alert('已导入 ' + res.count + ' 名选手'); document.getElementById('names').value = ''; } else alert('错误: ' + res.error); });
}
function clearText() { document.getElementById('names').value = ''; }
function importCSV() {
  var file = document.getElementById('csvFile').files[0];
  if (!file) { alert('请选择文件'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var players = e.target.result.split('\\n').filter(l => l.trim()).map(l => { var p = l.split(','); return { name: p[0]?.trim(), gender: p[1]?.trim() || '', rating: parseInt(p[2]) || 0 }; }).filter(p => p.name);
    var teamId = document.getElementById('teamId').value || null;
    fetch('/api/import/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId: teamId ? parseInt(teamId) : null, players }) })
      .then(r => r.json()).then(res => { if (res.success) alert('已导入 ' + res.count + ' 名选手'); else alert('错误: ' + res.error); });
  };
  reader.readAsText(file);
}
`}} />
  </Layout>
);
