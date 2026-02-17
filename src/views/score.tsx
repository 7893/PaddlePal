import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type Score = { l: number; r: number };
type MatchInfo = {
  id: number; pid: number; title: string; table_no: number; time: string;
  status: string; result: string; best_of: number;
  p1: string; p2: string; t1: string; t2: string;
  seat1: number; seat2: number; scores: Score[];
};

export const ScorePage: FC<{ match: MatchInfo }> = ({ match: m }) => (
  <Layout title={`记分 #${m.pid}`}>
    <Nav />
    <div class="max-w-xl mx-auto px-4 py-6 fade-in">
      {/* Match header */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">{m.title} · {m.table_no}号台 · {m.time}</span>
          <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
            {m.status === 'finished' ? '已完赛' : m.status === 'playing' ? '进行中' : '待比赛'}
          </Badge>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-center flex-1">
            <div class="text-xl font-bold text-gray-800">{m.p1}</div>
            <div class="text-xs text-gray-400">{m.t1}</div>
          </div>
          <div class="text-gray-300 text-lg mx-4">VS</div>
          <div class="text-center flex-1">
            <div class="text-xl font-bold text-gray-800">{m.p2}</div>
            <div class="text-xs text-gray-400">{m.t2}</div>
          </div>
        </div>
      </div>

      {/* Score form */}
      <form id="scoreForm" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
        <input type="hidden" name="match_id" value={m.id.toString()} />
        <div class="text-center mb-4">
          <span id="gameScore" class="text-3xl font-bold text-gray-800">0 - 0</span>
        </div>
        {Array.from({ length: m.best_of }, (_, i) => {
          const s = m.scores[i];
          return (
            <div class="flex items-center gap-3 mb-3">
              <span class="text-sm text-gray-400 w-14">第{i + 1}局</span>
              <input type="number" name={`s${i}_l`} value={s ? String(s.l === 65535 ? 0 : s.l) : '0'}
                min="0" max="99" class="w-16 text-center border border-gray-300 rounded-lg py-2 text-lg font-mono focus:ring-2 focus:ring-pp-500 focus:border-pp-500 score-input" />
              <span class="text-gray-300">:</span>
              <input type="number" name={`s${i}_r`} value={s ? String(s.r === 65535 ? 0 : s.r) : '0'}
                min="0" max="99" class="w-16 text-center border border-gray-300 rounded-lg py-2 text-lg font-mono focus:ring-2 focus:ring-pp-500 focus:border-pp-500 score-input" />
            </div>
          );
        })}
      </form>

      {/* Actions */}
      <div class="flex flex-col gap-2">
        <div class="flex gap-2">
          <button onclick="setStatus('playing')" class="flex-1 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition">开始比赛</button>
          <button onclick="saveScore()" class="flex-1 py-2.5 rounded-lg bg-pp-600 text-white font-medium hover:bg-pp-700 transition">保存成绩</button>
        </div>
        <div class="flex gap-2">
          <button onclick="walkover(1)" class="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition">左方弃权</button>
          <button onclick="walkover(3)" class="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition">双弃权</button>
          <button onclick="walkover(2)" class="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition">右方弃权</button>
        </div>
        <div class="flex gap-2">
          <a href={`/score/${m.pid - 1}`} class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm text-center hover:bg-gray-50 transition">← 上一场</a>
          <a href="/schedule" class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm text-center hover:bg-gray-50 transition">返回赛程</a>
          <a href={`/score/${m.pid + 1}`} class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm text-center hover:bg-gray-50 transition">下一场 →</a>
        </div>
      </div>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
var matchId = ${m.id}, bestOf = ${m.best_of}, pid = ${m.pid};

function calcResult() {
  var w1=0, w2=0;
  for (var i=0; i<bestOf; i++) {
    var l = parseInt(document.querySelector('[name="s'+i+'_l"]').value)||0;
    var r = parseInt(document.querySelector('[name="s'+i+'_r"]').value)||0;
    if (l>r && l>=11) w1++; else if (r>l && r>=11) w2++;
  }
  document.getElementById('gameScore').textContent = w1+' - '+w2;
  return {w1,w2};
}
document.querySelectorAll('.score-input').forEach(function(el){el.addEventListener('input',calcResult)});
calcResult();

function api(url, body) {
  return fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(r=>r.json());
}

function saveScore() {
  var scores=[];
  for (var i=0; i<bestOf; i++) {
    var l=parseInt(document.querySelector('[name="s'+i+'_l"]').value)||0;
    var r=parseInt(document.querySelector('[name="s'+i+'_r"]').value)||0;
    if (l>0||r>0) scores.push({game:i+1,left:l,right:r});
  }
  api('/api/admin/match/save',{match_id:matchId,scores:scores}).then(function(res){
    if(res.success){alert('Saved: '+res.result);location.reload();}else alert('Error: '+res.error);
  });
}

function setStatus(s) {
  api('/api/admin/match/status',{match_id:matchId,status:s}).then(function(res){
    if(res.success) location.reload();
  });
}

function walkover(side) {
  var msg=side==3?'双弃权':(side==1?'左':'右')+'方弃权';
  if(!confirm(msg+'？')) return;
  api('/api/admin/match/walkover',{match_id:matchId,walkover_side:side}).then(function(res){
    if(res.success){alert(res.result);location.reload();}
  });
}
`}} />
  </Layout>
);

export const ScoreNotFound: FC<{ pid: string }> = ({ pid }) => (
  <Layout title="未找到">
    <Nav />
    <div class="max-w-xl mx-auto px-4 py-20 text-center">
      <p class="text-4xl mb-4">😕</p>
      <p class="text-gray-600 mb-2">未找到场次号: {pid}</p>
      <a href="/schedule" class="text-pp-600 text-sm">← 返回赛程</a>
    </div>
  </Layout>
);
