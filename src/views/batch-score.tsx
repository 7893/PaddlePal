import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Match = { id: number; time: string; table_no: number; p1: string; p2: string; score1: number; score2: number };

export const BatchScorePage: FC<{ matches: Match[] }> = ({ matches }) => (
  <Layout title="批量录入">
    <Nav current="/batch-score" title="批量比分录入" />
    <PageWrapper>
      <Card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500">
                <th class="py-3 text-left font-semibold">时间</th>
                <th class="py-3 text-left font-semibold">球台</th>
                <th class="py-3 text-left font-semibold">选手A</th>
                <th class="py-3 text-center font-semibold w-28">比分</th>
                <th class="py-3 text-left font-semibold">选手B</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {matches.map((m) => (
                <tr data-id={m.id} class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 text-slate-500">{m.time}</td>
                  <td class="py-3">
                    <span class="px-2 py-1 bg-slate-100 rounded-lg text-slate-600">{m.table_no}号</span>
                  </td>
                  <td class="py-3 font-semibold text-slate-800">{m.p1}</td>
                  <td class="py-3">
                    <div class="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        class="w-12 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 score1"
                        min="0"
                        max="9"
                        value={m.score1 ?? ''}
                      />
                      <span class="text-slate-400">:</span>
                      <input
                        type="number"
                        class="w-12 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 score2"
                        min="0"
                        max="9"
                        value={m.score2 ?? ''}
                      />
                    </div>
                  </td>
                  <td class="py-3 font-semibold text-slate-800">{m.p2}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && <div class="text-center py-12 text-slate-400">暂无待录入比赛</div>}
        </div>

        <div class="mt-6 flex gap-3">
          <button
            onclick="saveAll()"
            class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25"
          >
            保存全部
          </button>
          <button
            onclick="clearAll()"
            class="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            清空
          </button>
        </div>
      </Card>
    </PageWrapper>
    <Footer />

    <script
      dangerouslySetInnerHTML={{
        __html: `
function saveAll() {
  var matches = [];
  document.querySelectorAll('tr[data-id]').forEach(function(row) {
    var id = parseInt(row.dataset.id);
    var s1 = parseInt(row.querySelector('.score1').value) || 0;
    var s2 = parseInt(row.querySelector('.score2').value) || 0;
    if (s1 > 0 || s2 > 0) matches.push({ id, score1: s1, score2: s2 });
  });
  if (matches.length === 0) { alert('没有需要保存的比分'); return; }
  fetch('/api/batch/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matches }) })
    .then(r => r.json()).then(res => { if (res.success) { alert('已保存 ' + res.count + ' 场比赛'); location.reload(); } });
}
function clearAll() { document.querySelectorAll('.score1, .score2').forEach(el => el.value = ''); }
`,
      }}
    />
  </Layout>
);
