import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type Match = {
  id: number; pid: number; tb: number; tm: string; gp: string; ev: string;
  nl: string; nr: string; tnl: string; tnr: string;
  result: string; score: { l: number; r: number }[];
};

export const LivePage: FC<{ playing: Match[]; upcoming: Match[] }> = ({ playing, upcoming }) => (
  <Layout title="实时比分">
    <Nav current="/live" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      {/* Connection status */}
      <div id="connStatus" class="hidden fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg"></div>

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span id="liveIndicator" class="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          正在进行
        </h2>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <span id="lastUpdate">--</span>
          <button onclick="forceRefresh()" class="p-1.5 hover:bg-gray-100 rounded-lg" title="刷新">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {playing.length === 0 ? (
        <div class="text-center py-12 text-gray-400 mb-8">
          <div class="text-4xl mb-3 opacity-50">🏓</div>
          <p>当前没有正在进行的比赛</p>
        </div>
      ) : (
        <div id="playingGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {playing.map(m => <LiveMatchCard match={m} />)}
        </div>
      )}

      <h2 class="text-lg font-bold text-gray-800 mb-4">⏳ 即将开始</h2>
      {upcoming.length === 0 ? (
        <div class="text-center py-12 text-gray-400">没有待进行的比赛</div>
      ) : (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-gray-500 font-medium">时间</th>
                <th class="px-4 py-3 text-left text-gray-500 font-medium">球台</th>
                <th class="px-4 py-3 text-left text-gray-500 font-medium">选手</th>
                <th class="px-4 py-3 text-left text-gray-500 font-medium">项目</th>
                <th class="px-4 py-3 text-center text-gray-500 font-medium w-20">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {upcoming.map(m => (
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-600">{m.tm}</td>
                  <td class="px-4 py-3 text-gray-600">{m.tb}号</td>
                  <td class="px-4 py-3">
                    <span class="font-medium text-gray-800">{m.nl}</span>
                    <span class="text-gray-400 mx-1">vs</span>
                    <span class="font-medium text-gray-800">{m.nr}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{m.gp}</td>
                  <td class="px-4 py-3 text-center">
                    <a href={`/score/${m.pid}`} class="text-pp-600 hover:underline text-xs">记分</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
var lastData = null;
var refreshInterval = null;
var isOnline = navigator.onLine;

function updateTime() {
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}

function showStatus(msg, type) {
  var el = document.getElementById('connStatus');
  el.textContent = msg;
  el.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg ' + 
    (type === 'error' ? 'bg-red-500 text-white' : type === 'success' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white');
  setTimeout(function() { el.className = 'hidden'; }, 3000);
}

async function fetchLive() {
  try {
    var res = await fetch('/api/live');
    var data = await res.json();
    if (JSON.stringify(data) !== JSON.stringify(lastData)) {
      lastData = data;
      updatePlayingGrid(data.playing);
      // Notify if new match started
      if (Notification.permission === 'granted' && data.playing.length > 0) {
        // Could add notification here
      }
    }
    updateTime();
    document.getElementById('liveIndicator').className = 'w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse';
  } catch (e) {
    document.getElementById('liveIndicator').className = 'w-2.5 h-2.5 bg-gray-300 rounded-full';
    if (!navigator.onLine) showStatus('离线模式', 'error');
  }
}

function updatePlayingGrid(matches) {
  var grid = document.getElementById('playingGrid');
  if (!grid) return;
  if (matches.length === 0) {
    grid.innerHTML = '<div class="col-span-2 text-center py-12 text-gray-400"><div class="text-4xl mb-3 opacity-50">🏓</div><p>当前没有正在进行的比赛</p></div>';
    return;
  }
  grid.innerHTML = matches.map(function(m) {
    var gL = m.score.filter(function(s){return s.l>s.r}).length;
    var gR = m.score.filter(function(s){return s.r>s.l}).length;
    var scoreStr = m.score.map(function(s){return s.l+':'+s.r}).join(' ');
    return '<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">' +
      '<div class="flex items-center justify-between mb-2">' +
        '<span class="text-xs text-gray-400">' + m.gp + ' · ' + m.tb + '号台</span>' +
        '<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50/80 text-rose-600 ring-1 ring-inset ring-rose-500/20">' +
          '<span class="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse mr-1.5"></span>进行中</span>' +
      '</div>' +
      '<div class="flex items-center justify-between">' +
        '<div class="text-center flex-1"><div class="font-bold text-gray-800">' + m.nl + '</div><div class="text-xs text-gray-400">' + (m.tnl||'') + '</div></div>' +
        '<div class="px-4"><div class="text-2xl font-bold text-gray-800">' + gL + ' - ' + gR + '</div>' +
          '<div class="text-xs text-gray-400 text-center">' + scoreStr + '</div></div>' +
        '<div class="text-center flex-1"><div class="font-bold text-gray-800">' + m.nr + '</div><div class="text-xs text-gray-400">' + (m.tnr||'') + '</div></div>' +
      '</div>' +
      '<a href="/score/' + m.pid + '" class="block mt-3 text-center text-xs text-pp-600 hover:underline">进入记分</a>' +
    '</div>';
  }).join('');
}

function forceRefresh() {
  fetchLive();
  showStatus('已刷新', 'success');
}

// Start polling
refreshInterval = setInterval(fetchLive, 5000);
fetchLive();

// Handle online/offline
window.addEventListener('online', function() { showStatus('已恢复连接', 'success'); fetchLive(); });
window.addEventListener('offline', function() { showStatus('网络已断开', 'error'); });

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  // Notification.requestPermission();
}
`}} />
  </Layout>
);

const LiveMatchCard: FC<{ match: Match }> = ({ match: m }) => {
  const gL = m.score.filter(s => s.l > s.r).length;
  const gR = m.score.filter(s => s.r > s.l).length;
  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-gray-400">{m.gp} · {m.tb}号台</span>
        <Badge color="red">
          <span class="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse mr-1.5"></span>
          进行中
        </Badge>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-center flex-1">
          <div class="font-bold text-gray-800">{m.nl}</div>
          <div class="text-xs text-gray-400">{m.tnl}</div>
        </div>
        <div class="px-4">
          <div class="text-2xl font-bold text-gray-800">
            {gL} - {gR}
          </div>
          <div class="text-xs text-gray-400 text-center">
            {m.score.map(s => `${s.l}:${s.r}`).join(' ')}
          </div>
        </div>
        <div class="text-center flex-1">
          <div class="font-bold text-gray-800">{m.nr}</div>
          <div class="text-xs text-gray-400">{m.tnr}</div>
        </div>
      </div>
      <a href={`/score/${m.pid}`} class="block mt-3 text-center text-xs text-pp-600 hover:underline">进入记分</a>
    </div>
  );
};
