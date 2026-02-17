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
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      {/* Tournament header */}
      <div class="bg-gradient-to-r from-pp-700 to-pp-600 rounded-2xl p-6 text-white mb-6">
        <h1 class="text-2xl font-bold mb-2">{info || '乒乓球赛事'}</h1>
        <div class="flex gap-6 text-sm text-green-100">
          {addr && <span>📍 {addr}</span>}
          {date && <span>📅 {date}</span>}
          <span>🏓 {tables} 张球台</span>
          <span>📆 {days} 天</span>
        </div>
      </div>

      {/* Event cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(ev => (
          <Card>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-800">{ev.title}</h3>
              <Badge color={ev.finish === ev.plays && ev.plays > 0 ? 'green' : ev.finish > 0 ? 'yellow' : 'gray'}>
                {ev.finish === ev.plays && ev.plays > 0 ? '已完赛' : ev.finish > 0 ? '进行中' : '未开始'}
              </Badge>
            </div>
            <div class="mb-3">
              <div class="flex justify-between text-sm text-gray-500 mb-1">
                <span>进度 {ev.finish}/{ev.plays}</span>
                <span>{ev.progress}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-pp-500 h-2 rounded-full transition-all" style={`width:${ev.progress}`}></div>
              </div>
            </div>
            <div class="flex gap-2">
              <a href={`/results/${ev.key}`} class="text-sm text-pp-600 hover:text-pp-700">查看成绩 →</a>
            </div>
          </Card>
        ))}
        {events.length === 0 && (
          <div class="col-span-full text-center py-12 text-gray-400">暂无赛事项目</div>
        )}
      </div>
    </div>
  </Layout>
);
