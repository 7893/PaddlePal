import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer } from '../components/layout';

type Match = {
  id: number;
  pid: number;
  tb: number;
  tm: string;
  gp: string;
  ev: string;
  nl: string;
  nr: string;
  tnl: string;
  tnr: string;
  result: string;
  score: { l: number; r: number }[];
};

type UpcomingMatch = {
  id: number;
  pid: number;
  tb: number;
  tm: string;
  gp: string;
  nl: string;
  nr: string;
};

export const LivePage: FC<{ playing: Match[]; upcoming: UpcomingMatch[] }> = ({ playing, upcoming }) => (
  <Layout title="实时比分">
    <Nav current="/live" title="实时比分" />
    <PageWrapper>
      {/* Connection status */}
      <div
        id="connStatus"
        class="hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg"
      ></div>

      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span id="liveIndicator" class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span class="text-lg font-semibold text-slate-800">正在进行</span>
          <span class="text-sm text-slate-400">({playing.length} 场)</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-slate-400">
          <span id="lastUpdate">--</span>
          <button onclick="forceRefresh()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="刷新">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {playing.length === 0 ? (
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center mb-10">
          <div class="text-5xl mb-4 opacity-50">🏓</div>
          <p class="text-slate-400">当前没有正在进行的比赛</p>
        </div>
      ) : (
        <div id="playingGrid" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {playing.map((m) => (
            <LiveMatchCard match={m} />
          ))}
        </div>
      )}

      <div class="flex items-center gap-3 mb-6">
        <span class="text-lg font-semibold text-slate-800">⏳ 即将开始</span>
        <span class="text-sm text-slate-400">({upcoming.length} 场)</span>
      </div>

      {upcoming.length === 0 ? (
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p class="text-slate-400">没有待进行的比赛</p>
        </div>
      ) : (
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold">时间</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold">球台</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold">选手</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold">项目</th>
                <th class="px-5 py-4 text-center text-slate-600 font-semibold w-24">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {upcoming.map((m) => (
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 text-slate-600 font-medium">{m.tm}</td>
                  <td class="px-5 py-4">
                    <span class="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">{m.tb}号</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="font-semibold text-slate-800">{m.nl}</span>
                    <span class="text-slate-400 mx-2">vs</span>
                    <span class="font-semibold text-slate-800">{m.nr}</span>
                  </td>
                  <td class="px-5 py-4 text-slate-500">{m.gp}</td>
                  <td class="px-5 py-4 text-center">
                    <a
                      href={`/score/${m.pid}`}
                      class="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      记分
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
    <Footer />

    <script
      dangerouslySetInnerHTML={{
        __html: `
var lastData = null;
function updateTime() {
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
function showStatus(msg, type) {
  var el = document.getElementById('connStatus');
  el.textContent = msg;
  el.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg ' + 
    (type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white');
  setTimeout(function() { el.className = 'hidden'; }, 3000);
}
async function fetchLive() {
  try {
    var res = await fetch('/api/live');
    var data = await res.json();
    if (JSON.stringify(data) !== JSON.stringify(lastData)) {
      lastData = data;
      updatePlayingGrid(data.playing);
    }
    updateTime();
    document.getElementById('liveIndicator').className = 'w-3 h-3 bg-red-500 rounded-full animate-pulse';
  } catch (e) {
    document.getElementById('liveIndicator').className = 'w-3 h-3 bg-slate-300 rounded-full';
  }
}
function updatePlayingGrid(matches) {
  var grid = document.getElementById('playingGrid');
  if (!grid) return;
  if (matches.length === 0) {
    grid.innerHTML = '<div class="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center"><div class="text-5xl mb-4 opacity-50">🏓</div><p class="text-slate-400">当前没有正在进行的比赛</p></div>';
    return;
  }
  grid.innerHTML = matches.map(function(m) {
    var gL = m.score.filter(function(s){return s.l>s.r}).length;
    var gR = m.score.filter(function(s){return s.r>s.l}).length;
    var scoreStr = m.score.map(function(s){return s.l+':'+s.r}).join(' ');
    return '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-lg">' +
      '<div class="flex items-center justify-between mb-4">' +
        '<span class="text-sm text-slate-500">' + m.gp + ' · ' + m.tb + '号台</span>' +
        '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">' +
          '<span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>进行中</span>' +
      '</div>' +
      '<div class="flex items-center justify-between">' +
        '<div class="text-center flex-1"><div class="text-lg font-bold text-slate-800">' + m.nl + '</div><div class="text-sm text-slate-400">' + (m.tnl||'') + '</div></div>' +
        '<div class="px-6"><div class="text-4xl font-bold text-slate-800">' + gL + ' - ' + gR + '</div>' +
          '<div class="text-sm text-slate-400 text-center mt-1">' + scoreStr + '</div></div>' +
        '<div class="text-center flex-1"><div class="text-lg font-bold text-slate-800">' + m.nr + '</div><div class="text-sm text-slate-400">' + (m.tnr||'') + '</div></div>' +
      '</div>' +
      '<a href="/score/' + m.pid + '" class="block mt-4 text-center py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors">进入记分</a>' +
    '</div>';
  }).join('');
}
function forceRefresh() { fetchLive(); showStatus('已刷新', 'success'); }
setInterval(fetchLive, 5000);
fetchLive();
window.addEventListener('online', function() { showStatus('已恢复连接', 'success'); fetchLive(); });
window.addEventListener('offline', function() { showStatus('网络已断开', 'error'); });
`,
      }}
    />
  </Layout>
);

const LiveMatchCard: FC<{ match: Match }> = ({ match: m }) => {
  const gL = m.score.filter((s) => s.l > s.r).length;
  const gR = m.score.filter((s) => s.r > s.l).length;
  return (
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-slate-500">
          {m.gp} · {m.tb}号台
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
          <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          进行中
        </span>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-center flex-1">
          <div class="text-lg font-bold text-slate-800">{m.nl}</div>
          <div class="text-sm text-slate-400">{m.tnl}</div>
        </div>
        <div class="px-6">
          <div class="text-4xl font-bold text-slate-800">
            {gL} - {gR}
          </div>
          <div class="text-sm text-slate-400 text-center mt-1">{m.score.map((s) => `${s.l}:${s.r}`).join(' ')}</div>
        </div>
        <div class="text-center flex-1">
          <div class="text-lg font-bold text-slate-800">{m.nr}</div>
          <div class="text-sm text-slate-400">{m.tnr}</div>
        </div>
      </div>
      <a
        href={`/score/${m.pid}`}
        class="block mt-4 text-center py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors"
      >
        进入记分
      </a>
    </div>
  );
};
