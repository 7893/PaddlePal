import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

export const ImportPlayersPage: FC<{ teamId?: number; teams: { id: number; name: string }[] }> = ({ teamId, teams }) => (
  <Layout title="批量导入选手">
    <Nav current="/admin" />
    <div class="max-w-2xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">📥 批量导入选手</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      <Card title="选择队伍" class="mb-4">
        <select id="teamId" class="w-full border border-gray-300 rounded-lg px-3 py-2">
          <option value="">-- 个人参赛 --</option>
          {teams.map(t => <option value={t.id} selected={t.id === teamId}>{t.name}</option>)}
        </select>
      </Card>

      <Card title="输入选手名单">
        <p class="text-sm text-gray-500 mb-2">每行一个选手姓名</p>
        <textarea id="names" rows={10} class="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm" placeholder="张三&#10;李四&#10;王五"></textarea>
        
        <div class="mt-4 flex gap-2">
          <button onclick="importPlayers()" class="px-4 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">导入</button>
          <button onclick="clearText()" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">清空</button>
        </div>
      </Card>

      <Card title="CSV 导入" class="mt-4">
        <p class="text-sm text-gray-500 mb-2">格式：姓名,性别,积分</p>
        <input type="file" id="csvFile" accept=".csv" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <button onclick="importCSV()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">导入 CSV</button>
      </Card>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
function importPlayers() {
  var teamId = document.getElementById('teamId').value || null;
  var names = document.getElementById('names').value.split('\\n').map(function(n) { return n.trim(); }).filter(function(n) { return n; });

  if (names.length === 0) { alert('请输入选手名单'); return; }

  fetch('/api/import/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId: teamId ? parseInt(teamId) : null, players: names.map(function(n) { return { name: n }; }) })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) {
      alert('已导入 ' + res.count + ' 名选手');
      document.getElementById('names').value = '';
    } else {
      alert('错误: ' + res.error);
    }
  });
}

function clearText() {
  document.getElementById('names').value = '';
}

function importCSV() {
  var file = document.getElementById('csvFile').files[0];
  if (!file) { alert('请选择文件'); return; }

  var reader = new FileReader();
  reader.onload = function(e) {
    var lines = e.target.result.split('\\n');
    var players = [];
    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts[0] && parts[0].trim()) {
        players.push({ name: parts[0].trim(), gender: parts[1]?.trim() || '', rating: parseInt(parts[2]) || 0 });
      }
    }

    var teamId = document.getElementById('teamId').value || null;
    fetch('/api/import/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: teamId ? parseInt(teamId) : null, players: players })
    }).then(function(r) { return r.json(); }).then(function(res) {
      if (res.success) alert('已导入 ' + res.count + ' 名选手');
      else alert('错误: ' + res.error);
    });
  };
  reader.readAsText(file);
}
`}} />
  </Layout>
);
