import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge } from '../components/layout';

type EventInfo = {
  key: string; title: string; event: string; plays: number;
  finish: number; progress: string; beg_time: string; end_time: string;
};

export const HomePage: FC<{
  info: string; addr: string; date: string; tables: number; days: number;
  events: EventInfo[];
}> = ({ info, addr, date, tables, days, events }) => (
  <Layout title="首页">
    <Nav current="/" />
    <div class="max-w-6xl mx-auto px-8 py-10 fade-in">
      {/* Hero section */}
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 mb-10">
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 24px 24px;"></div>
        <div class="relative">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-400 text-xs font-medium mb-6 backdrop-blur-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            赛事进行中
          </div>
          <h1 class="text-3xl font-semibold text-white mb-4 tracking-tight">{info || '乒乓球赛事'}</h1>
          <div class="flex flex-wrap gap-6 text-sm text-slate-400">
            {addr && <span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{addr}</span>}
            {date && <span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{date}</span>}
            <span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>{tables} 张球台</span>
            <span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{days} 天</span>
          </div>
        </div>
      </div>

      {/* Events grid */}
      <div class="mb-6">
        <h2 class="text-lg font-medium text-slate-800 mb-1">比赛项目</h2>
        <p class="text-sm text-slate-500">共 {events.length} 个项目</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(ev => (
          <Card hover={true}>
            <div class="flex items-start justify-between mb-4">
              <h3 class="font-medium text-slate-800 text-[15px]">{ev.title}</h3>
              <Badge color={ev.finish === ev.plays && ev.plays > 0 ? 'green' : ev.finish > 0 ? 'yellow' : 'gray'}>
                {ev.finish === ev.plays && ev.plays > 0 ? '已完赛' : ev.finish > 0 ? '进行中' : '未开始'}
              </Badge>
            </div>
            <div class="mb-4">
              <div class="flex justify-between text-xs text-slate-500 mb-2">
                <span>完成 {ev.finish} / {ev.plays} 场</span>
                <span class="font-medium text-slate-700">{ev.progress}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-pp-400 to-pp-500 h-1.5 rounded-full transition-all duration-500" style={`width:${ev.progress}`}></div>
              </div>
            </div>
            <a href={`/results/${ev.key}`} class="inline-flex items-center text-sm text-pp-600 hover:text-pp-700 font-medium group">
              查看成绩
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
          </Card>
        ))}
        {events.length === 0 && (
          <div class="col-span-full">
            <Card hover={false}>
              <div class="text-center py-12 text-slate-400">
                <div class="text-4xl mb-3 opacity-50">🏓</div>
                <p class="text-sm">暂无赛事项目</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  </Layout>
);
