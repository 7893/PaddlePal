import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Match = {
  id: number;
  match_order: number;
  time: string;
  event: string;
  p1: string;
  p2: string;
  score1: number;
  score2: number;
  games: string;
};

export const ConfirmPage: FC<{ matches: Match[]; userRole: string }> = ({ matches, userRole }) => {
  const isReferee = userRole === 'referee' || userRole === 'deputy_referee';

  return (
    <Layout title="成绩确认">
      <Nav current="/admin" />
      <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">✅ 成绩确认</h2>
          <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
        </div>

        {!isReferee ? (
          <Card>
            <div class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-2">🔒</div>
              <div>仅裁判长/副裁判长可确认成绩</div>
            </div>
          </Card>
        ) : matches.length === 0 ? (
          <Card>
            <div class="text-center py-8 text-gray-400">
              <div class="text-4xl mb-2">✨</div>
              <div>暂无待确认成绩</div>
            </div>
          </Card>
        ) : (
          <Card title={`待确认 (${matches.length}场)`}>
            <div class="mb-4">
              <button onclick="confirmAll()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                全部确认
              </button>
            </div>
            <div class="space-y-2">
              {matches.map(m => (
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id={m.id}>
                  <div class="flex-1">
                    <div class="text-xs text-gray-500">{m.event} · {m.time}</div>
                    <div class="font-medium">
                      <span class={m.score1 > m.score2 ? 'text-green-600' : ''}>{m.p1}</span>
                      <span class="mx-2 text-gray-400">{m.score1} : {m.score2}</span>
                      <span class={m.score2 > m.score1 ? 'text-green-600' : ''}>{m.p2}</span>
                    </div>
                    {m.games && <div class="text-xs text-gray-400 mt-1">{m.games}</div>}
                  </div>
                  <div class="flex gap-2">
                    <button onclick={`confirmOne(${m.id})`} class="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                      确认
                    </button>
                    <a href={`/score/${m.id}`} class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">
                      修改
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
function confirmOne(id) {
  fetch('/api/confirm/' + id, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success) {
        document.querySelector('[data-id="' + id + '"]').remove();
      } else {
        alert('错误: ' + res.error);
      }
    });
}

function confirmAll() {
  var ids = Array.from(document.querySelectorAll('[data-id]')).map(function(el) {
    return parseInt(el.dataset.id);
  });
  if (!ids.length) return;
  if (!confirm('确认全部 ' + ids.length + ' 场比赛成绩？')) return;

  fetch('/api/confirm/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchIds: ids })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) location.reload();
    else alert('错误: ' + res.error);
  });
}
`}} />
    </Layout>
  );
};
