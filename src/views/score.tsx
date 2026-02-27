import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge, Footer } from '../components/layout';

type Score = { l: number; r: number };
type MatchInfo = {
  id: number; pid: number; title: string; table_no: number; time: string;
  status: string; result: string; best_of: number;
  p1: string; p2: string; t1: string; t2: string;
  seat1: number; seat2: number; scores: Score[];
};

export const ScorePage: FC<{ match: MatchInfo }> = ({ match: m }) => (
  <Layout title={`记分 #${m.pid}`}>
    <Nav current="/score" title={`记分 · 场次 ${m.pid}`} />
    <div class="max-w-xl mx-auto px-6 py-8">
      {/* Match header */}
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-slate-500">{m.title} · {m.table_no}号台 · {m.time}</span>
          <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
            {m.status === 'finished' ? '已完赛' : m.status === 'playing' ? '进行中' : '待比赛'}
          </Badge>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-center flex-1">
            <div id="p1name" class="text-xl font-bold text-slate-800">{m.p1}</div>
            <div class="text-sm text-slate-400">{m.t1}</div>
          </div>
          <div class="text-slate-300 text-xl mx-4">VS</div>
          <div class="text-center flex-1">
            <div id="p2name" class="text-xl font-bold text-slate-800">{m.p2}</div>
            <div class="text-sm text-slate-400">{m.t2}</div>
          </div>
        </div>
      </div>

      {/* Live score display */}
      <div class="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-2xl p-8 mb-5 text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 20px 20px;"></div>
        <div class="relative flex items-center justify-center gap-10">
          <div class="text-center">
            <div id="gameL" class="text-6xl font-bold tabular-nums">0</div>
            <div class="text-sm text-emerald-300 mt-2">局</div>
          </div>
          <div class="text-slate-500 text-3xl">:</div>
          <div class="text-center">
            <div id="gameR" class="text-6xl font-bold tabular-nums">0</div>
            <div class="text-sm text-emerald-300 mt-2">局</div>
          </div>
        </div>
        <div id="currentGame" class="text-center mt-4 text-slate-400"></div>
      </div>

      {/* Quick score buttons */}
      <div id="quickScore" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5">
        <div class="text-sm text-slate-400 text-center mb-4">第 <span id="currentGameNo" class="font-semibold text-slate-600">1</span> 局 · 点击记分</div>
        <div class="flex gap-4">
          <button onclick="addPoint(0)" class="flex-1 py-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 active:from-blue-200 active:to-blue-300 transition text-blue-700 font-bold text-3xl touch-manipulation shadow-sm">
            <span id="pointL">0</span>
          </button>
          <button onclick="addPoint(1)" class="flex-1 py-10 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 active:from-red-200 active:to-red-300 transition text-red-700 font-bold text-3xl touch-manipulation shadow-sm">
            <span id="pointR">0</span>
          </button>
        </div>
        <div class="flex gap-3 mt-4">
          <button onclick="undoPoint()" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors">↩ 撤销</button>
          <button onclick="nextGame()" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors">下一局 →</button>
        </div>
      </div>

      {/* Quick input */}
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5">
        <div class="text-sm text-slate-400 mb-3">快捷输入（如 1109110811091103）</div>
        <div class="flex gap-3">
          <input type="text" id="quickInput" inputmode="numeric" pattern="[0-9]*" placeholder="连续输入所有局比分..."
            class="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
          <button type="button" onclick="parseQuickInput()" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25">解析</button>
        </div>
        <div id="quickInputPreview" class="text-sm text-slate-500 mt-3 hidden"></div>
      </div>

      {/* Detailed form */}
      <details class="bg-white rounded-2xl shadow-sm border border-slate-200 mb-5">
        <summary class="px-6 py-4 cursor-pointer text-sm text-slate-500 hover:bg-slate-50 rounded-t-2xl">详细比分编辑</summary>
        <form id="scoreForm" class="p-6 pt-2 border-t border-slate-100">
          <input type="hidden" name="match_id" value={m.id.toString()} />
          {Array.from({ length: m.best_of }, (_, i) => {
            const s = m.scores[i];
            return (
              <div class="flex items-center gap-4 mb-3">
                <span class="text-sm text-slate-400 w-16">第{i + 1}局</span>
                <input type="number" name={`s${i}_l`} value={s ? String(s.l === 65535 ? 0 : s.l) : '0'}
                  min="0" max="99" inputmode="numeric"
                  class="w-20 text-center border border-slate-200 rounded-xl py-2.5 text-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 score-input" />
                <span class="text-slate-300 text-lg">:</span>
                <input type="number" name={`s${i}_r`} value={s ? String(s.r === 65535 ? 0 : s.r) : '0'}
                  min="0" max="99" inputmode="numeric"
                  class="w-20 text-center border border-slate-200 rounded-xl py-2.5 text-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 score-input" />
              </div>
            );
          })}
        </form>
      </details>

      {/* Actions */}
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" id="autoNext" class="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
          保存后自动跳转下一场
        </label>
        <div class="flex gap-3">
          <button onclick="setStatus('playing')" class="flex-1 py-3.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-lg shadow-amber-500/25 touch-manipulation">
            ▶ 开始比赛
          </button>
          <button onclick="saveScore()" class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 touch-manipulation">
            ✓ 保存成绩
          </button>
        </div>
        <div class="flex gap-3">
          <button onclick="walkover(1)" class="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">左弃权</button>
          <button onclick="walkover(3)" class="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">双弃权</button>
          <button onclick="walkover(2)" class="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">右弃权</button>
        </div>
        <div class="flex gap-3">
          <a href={`/score/${m.pid - 1}`} class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm text-center hover:bg-slate-50 transition-colors">← 上一场</a>
          <a href="/schedule" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm text-center hover:bg-slate-50 transition-colors">赛程</a>
          <a href={`/score/${m.pid + 1}`} class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm text-center hover:bg-slate-50 transition-colors">下一场 →</a>
        </div>
      </div>
    </div>
    <Footer />

    <script dangerouslySetInnerHTML={{ __html: `
var matchId=${m.id}, bestOf=${m.best_of}, pid=${m.pid};
var scores=[], currentGame=0, history=[];
${JSON.stringify(m.scores.filter(s => s.l !== 65535 && s.r !== 65535))}.forEach(function(s,i){ scores[i]={l:s.l,r:s.r}; });
if(scores.length===0) scores[0]={l:0,r:0};
currentGame=scores.length-1;

function updateDisplay(){
  var gL=0,gR=0;
  scores.forEach(function(s){
    if(s.l>s.r&&s.l>=11&&(s.l-s.r>=2||s.l>=11)) gL++;
    else if(s.r>s.l&&s.r>=11&&(s.r-s.l>=2||s.r>=11)) gR++;
  });
  document.getElementById('gameL').textContent=gL;
  document.getElementById('gameR').textContent=gR;
  var cur=scores[currentGame]||{l:0,r:0};
  document.getElementById('pointL').textContent=cur.l;
  document.getElementById('pointR').textContent=cur.r;
  document.getElementById('currentGameNo').textContent=currentGame+1;
  document.getElementById('currentGame').textContent='当前: '+cur.l+' - '+cur.r;
  for(var i=0;i<bestOf;i++){
    var s=scores[i]||{l:0,r:0};
    var el=document.querySelector('[name="s'+i+'_l"]'); if(el)el.value=s.l;
    var er=document.querySelector('[name="s'+i+'_r"]'); if(er)er.value=s.r;
  }
  var p1=document.getElementById('p1name'),p2=document.getElementById('p2name');
  p1.className='text-xl font-bold '+(gL>gR?'text-emerald-600':'text-slate-800');
  p2.className='text-xl font-bold '+(gR>gL?'text-emerald-600':'text-slate-800');
}

function addPoint(side){
  history.push(JSON.stringify(scores));
  if(!scores[currentGame]) scores[currentGame]={l:0,r:0};
  if(side===0) scores[currentGame].l++; else scores[currentGame].r++;
  var s=scores[currentGame];
  if((s.l>=11||s.r>=11)&&Math.abs(s.l-s.r)>=2){
    if(currentGame<bestOf-1){ currentGame++; scores[currentGame]={l:0,r:0}; }
  }
  updateDisplay();
  if(navigator.vibrate) navigator.vibrate(10);
}

function undoPoint(){ if(history.length>0){ scores=JSON.parse(history.pop()); currentGame=Math.max(0,scores.length-1); updateDisplay(); } }
function nextGame(){ if(currentGame<bestOf-1){ currentGame++; if(!scores[currentGame]) scores[currentGame]={l:0,r:0}; updateDisplay(); } }

function calcResult(){
  var w1=0,w2=0;
  for(var i=0;i<bestOf;i++){
    var l=parseInt(document.querySelector('[name="s'+i+'_l"]').value)||0;
    var r=parseInt(document.querySelector('[name="s'+i+'_r"]').value)||0;
    scores[i]={l:l,r:r};
    if(l>r&&l>=11) w1++; else if(r>l&&r>=11) w2++;
  }
  updateDisplay();
}
document.querySelectorAll('.score-input').forEach(function(el){el.addEventListener('input',calcResult)});

function api(url,body){ return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()}); }

function saveScore(){
  var data=[];
  for(var i=0;i<bestOf;i++){ var s=scores[i]; if(s&&(s.l>0||s.r>0)) data.push({game:i+1,left:s.l,right:s.r}); }
  api('/api/admin/match/save',{match_id:matchId,scores:data}).then(function(res){
    if(res.success){
      if(navigator.vibrate) navigator.vibrate([50,50,50]);
      if(document.getElementById('autoNext').checked) location.href='/score/'+(pid+1);
      else location.reload();
    }else alert('Error: '+res.error);
  });
}

function setStatus(s){ api('/api/admin/match/status',{match_id:matchId,status:s}).then(function(res){ if(res.success) location.reload(); }); }

function walkover(side){
  if(!confirm((side==3?'双弃权':(side==1?'左':'右')+'方弃权')+'？')) return;
  api('/api/admin/match/walkover',{match_id:matchId,walkover_side:side}).then(function(res){ if(res.success) location.reload(); });
}

function parseQuickInput(){
  var input=document.getElementById('quickInput').value.replace(/\\D/g,'');
  if(input.length<4||input.length%4!==0){ alert('格式错误：请输入4的倍数位数字'); return; }
  var parsed=[];
  for(var i=0;i<input.length;i+=4) parsed.push({l:parseInt(input.substr(i,2),10),r:parseInt(input.substr(i+2,2),10)});
  scores=parsed.slice(0,bestOf); currentGame=scores.length-1; updateDisplay();
  var el=document.getElementById('quickInputPreview');
  el.textContent='✓ '+scores.map(function(s,i){return '第'+(i+1)+'局: '+s.l+'-'+s.r}).join(' | ');
  el.className='text-sm text-emerald-600 mt-3';
  if(navigator.vibrate) navigator.vibrate([30,30,30]);
}
document.getElementById('quickInput').addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault();parseQuickInput();} });
updateDisplay();
`}} />
  </Layout>
);

export const ScoreNotFound: FC<{ pid: string }> = ({ pid }) => (
  <Layout title="未找到">
    <Nav />
    <div class="max-w-xl mx-auto px-6 py-20 text-center">
      <div class="text-5xl mb-4 opacity-50">😕</div>
      <p class="text-slate-600 mb-4">未找到场次号: {pid}</p>
      <a href="/schedule" class="text-emerald-600 hover:text-emerald-700 font-medium">← 返回赛程</a>
    </div>
    <Footer />
  </Layout>
);
