import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Match = {
  id: number; time: string; table_no: number;
  event: string; p1: string; p2: string; status: string;
};

export const MyMatchesPage: FC<{ player: { id: number; name: string }; matches: Match[] }> = ({ player, matches }) => {
  const upcoming = matches.filter(m => m.status === 'scheduled');
  const playing = matches.filter(m => m.status === 'playing');
  const finished = matches.filter(m => m.status === 'finished');

  return (
    <Layout title={`我的比赛 - ${player.name}`}>
      <Nav current="/my" title="我的比赛" />
      <PageWrapper>
        <div class="max-w-2xl mx-auto">
          {/* Player info */}
          <div class="text-center mb-8">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <span class="text-white text-3xl">🏓</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">{player.name}</h2>
            <p class="text-slate-500 mt-1">共 {matches.length} 场比赛</p>
          </div>

          {/* Playing now */}
          {playing.length > 0 && (
            <div class="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-6 mb-5 text-white shadow-lg shadow-red-500/25">
              <div class="flex items-center gap-2 mb-4">
                <span class="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span class="font-semibold">正在进行</span>
              </div>
              {playing.map(m => (
                <div class="bg-white/10 rounded-xl p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-lg">{m.table_no}号台</span>
                    <span class="text-sm text-white/70">{m.event}</span>
                  </div>
                  <div class="text-lg font-medium">{m.p1} vs {m.p2}</div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <Card title={`📅 即将开始 (${upcoming.length})`} class="mb-5">
              <div class="space-y-3">
                {upcoming.map(m => (
                  <div class="p-4 bg-slate-50 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-mono text-emerald-600 font-semibold">{m.time}</span>
                      <span class="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs">{m.table_no}号台</span>
                    </div>
                    <div class="text-sm text-slate-500 mb-1">{m.event}</div>
                    <div class="font-semibold text-slate-800">{m.p1} vs {m.p2}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Finished */}
          {finished.length > 0 && (
            <Card title={`✅ 已完成 (${finished.length})`}>
              <div class="space-y-2">
                {finished.slice(0, 10).map(m => (
                  <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span class="text-slate-400 text-sm">{m.time}</span>
                    <span class="text-slate-700">{m.p1} vs {m.p2}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Empty state */}
          {matches.length === 0 && (
            <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div class="text-5xl mb-4 opacity-50">📭</div>
              <p class="text-slate-400">暂无比赛安排</p>
            </div>
          )}

          {/* Notify button */}
          <div class="mt-8 text-center">
            <button onclick="enableNotify()" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25">
              🔔 开启比赛提醒
            </button>
          </div>
        </div>
      </PageWrapper>
      <Footer />

      <script dangerouslySetInnerHTML={{ __html: `
var playerId = ${player.id};
function enableNotify() {
  if (!('Notification' in window)) { alert('浏览器不支持通知'); return; }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      fetch('/api/notify/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_id: playerId, endpoint: 'browser-' + Date.now() }) });
      alert('已开启比赛提醒');
    }
  });
}
`}} />
    </Layout>
  );
};

export const MyMatchesSearch: FC = () => (
  <Layout title="我的比赛">
    <Nav current="/my" title="我的比赛" />
    <PageWrapper>
      <div class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <span class="text-white text-3xl">🔍</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-800">查找我的比赛</h2>
          <p class="text-slate-500 mt-2">输入姓名查看比赛安排</p>
        </div>
        <form action="/my" method="get" class="bg-white rounded-2xl border border-slate-200 p-6">
          <input type="text" name="name" placeholder="请输入姓名..." autofocus
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4" />
          <button type="submit" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25">
            查找
          </button>
        </form>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);

export const PlayerSelectPage: FC<{ players: { id: number; name: string; team: string }[] }> = ({ players }) => (
  <Layout title="选择选手">
    <Nav current="/my" title="我的比赛" />
    <PageWrapper>
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-800">选择选手</h2>
          <p class="text-slate-500 mt-2">点击姓名查看比赛安排</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {players.map(p => (
              <a href={`/my/${p.id}`} class="p-4 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-colors text-center">
                <div class="font-semibold text-slate-800">{p.name}</div>
                <div class="text-sm text-slate-400">{p.team}</div>
              </a>
            ))}
          </div>
          {players.length === 0 && <div class="text-center py-8 text-slate-400">暂无选手</div>}
        </div>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
