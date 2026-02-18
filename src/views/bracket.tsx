import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type BMatch = { id: number; round: number; position: number; p1: string; p2: string; t1?: string; t2?: string; result: string; status: string; winner: number; pid?: number };

export const BracketPage: FC<{ title: string; rounds: BMatch[][]; maxRound: number; eventKey?: string }> = ({ title, rounds, maxRound, eventKey }) => {
  const roundLabels = (ri: number) => {
    if (ri === maxRound - 1) return '决赛';
    if (ri === maxRound - 2) return '半决赛';
    if (ri === maxRound - 3) return '1/4决赛';
    if (ri === maxRound - 4) return '1/8决赛';
    return `第${ri + 1}轮`;
  };

  return (
    <Layout title={`对阵图 - ${title}`}>
      <Nav current="/results" />
      <div class="max-w-full mx-auto px-4 py-6 fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">🏆 {title}</h2>
            <p class="text-sm text-gray-500 mt-1">淘汰赛对阵图</p>
          </div>
          <div class="flex gap-2">
            <button onclick="toggleView()" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <span id="viewIcon">📊</span> 切换视图
            </button>
            {eventKey && <a href={`/results/${eventKey}`} class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">📋 成绩表</a>}
          </div>
        </div>

        {/* Bracket view */}
        <div id="bracketView" class="overflow-x-auto pb-4">
          <div class="flex gap-4 min-w-max">
            {rounds.map((ms, ri) => {
              const matchHeight = 72;
              const gap = Math.pow(2, ri) * matchHeight;
              const paddingTop = (gap - matchHeight) / 2;
              return (
                <div class="flex flex-col items-center relative" style={`padding-top:${paddingTop}px; gap:${gap - matchHeight}px`}>
                  <div class="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 whitespace-nowrap">
                    {roundLabels(ri)}
                  </div>
                  {ms.map((m, mi) => (
                    <div class="relative">
                      {/* Connector lines */}
                      {ri > 0 && (
                        <div class="absolute -left-4 top-1/2 w-4 h-px bg-slate-200" />
                      )}
                      {ri < maxRound - 1 && (
                        <div class="absolute -right-4 top-1/2 w-4 h-px bg-slate-200" />
                      )}
                      {/* Match card */}
                      <div class={`w-52 rounded-xl overflow-hidden shadow-sm transition-all ${
                        m.status === 'playing' ? 'ring-2 ring-red-400 shadow-red-100' :
                        m.status === 'finished' ? 'border border-slate-200' : 'border border-slate-100 opacity-70'
                      }`}>
                        {m.status === 'playing' && (
                          <div class="bg-red-500 text-white text-xs text-center py-0.5 font-medium">进行中</div>
                        )}
                        <a href={m.pid ? `/score/${m.pid}` : '#'} class="block">
                          <div class={`flex items-center justify-between px-3 py-2.5 ${
                            m.winner === 1 ? 'bg-emerald-50' : 'bg-white'
                          } ${m.p1 ? 'hover:bg-slate-50' : ''}`}>
                            <div class="flex items-center gap-2 min-w-0">
                              {m.winner === 1 && <span class="text-emerald-500 text-xs">✓</span>}
                              <span class={`truncate ${m.winner === 1 ? 'font-bold text-emerald-700' : m.p1 ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                                {m.p1 || '待定'}
                              </span>
                            </div>
                            {m.result && <span class="text-xs font-mono text-slate-400 ml-2">{m.result.split(':')[0]}</span>}
                          </div>
                          <div class="border-t border-slate-100" />
                          <div class={`flex items-center justify-between px-3 py-2.5 ${
                            m.winner === 2 ? 'bg-emerald-50' : 'bg-white'
                          } ${m.p2 ? 'hover:bg-slate-50' : ''}`}>
                            <div class="flex items-center gap-2 min-w-0">
                              {m.winner === 2 && <span class="text-emerald-500 text-xs">✓</span>}
                              <span class={`truncate ${m.winner === 2 ? 'font-bold text-emerald-700' : m.p2 ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                                {m.p2 || '待定'}
                              </span>
                            </div>
                            {m.result && <span class="text-xs font-mono text-slate-400 ml-2">{m.result.split(':')[1]}</span>}
                          </div>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {/* Champion */}
            {rounds.length > 0 && rounds[maxRound - 1]?.[0]?.winner && (
              <div class="flex flex-col justify-center">
                <div class="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-center shadow-lg shadow-amber-200">
                  <div class="text-3xl mb-2">🏆</div>
                  <div class="text-white font-bold">
                    {rounds[maxRound - 1][0].winner === 1 ? rounds[maxRound - 1][0].p1 : rounds[maxRound - 1][0].p2}
                  </div>
                  <div class="text-amber-100 text-xs mt-1">冠军</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List view (hidden by default) */}
        <div id="listView" class="hidden">
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500">轮次</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500">选手1</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-slate-500">比分</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500">选手2</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-slate-500">状态</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {rounds.flatMap((ms, ri) => ms.map(m => (
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 text-slate-500">{roundLabels(ri)}</td>
                    <td class={`px-4 py-3 ${m.winner === 1 ? 'font-bold text-emerald-600' : 'text-slate-700'}`}>
                      {m.p1 || <span class="text-slate-300">待定</span>}
                    </td>
                    <td class="px-4 py-3 text-center font-mono text-slate-600">{m.result || '-'}</td>
                    <td class={`px-4 py-3 ${m.winner === 2 ? 'font-bold text-emerald-600' : 'text-slate-700'}`}>
                      {m.p2 || <span class="text-slate-300">待定</span>}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                        {m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行' : '待赛'}
                      </Badge>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
function toggleView(){
  var b=document.getElementById('bracketView'), l=document.getElementById('listView'), i=document.getElementById('viewIcon');
  if(b.classList.contains('hidden')){
    b.classList.remove('hidden'); l.classList.add('hidden'); i.textContent='📊';
  }else{
    b.classList.add('hidden'); l.classList.remove('hidden'); i.textContent='🌲';
  }
}
`}} />
    </Layout>
  );
};
