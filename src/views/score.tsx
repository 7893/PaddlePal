import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge, Footer, Input, Button, EmptyState } from '../components/layout';

type Score = { l: number; r: number };
type MatchInfo = {
  id: number;
  pid: number;
  title: string;
  table_no: number;
  time: string;
  status: string;
  result: string;
  best_of: number;
  p1: string;
  p2: string;
  t1: string;
  t2: string;
  seat1: number;
  seat2: number;
  scores: Score[];
};

export const ScorePage: FC<{ match: MatchInfo }> = ({ match: m }) => (
  <Layout title={`记分 #${m.pid}`}>
    <Nav current="/score" title={`记分 · 场次 ${m.pid}`} />
    <div class="max-w-xl mx-auto px-6 py-8">
      {/* Match header */}
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-slate-500">
            {m.title} · {m.table_no}号台 · {m.time}
          </span>
          <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
            {m.status === 'finished' ? '已完赛' : m.status === 'playing' ? '进行中' : '待比赛'}
          </Badge>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-center flex-1">
            <div id="p1name" class="text-xl font-bold text-slate-800">
              {m.p1}
            </div>
            <div class="text-sm text-slate-400">{m.t1}</div>
          </div>
          <div class="text-slate-300 text-xl mx-4">VS</div>
          <div class="text-center flex-1">
            <div id="p2name" class="text-xl font-bold text-slate-800">
              {m.p2}
            </div>
            <div class="text-sm text-slate-400">{m.t2}</div>
          </div>
        </div>
      </div>

      {/* Live score display */}
      <div class="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-2xl p-8 mb-5 text-white relative overflow-hidden">
        <div
          class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 20px 20px;"
        ></div>
        <div class="relative flex items-center justify-center gap-10">
          <div class="text-center">
            <div id="gameL" class="text-6xl font-bold tabular-nums">
              0
            </div>
            <div class="text-sm text-emerald-300 mt-2">局</div>
          </div>
          <div class="text-slate-500 text-3xl">:</div>
          <div class="text-center">
            <div id="gameR" class="text-6xl font-bold tabular-nums">
              0
            </div>
            <div class="text-sm text-emerald-300 mt-2">局</div>
          </div>
        </div>
        <div id="currentGame" class="text-center mt-4 text-slate-400"></div>
      </div>

      {/* Quick score buttons (Mobile-First Blind Operation) */}
      <div id="quickScore" class="mb-5 relative">
        <div class="text-sm text-slate-400 text-center mb-4">
          第{' '}
          <span id="currentGameNo" class="font-semibold text-slate-600">
            1
          </span>{' '}
          局 · 全屏盲操区
        </div>
        <div class="flex gap-2">
          <button
            onclick="addPoint(0)"
            class="flex-1 py-24 rounded-3xl text-white font-bold text-7xl touch-manipulation shadow-xl active:scale-95 transition-transform font-mono"
            style="background-color: var(--color-player-left)"
          >
            <span id="pointL">0</span>
          </button>
          <button
            onclick="addPoint(1)"
            class="flex-1 py-24 rounded-3xl text-white font-bold text-7xl touch-manipulation shadow-xl active:scale-95 transition-transform font-mono"
            style="background-color: var(--color-player-right)"
          >
            <span id="pointR">0</span>
          </button>
        </div>
        <div class="flex gap-3 mt-4">
          <Button onclick="nextGame()" color="secondary" class="flex-1 py-4 text-lg">
            下一局 →
          </Button>
        </div>
      </div>

      {/* Floating Undo Anchor */}
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onclick="undoPoint()"
          class="bg-slate-800 text-white px-8 py-3 rounded-full shadow-2xl font-medium flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all opacity-90"
        >
          <span class="text-xl">↩</span> 撤销上一分
        </button>
      </div>

      {/* Quick input */}
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5">
        <div class="text-sm text-slate-400 mb-3">快捷输入（如 1109110811091103）</div>
        <div class="flex gap-3">
          <Input id="quickInput" type="text" placeholder="连续输入所有局比分..." class="flex-1 text-lg font-mono" />
          <Button onclick="parseQuickInput()">解析</Button>
        </div>
        <div id="quickInputPreview" class="text-sm text-slate-500 mt-3 hidden"></div>
      </div>

      {/* Detailed form */}
      <details class="bg-white rounded-2xl shadow-sm border border-slate-200 mb-5">
        <summary class="px-6 py-4 cursor-pointer text-sm text-slate-500 hover:bg-slate-50 rounded-t-2xl">
          详细比分编辑
        </summary>
        <form id="scoreForm" class="p-6 pt-2 border-t border-slate-100">
          <input type="hidden" name="match_id" value={m.id.toString()} />
          {Array.from({ length: m.best_of }, (_, i) => {
            const s = m.scores[i];
            return (
              <div class="flex items-center gap-4 mb-3">
                <span class="text-sm text-slate-400 w-16">第{i + 1}局</span>
                <input
                  type="number"
                  name={`s${i}_l`}
                  value={s ? String(s.l === 65535 ? 0 : s.l) : '0'}
                  min="0"
                  max="99"
                  class="w-20 text-center border border-slate-200 rounded-xl py-2.5 text-lg font-mono focus:ring-2 focus:ring-emerald-500 score-input"
                />
                <span class="text-slate-300 text-lg">:</span>
                <input
                  type="number"
                  name={`s${i}_r`}
                  value={s ? String(s.r === 65535 ? 0 : s.r) : '0'}
                  min="0"
                  max="99"
                  class="w-20 text-center border border-slate-200 rounded-xl py-2.5 text-lg font-mono focus:ring-2 focus:ring-emerald-500 score-input"
                />
              </div>
            );
          })}
        </form>
      </details>

      {/* Actions */}
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" id="autoNext" class="rounded border-slate-300 text-emerald-500" />
          保存后自动跳转下一场
        </label>
        <div class="flex gap-3">
          <button
            onclick="setStatus('playing')"
            class="flex-1 py-3.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 shadow-lg shadow-amber-500/25 touch-manipulation"
          >
            ▶ 开始比赛
          </button>
          <Button onclick="saveScore()" class="flex-1 py-3.5">
            ✓ 保存成绩
          </Button>
        </div>
        <div class="flex gap-3">
          <Button onclick="walkover(1)" color="danger" class="flex-1 text-sm py-2.5">
            左弃权
          </Button>
          <Button onclick="walkover(3)" color="danger" class="flex-1 text-sm py-2.5">
            双弃权
          </Button>
          <Button onclick="walkover(2)" color="danger" class="flex-1 text-sm py-2.5">
            右弃权
          </Button>
        </div>
        <div class="flex gap-3">
          <a
            href={`/score/${m.pid - 1}`}
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm text-center hover:bg-slate-50"
          >
            ← 上一场
          </a>
          <a
            href="/schedule"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm text-center hover:bg-slate-50"
          >
            赛程
          </a>
          <a
            href={`/score/${m.pid + 1}`}
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm text-center hover:bg-slate-50"
          >
            下一场 →
          </a>
        </div>
      </div>
    </div>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `var mid=${m.id},bo=${m.best_of},pid=${m.pid},scores=[],cg=0,hist=[];${JSON.stringify(m.scores.filter((s) => s.l !== 65535 && s.r !== 65535))}.forEach((s,i)=>scores[i]={l:s.l,r:s.r});if(!scores.length)scores[0]={l:0,r:0};cg=scores.length-1;function upd(){var gL=0,gR=0;scores.forEach(s=>{if(s.l>s.r&&s.l>=11&&(s.l-s.r>=2||s.l>=11))gL++;else if(s.r>s.l&&s.r>=11&&(s.r-s.l>=2||s.r>=11))gR++});document.getElementById('gameL').textContent=gL;document.getElementById('gameR').textContent=gR;var c=scores[cg]||{l:0,r:0};document.getElementById('pointL').textContent=c.l;document.getElementById('pointR').textContent=c.r;document.getElementById('currentGameNo').textContent=cg+1;document.getElementById('currentGame').textContent='当前: '+c.l+' - '+c.r;for(var i=0;i<bo;i++){var s=scores[i]||{l:0,r:0},el=document.querySelector('[name="s'+i+'_l"]'),er=document.querySelector('[name="s'+i+'_r"]');if(el)el.value=s.l;if(er)er.value=s.r}var p1=document.getElementById('p1name'),p2=document.getElementById('p2name');p1.className='text-xl font-bold '+(gL>gR?'text-emerald-600':'text-slate-800');p2.className='text-xl font-bold '+(gR>gL?'text-emerald-600':'text-slate-800')}function addPoint(side){hist.push(JSON.stringify(scores));if(!scores[cg])scores[cg]={l:0,r:0};if(side===0)scores[cg].l++;else scores[cg].r++;var s=scores[cg];if((s.l>=11||s.r>=11)&&Math.abs(s.l-s.r)>=2){if(cg<bo-1){cg++;scores[cg]={l:0,r:0}}}upd();if(navigator.vibrate)navigator.vibrate(10)}function undoPoint(){if(hist.length){scores=JSON.parse(hist.pop());cg=Math.max(0,scores.length-1);upd()}}function nextGame(){if(cg<bo-1){cg++;if(!scores[cg])scores[cg]={l:0,r:0};upd()}}function calcResult(){for(var i=0;i<bo;i++){var l=+document.querySelector('[name="s'+i+'_l"]').value||0,r=+document.querySelector('[name="s'+i+'_r"]').value||0;scores[i]={l,r}}upd()}document.querySelectorAll('.score-input').forEach(el=>el.addEventListener('input',calcResult));function api(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json())}function saveScore(){var d=[];for(var i=0;i<bo;i++){var s=scores[i];if(s&&(s.l>0||s.r>0))d.push({game:i+1,left:s.l,right:s.r})}api('/api/admin/match/save',{match_id:mid,scores:d}).then(r=>{if(r.success){if(navigator.vibrate)navigator.vibrate([50,50,50]);if(document.getElementById('autoNext').checked)location.href='/score/'+(pid+1);else location.reload()}else alert('Error: '+r.error)})}function setStatus(s){api('/api/admin/match/status',{match_id:mid,status:s}).then(r=>{if(r.success)location.reload()})}function walkover(side){if(!confirm((side==3?'双弃权':(side==1?'左':'右')+'方弃权')+'？'))return;api('/api/admin/match/walkover',{match_id:mid,walkover_side:side}).then(r=>{if(r.success)location.reload()})}function parseQuickInput(){var inp=document.getElementById('quickInput').value.replace(/\\D/g,'');if(inp.length<4||inp.length%4!==0){alert('格式错误');return}var p=[];for(var i=0;i<inp.length;i+=4)p.push({l:+inp.substr(i,2),r:+inp.substr(i+2,2)});scores=p.slice(0,bo);cg=scores.length-1;upd();var el=document.getElementById('quickInputPreview');el.textContent='✓ '+scores.map((s,i)=>'第'+(i+1)+'局: '+s.l+'-'+s.r).join(' | ');el.className='text-sm text-emerald-600 mt-3';if(navigator.vibrate)navigator.vibrate([30,30,30])}document.getElementById('quickInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();parseQuickInput()}});upd()`,
      }}
    />
  </Layout>
);

export const ScoreNotFound: FC<{ pid: string }> = ({ pid }) => (
  <Layout title="未找到">
    <Nav />
    <div class="max-w-xl mx-auto px-6 py-20 text-center">
      <EmptyState icon="😕" title={`未找到场次号: ${pid}`} />
      <a href="/schedule" class="text-emerald-600 hover:text-emerald-700 font-medium mt-4 inline-block">
        ← 返回赛程
      </a>
    </div>
    <Footer />
  </Layout>
);
