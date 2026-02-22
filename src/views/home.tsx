import type { FC } from 'hono/jsx';
import { Badge } from '../components/layout';

type EventInfo = {
  key: string; title: string; event: string; plays: number;
  finish: number; progress: string; beg_time: string; end_time: string;
};

export const HomePage: FC<{
  info: string; addr: string; date: string; tables: number; days: number;
  events: EventInfo[];
}> = ({ info, addr, date, tables, days, events }) => (
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{info || '乒乓球赛事'} - 拍档 PaddlePal</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{
        __html: `tailwind.config={theme:{extend:{colors:{
          emerald:{50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857'},
          teal:{400:'#2dd4bf',500:'#14b8a6'},
          slate:{50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a'}
        },fontFamily:{sans:['Inter','Noto Sans SC','system-ui','sans-serif']}}}}` 
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
    </head>
    <body class="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <div class="relative bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 overflow-hidden">
        {/* Background effects */}
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 32px 32px;"></div>
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        
        {/* Nav */}
        <nav class="relative z-10 border-b border-white/10">
          <div class="max-w-7xl mx-auto px-6">
            <div class="flex items-center justify-between h-16">
              <a href="/" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span class="text-white text-lg">🏓</span>
                </div>
                <span class="text-xl font-semibold text-white tracking-tight">拍档</span>
              </a>
              <div class="hidden md:flex items-center gap-1">
                <a href="/live" class="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">实时比分</a>
                <a href="/schedule" class="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">赛程</a>
                <a href="/events" class="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">项目</a>
                <a href="/stats" class="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">统计</a>
                <a href="/my" class="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">我的比赛</a>
                <a href="/admin" class="admin-only px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-colors" style="display:none">管理后台</a>
              </div>
              <div class="flex items-center gap-3">
                <div id="user-info" class="hidden items-center gap-3">
                  <span class="text-sm text-white/70">👤 管理员</span>
                  <a href="/logout" class="text-sm text-white/50 hover:text-red-400 transition-colors">退出</a>
                </div>
                <a href="/login" id="login-btn" class="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg backdrop-blur-sm border border-white/20 transition-all">登录</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div class="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div class="flex items-center gap-3 mb-6">
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              赛事进行中
            </span>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            {info || '乒乓球锦标赛'}
          </h1>
          <div class="flex flex-wrap gap-6 text-white/60 mb-10">
            {addr && (
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{addr}</span>
              </div>
            )}
            {date && (
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>{date}</span>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div class="text-3xl font-bold text-white mb-1">{events.length}</div>
              <div class="text-sm text-white/50">比赛项目</div>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div class="text-3xl font-bold text-white mb-1">{tables}</div>
              <div class="text-sm text-white/50">比赛球台</div>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div class="text-3xl font-bold text-white mb-1">{days}</div>
              <div class="text-sm text-white/50">比赛天数</div>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div class="text-3xl font-bold text-white mb-1">{events.reduce((a, e) => a + e.plays, 0)}</div>
              <div class="text-sm text-white/50">总场次</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div class="flex flex-wrap gap-4">
            <a href="/live" class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              实时比分
            </a>
            <a href="/schedule" class="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 backdrop-blur-sm transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              赛程安排
            </a>
            <a href="/bigscreen" class="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 backdrop-blur-sm transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              大屏展示
            </a>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div class="py-16">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-end justify-between mb-10">
            <div>
              <h2 class="text-2xl font-bold text-slate-800 mb-2">比赛项目</h2>
              <p class="text-slate-500">共 {events.length} 个项目，{events.filter(e => e.finish === e.plays && e.plays > 0).length} 个已完赛</p>
            </div>
            <a href="/events" class="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
              查看全部
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(ev => (
              <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100">
                <div class="flex items-start justify-between mb-4">
                  <h3 class="font-semibold text-slate-800">{ev.title}</h3>
                  <Badge color={ev.finish === ev.plays && ev.plays > 0 ? 'green' : ev.finish > 0 ? 'yellow' : 'gray'}>
                    {ev.finish === ev.plays && ev.plays > 0 ? '已完赛' : ev.finish > 0 ? '进行中' : '未开始'}
                  </Badge>
                </div>
                <div class="mb-4">
                  <div class="flex justify-between text-sm text-slate-500 mb-2">
                    <span>完成 {ev.finish} / {ev.plays} 场</span>
                    <span class="font-medium text-slate-700">{ev.progress}</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all" style={`width:${ev.progress}`}></div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <a href={`/results/${ev.key}`} class="flex-1 text-center py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium">成绩</a>
                  <a href={`/standings/${ev.key}`} class="flex-1 text-center py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">积分榜</a>
                  <a href={`/bracket/${ev.key}`} class="flex-1 text-center py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">对阵图</a>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div class="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div class="text-5xl mb-4 opacity-50">🏓</div>
                <p class="text-slate-400">暂无赛事项目</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer class="bg-slate-900 text-white/60 py-12">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span class="text-white text-lg">🏓</span>
              </div>
              <div>
                <div class="text-white font-semibold">拍档 PaddlePal</div>
                <div class="text-sm">专业乒乓球赛事管理系统</div>
              </div>
            </div>
            <div class="flex gap-6 text-sm">
              <a href="/help" class="hover:text-white transition-colors">帮助</a>
              <a href="/about" class="hover:text-white transition-colors">关于</a>
              <a href="/qr" class="hover:text-white transition-colors">扫码入口</a>
            </div>
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  if(document.cookie.indexOf('logged_in=')!==-1){
    var btn=document.getElementById('login-btn');
    var info=document.getElementById('user-info');
    if(btn)btn.style.display='none';
    if(info)info.style.display='flex';
    document.querySelectorAll('.admin-only').forEach(function(e){e.style.display='';});
  }
})();
      `}} />
    </body>
  </html>
);
