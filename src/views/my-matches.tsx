import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Match = {
  id: number;
  time: string;
  table_no: number;
  event: string;
  p1: string;
  p2: string;
  status: string;
};

export const MyMatchesPage: FC<{ player: { id: number; name: string }; matches: Match[] }> = ({ player, matches }) => {
  const upcoming = matches.filter(m => m.status === 'scheduled');
  const playing = matches.filter(m => m.status === 'playing');
  const finished = matches.filter(m => m.status === 'finished');

  return (
    <Layout title={`我的比赛 - ${player.name}`}>
      <Nav current="/my" />
      <div class="max-w-2xl mx-auto px-4 py-6 fade-in">
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">🏓</div>
          <h2 class="text-xl font-bold text-gray-800">{player.name}</h2>
          <p class="text-sm text-gray-500">我的比赛</p>
        </div>

        {playing.length > 0 && (
          <Card title="🔴 正在进行" class="mb-4 border-red-200 bg-red-50">
            {playing.map(m => (
              <div class="py-3 border-b border-red-100 last:border-0">
                <div class="flex justify-between items-center">
                  <span class="text-red-600 font-bold">{m.table_no}号台</span>
                  <span class="text-sm text-gray-500">{m.event}</span>
                </div>
                <div class="mt-1 font-medium">{m.p1} vs {m.p2}</div>
              </div>
            ))}
          </Card>
        )}

        {upcoming.length > 0 && (
          <Card title={`📅 即将开始 (${upcoming.length})`} class="mb-4">
            {upcoming.map(m => (
              <div class="py-3 border-b border-gray-100 last:border-0">
                <div class="flex justify-between items-center">
                  <span class="font-mono text-pp-600">{m.time}</span>
                  <span class="text-sm text-gray-400">{m.table_no}号台</span>
                </div>
                <div class="text-sm text-gray-500">{m.event}</div>
                <div class="mt-1 font-medium">{m.p1} vs {m.p2}</div>
              </div>
            ))}
          </Card>
        )}

        {finished.length > 0 && (
          <Card title={`✅ 已完成 (${finished.length})`}>
            {finished.slice(0, 10).map(m => (
              <div class="py-2 border-b border-gray-100 last:border-0 text-sm">
                <span class="text-gray-400">{m.time}</span>
                <span class="mx-2">{m.p1} vs {m.p2}</span>
              </div>
            ))}
          </Card>
        )}

        {matches.length === 0 && (
          <Card>
            <div class="text-center py-8 text-gray-400">
              <div class="text-4xl mb-2">📭</div>
              <div>暂无比赛安排</div>
            </div>
          </Card>
        )}

        <div class="mt-6 text-center">
          <button onclick="enableNotify()" class="px-4 py-2 bg-pp-600 text-white rounded-lg text-sm hover:bg-pp-700">
            🔔 开启比赛提醒
          </button>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
var playerId = ${player.id};
function enableNotify() {
  if (!('Notification' in window)) {
    alert('浏览器不支持通知');
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      fetch('/api/notify/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, endpoint: 'browser-' + Date.now() })
      });
      alert('已开启比赛提醒');
      startPolling();
    }
  });
}

function startPolling() {
  setInterval(function() {
    fetch('/api/notify/upcoming/' + playerId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.matches && data.matches.length > 0) {
          var m = data.matches[0];
          new Notification('比赛即将开始', { body: m.time + ' ' + m.table_no + '号台: ' + m.p1 + ' vs ' + m.p2 });
        }
      });
  }, 60000);
}
`}} />
    </Layout>
  );
};

export const PlayerSelectPage: FC<{ players: { id: number; name: string; team: string }[] }> = ({ players }) => (
  <Layout title="选择选手">
    <Nav current="/my" />
    <div class="max-w-2xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">选择您的姓名</h2>
      <input type="text" id="search" placeholder="搜索选手..." class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" oninput="filter()" />
      <div id="list" class="space-y-2">
        {players.map(p => (
          <a href={`/my/${p.id}`} class="block p-3 bg-white border border-gray-200 rounded-lg hover:border-pp-300 hover:bg-pp-50 player-item" data-name={p.name.toLowerCase()}>
            <div class="font-medium">{p.name}</div>
            <div class="text-sm text-gray-400">{p.team || '个人'}</div>
          </a>
        ))}
      </div>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
function filter() {
  var q = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('.player-item').forEach(function(el) {
    el.style.display = el.dataset.name.includes(q) ? 'block' : 'none';
  });
}
`}} />
  </Layout>
);
