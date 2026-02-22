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
            <div id="p1name" class="text-xl font-bold text-gray-800">{m.p1}</div>
            <div class="text-xs text-gray-400">{m.t1}</div>
          </div>
          <div class="text-gray-300 text-lg mx-4">VS</div>
          <div class="text-center flex-1">
            <div id="p2name" class="text-xl font-bold text-gray-800">{m.p2}</div>
            <div class="text-xs text-gray-400">{m.t2}</div>
          </div>
        </div>
      </div>

      {/* Live score display */}
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 mb-4 text-white">
        <div class="flex items-center justify-center gap-8">
          <div class="text-center">
            <div id="gameL" class="text-5xl font-bold tabular-nums">0</div>
            <div class="text-xs text-slate-400 mt-1">局</div>
          </div>
          <div class="text-slate-500 text-2xl">:</div>
          <div class="text-center">
            <div id="gameR" class="text-5xl font-bold tabular-nums">0</div>
            <div class="text-xs text-slate-400 mt-1">局</div>
          </div>
        </div>
        <div id="currentGame" class="text-center mt-4 text-slate-400 text-sm"></div>
      </div>

      {/* Quick score buttons for mobile */}
      <div id="quickScore" class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div class="text-xs text-gray-400 text-center mb-3">第 <span id="currentGameNo">1</span> 局 · 点击快速记分</div>
        <div class="flex gap-4">
          <button onclick="addPoint(0)" class="flex-1 py-8 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition text-blue-700 font-bold text-2xl touch-manipulation">
            <span id="pointL">0</span>
          </button>
          <button onclick="addPoint(1)" class="flex-1 py-8 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 transition text-red-700 font-bold text-2xl touch-manipulation">
            <span id="pointR">0</span>
          </button>
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick="undoPoint()" class="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50">↩ 撤销</button>
          <button onclick="nextGame()" class="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50">下一局 →</button>
        </div>
      </div>

      {/* Quick input box */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div class="text-xs text-gray-400 mb-2">快捷输入（如 1109110811091103）</div>
        <div class="flex gap-2">
          <input type="text" id="quickInput" inputmode="numeric" pattern="[0-9]*" placeholder="连续输入所有局比分..."
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:ring-2 focus:ring-pp-500 focus:border-pp-500" />
          <button type="button" onclick="parseQuickInput()" class="px-4 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700 active:bg-pp-800 transition">解析</button>
        </div>
        <div id="quickInputPreview" class="text-xs text-gray-500 mt-2 hidden"></div>
      </div>

      {/* Detailed score form */}
      <details class="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
        <summary class="px-5 py-3 cursor-pointer text-sm text-gray-500 hover:bg-gray-50">详细比分编辑</summary>
        <form id="scoreForm" class="p-5 pt-2 border-t border-gray-100">
          <input type="hidden" name="match_id" value={m.id.toString()} />
          {Array.from({ length: m.best_of }, (_, i) => {
            const s = m.scores[i];
            return (
              <div class="flex items-center gap-3 mb-3">
                <span class="text-sm text-gray-400 w-14">第{i + 1}局</span>
                <input type="number" name={`s${i}_l`} value={s ? String(s.l === 65535 ? 0 : s.l) : '0'}
                  min="0" max="99" inputmode="numeric" pattern="[0-9]*"
                  class="w-16 text-center border border-gray-300 rounded-lg py-2 text-lg font-mono focus:ring-2 focus:ring-pp-500 focus:border-pp-500 score-input" />
                <span class="text-gray-300">:</span>
                <input type="number" name={`s${i}_r`} value={s ? String(s.r === 65535 ? 0 : s.r) : '0'}
                  min="0" max="99" inputmode="numeric" pattern="[0-9]*"
                  class="w-16 text-center border border-gray-300 rounded-lg py-2 text-lg font-mono focus:ring-2 focus:ring-pp-500 focus:border-pp-500 score-input" />
              </div>
            );
          })}
        </form>
      </details>

      {/* Actions */}
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <input type="checkbox" id="autoNext" class="rounded border-gray-300" />
          保存后自动跳转下一场
        </label>
        <div class="flex gap-2">
          <button onclick="setStatus('playing')" class="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:bg-amber-700 transition touch-manipulation">
            ▶ 开始比赛
          </button>
          <button onclick="saveScore()" class="flex-1 py-3 rounded-xl bg-pp-600 text-white font-medium hover:bg-pp-700 active:bg-pp-800 transition touch-manipulation">
            ✓ 保存成绩
          </button>
        </div>
        <div class="flex gap-2">
          <button onclick="walkover(1)" class="flex-1 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 active:bg-red-100 transition">左弃权</button>
          <button onclick="walkover(3)" class="flex-1 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 active:bg-red-100 transition">双弃权</button>
          <button onclick="walkover(2)" class="flex-1 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 active:bg-red-100 transition">右弃权</button>
        </div>
        <div class="flex gap-2">
          <a href={`/score/${m.pid - 1}`} class="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm text-center hover:bg-gray-50 transition">← 上一场</a>
          <a href="/schedule" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm text-center hover:bg-gray-50 transition">赛程</a>
          <a href={`/score/${m.pid + 1}`} class="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm text-center hover:bg-gray-50 transition">下一场 →</a>
        </div>
      </div>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
var matchId=${m.id}, bestOf=${m.best_of}, pid=${m.pid};
var scores=[], currentGame=0, history=[];

// Initialize from existing scores
${JSON.stringify(m.scores.filter(s => s.l !== 65535 && s.r !== 65535))}.forEach(function(s,i){
  scores[i]={l:s.l,r:s.r};
});
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
  // Sync to form
  for(var i=0;i<bestOf;i++){
    var s=scores[i]||{l:0,r:0};
    var el=document.querySelector('[name="s'+i+'_l"]'); if(el)el.value=s.l;
    var er=document.querySelector('[name="s'+i+'_r"]'); if(er)er.value=s.r;
  }
  // Highlight leading player
  var p1=document.getElementById('p1name'),p2=document.getElementById('p2name');
  p1.className='text-xl font-bold '+(gL>gR?'text-green-600':'text-gray-800');
  p2.className='text-xl font-bold '+(gR>gL?'text-green-600':'text-gray-800');
}

function addPoint(side){
  history.push(JSON.stringify(scores));
  if(!scores[currentGame]) scores[currentGame]={l:0,r:0};
  if(side===0) scores[currentGame].l++;
  else scores[currentGame].r++;
  // Auto next game if won
  var s=scores[currentGame];
  if((s.l>=11||s.r>=11)&&Math.abs(s.l-s.r)>=2){
    if(currentGame<bestOf-1){
      currentGame++;
      scores[currentGame]={l:0,r:0};
    }
  }
  updateDisplay();
  // Vibrate feedback on mobile
  if(navigator.vibrate) navigator.vibrate(10);
}

function undoPoint(){
  if(history.length>0){
    scores=JSON.parse(history.pop());
    currentGame=Math.max(0,scores.length-1);
    updateDisplay();
  }
}

function nextGame(){
  if(currentGame<bestOf-1){
    currentGame++;
    if(!scores[currentGame]) scores[currentGame]={l:0,r:0};
    updateDisplay();
  }
}

function calcResult(){
  var w1=0,w2=0;
  for(var i=0;i<bestOf;i++){
    var l=parseInt(document.querySelector('[name="s'+i+'_l"]').value)||0;
    var r=parseInt(document.querySelector('[name="s'+i+'_r"]').value)||0;
    scores[i]={l:l,r:r};
    if(l>r&&l>=11) w1++; else if(r>l&&r>=11) w2++;
  }
  updateDisplay();
  return {w1:w1,w2:w2};
}
document.querySelectorAll('.score-input').forEach(function(el){el.addEventListener('input',calcResult)});

function api(url,body){
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()});
}

function saveScore(){
  var data=[];
  for(var i=0;i<bestOf;i++){
    var s=scores[i];
    if(s&&(s.l>0||s.r>0)) data.push({game:i+1,left:s.l,right:s.r});
  }
  api('/api/admin/match/save',{match_id:matchId,scores:data}).then(function(res){
    if(res.success){
      if(navigator.vibrate) navigator.vibrate([50,50,50]);
      // Auto advance to next match if checkbox is checked
      var autoNext=document.getElementById('autoNext');
      if(autoNext&&autoNext.checked){
        location.href='/admin/score/'+(pid+1);
      }else{
        location.reload();
      }
    }else alert('Error: '+res.error);
  });
}

function setStatus(s){
  api('/api/admin/match/status',{match_id:matchId,status:s}).then(function(res){
    if(res.success) location.reload();
  });
}

function walkover(side){
  var msg=side==3?'双弃权':(side==1?'左':'右')+'方弃权';
  if(!confirm(msg+'？')) return;
  api('/api/admin/match/walkover',{match_id:matchId,walkover_side:side}).then(function(res){
    if(res.success) location.reload();
  });
}

function parseQuickInput(){
  var input=document.getElementById('quickInput').value.replace(/\\D/g,'');
  if(input.length<4||input.length%4!==0){
    alert('格式错误：请输入4的倍数位数字，如 1109110811091103');
    return;
  }
  var parsed=[];
  for(var i=0;i<input.length;i+=4){
    var l=parseInt(input.substr(i,2),10);
    var r=parseInt(input.substr(i+2,2),10);
    parsed.push({l:l,r:r});
  }
  // Validate scores
  var valid=true;
  parsed.forEach(function(s,idx){
    var win=Math.max(s.l,s.r);
    var lose=Math.min(s.l,s.r);
    if(win<11||(win===11&&win-lose<2)||(win>11&&win-lose!==2)){
      if(!(s.l===0&&s.r===0)) valid=false;
    }
  });
  if(!valid&&!confirm('比分可能不合法，是否继续？')) return;
  // Apply to scores
  scores=parsed.slice(0,bestOf);
  currentGame=scores.length-1;
  updateDisplay();
  // Show preview
  var preview=scores.map(function(s,i){return '第'+(i+1)+'局: '+s.l+'-'+s.r}).join(' | ');
  var el=document.getElementById('quickInputPreview');
  el.textContent='✓ '+preview;
  el.className='text-xs text-green-600 mt-2';
  if(navigator.vibrate) navigator.vibrate([30,30,30]);
}

// Quick input on Enter key
document.getElementById('quickInput').addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();parseQuickInput();}
});

updateDisplay();
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
