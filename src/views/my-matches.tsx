import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, EmptyState, Input, Button } from '../components/layout';
import { StatCard } from '../components/match';

type Match = { id: number; time: string; table_no: number; event: string; p1: string; p2: string; status: string };

const MatchItem: FC<{ m: Match; showStatus?: boolean }> = ({ m, showStatus }) => (
  <div class={`p-4 ${showStatus ? 'bg-slate-50' : ''} rounded-xl`}>
    <div class="flex justify-between items-center mb-2">
      <span class="font-mono text-emerald-600 font-semibold">{m.time}</span>
      <span class="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs">{m.table_no}号台</span>
    </div>
    <div class="text-sm text-slate-500 mb-1">{m.event}</div>
    <div class="font-semibold text-slate-800">
      {m.p1} vs {m.p2}
    </div>
  </div>
);

export const MyMatchesPage: FC<{ player: { id: number; name: string }; matches: Match[] }> = ({ player, matches }) => {
  const upcoming = matches.filter((m) => m.status === 'scheduled');
  const playing = matches.filter((m) => m.status === 'playing');
  const finished = matches.filter((m) => m.status === 'finished');

  return (
    <Layout title={`我的比赛 - ${player.name}`}>
      <Nav current="/my" title="我的比赛" />
      <PageWrapper>
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <span class="text-white text-3xl">🏓</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">{player.name}</h2>
            <p class="text-slate-500 mt-1">共 {matches.length} 场比赛</p>
          </div>
          {playing.length > 0 && (
            <div class="mb-5">
              <StatCard label="正在进行" value={`${playing[0].table_no}号台`} color="red" icon="🔴" />
              <div class="bg-white rounded-xl p-4 mt-2 border border-slate-200">
                <div class="text-sm text-slate-500 mb-1">{playing[0].event}</div>
                <div class="font-semibold text-slate-800">
                  {playing[0].p1} vs {playing[0].p2}
                </div>
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <Card title={`📅 即将开始 (${upcoming.length})`} class="mb-5">
              <div class="space-y-3">
                {upcoming.map((m) => (
                  <MatchItem m={m} showStatus />
                ))}
              </div>
            </Card>
          )}
          {finished.length > 0 && (
            <Card title={`✅ 已完成 (${finished.length})`}>
              <div class="space-y-2">
                {finished.slice(0, 10).map((m) => (
                  <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span class="text-slate-400 text-sm">{m.time}</span>
                    <span class="text-slate-700">
                      {m.p1} vs {m.p2}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {matches.length === 0 && <EmptyState icon="📭" title="暂无比赛安排" />}
          <div class="mt-8 text-center">
            <Button onclick="enableNotify()">🔔 开启比赛提醒</Button>
          </div>
        </div>
      </PageWrapper>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `var pid=${player.id};function enableNotify(){if(!('Notification'in window)){alert('浏览器不支持通知');return}Notification.requestPermission().then(p=>{if(p==='granted'){fetch('/api/notify/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player_id:pid,endpoint:'browser-'+Date.now()})});alert('已开启比赛提醒')}})}`,
        }}
      />
    </Layout>
  );
};

export const MyMatchesSearch: FC = () => (
  <Layout title="我的比赛">
    <Nav current="/my" title="我的比赛" />
    <PageWrapper>
      <div class="max-w-md mx-auto text-center">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
          <span class="text-white text-3xl">🔍</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">查找我的比赛</h2>
        <p class="text-slate-500 mb-6">输入姓名查看比赛安排</p>
        <form action="/my" method="get" class="bg-white rounded-2xl border border-slate-200 p-6">
          <Input name="name" placeholder="请输入姓名..." autofocus class="w-full text-lg py-3 mb-4" />
          <Button type="submit" class="w-full py-3">
            查找
          </Button>
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
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">选择选手</h2>
        <p class="text-slate-500 mb-6">点击姓名查看比赛安排</p>
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
          {players.length > 0 ? (
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((p) => (
                <a
                  href={`/my/${p.id}`}
                  class="p-4 bg-slate-50 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                >
                  <div class="font-semibold text-slate-800">{p.name}</div>
                  <div class="text-sm text-slate-400">{p.team}</div>
                </a>
              ))}
            </div>
          ) : (
            <div class="py-8 text-slate-400">暂无选手</div>
          )}
        </div>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
