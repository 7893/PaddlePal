import type { FC } from 'hono/jsx';
import { Badge } from './layout';

// Match type used across pages
export type MatchData = {
  pid: number;
  time?: string;
  table_no?: number;
  player1?: string;
  player2?: string;
  event?: string;
  result?: string;
  status?: string;
  scores?: string;
};

// Status badge component
export const StatusBadge: FC<{ status?: string }> = ({ status }) => {
  const map: Record<string, { color: string; text: string }> = {
    playing: { color: 'red', text: '进行中' },
    finished: { color: 'green', text: '已完赛' },
    pending: { color: 'gray', text: '待开始' },
    checkin: { color: 'yellow', text: '检录中' },
  };
  const s = map[status || ''] || map.pending;
  return <Badge color={s.color}>{s.text}</Badge>;
};

// Live match card (for live.tsx, bigscreen.tsx)
export const LiveMatchCard: FC<{ match: MatchData; showLink?: boolean }> = ({ match: m, showLink = true }) => (
  <div class="bg-white rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden ring-2 ring-red-100">
    <div class="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span class="text-white font-medium text-sm">进行中</span>
      </div>
      <span class="text-white/80 text-sm">
        {m.table_no}号台 · {m.time}
      </span>
    </div>
    <div class="p-5">
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1 text-center">
          <div class="text-lg font-bold text-slate-800">{m.player1 || '待定'}</div>
        </div>
        <div class="px-4 text-2xl font-bold text-slate-300">VS</div>
        <div class="flex-1 text-center">
          <div class="text-lg font-bold text-slate-800">{m.player2 || '待定'}</div>
        </div>
      </div>
      {m.scores && <div class="text-center font-mono text-lg text-slate-600 mb-3">{m.scores}</div>}
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-400">{m.event}</span>
        {showLink && (
          <a href={`/score/${m.pid}`} class="text-emerald-600 hover:text-emerald-700 font-medium">
            记分 →
          </a>
        )}
      </div>
    </div>
  </div>
);

// Match row for tables (schedule.tsx, results.tsx)
export const MatchRow: FC<{ match: MatchData; showScore?: boolean }> = ({ match: m, showScore = true }) => {
  const isWinnerLeft = m.result && parseInt(m.result) > parseInt(m.result.split(':')[1] || '0');
  const isWinnerRight = m.result && parseInt(m.result.split(':')[1] || '0') > parseInt(m.result);

  return (
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-5 py-4">
        <a href={`/score/${m.pid}`} class="text-emerald-600 hover:text-emerald-700 font-medium">
          {m.pid}
        </a>
      </td>
      <td class="px-5 py-4 text-slate-600 font-medium">{m.time || '-'}</td>
      <td class="px-5 py-4">
        <span class="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">{m.table_no}号</span>
      </td>
      <td class="px-5 py-4">
        <span class={`font-semibold ${isWinnerLeft ? 'text-emerald-600' : 'text-slate-800'}`}>
          {m.player1 || '待定'}
        </span>
        <span class="text-slate-400 mx-2">vs</span>
        <span class={`font-semibold ${isWinnerRight ? 'text-emerald-600' : 'text-slate-800'}`}>
          {m.player2 || '待定'}
        </span>
      </td>
      <td class="px-5 py-4 text-slate-500">{m.event}</td>
      {showScore && <td class="px-5 py-4 font-mono text-slate-700 font-medium">{m.result || '-'}</td>}
      <td class="px-5 py-4">
        <StatusBadge status={m.status} />
      </td>
    </tr>
  );
};

// Match table header
export const MatchTableHeader: FC<{ showScore?: boolean }> = ({ showScore = true }) => (
  <thead class="bg-slate-50">
    <tr>
      <th class="px-5 py-4 text-left text-slate-600 font-semibold w-20">场次</th>
      <th class="px-5 py-4 text-left text-slate-600 font-semibold w-24">时间</th>
      <th class="px-5 py-4 text-left text-slate-600 font-semibold w-20">球台</th>
      <th class="px-5 py-4 text-left text-slate-600 font-semibold">对阵</th>
      <th class="px-5 py-4 text-left text-slate-600 font-semibold">项目</th>
      {showScore && <th class="px-5 py-4 text-left text-slate-600 font-semibold w-24">比分</th>}
      <th class="px-5 py-4 text-left text-slate-600 font-semibold w-24">状态</th>
    </tr>
  </thead>
);

// Stats card (for home.tsx, admin.tsx, dashboard.tsx)
export const StatCard: FC<{
  label: string;
  value: number | string;
  icon?: string;
  color?: string;
}> = ({ label, value, icon, color = 'emerald' }) => {
  const colors: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    slate: 'from-slate-600 to-slate-700',
  };
  return (
    <div class={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white`}>
      <div class="flex items-center justify-between mb-2">
        <span class="text-white/80 text-sm">{label}</span>
        {icon && <span class="text-2xl opacity-80">{icon}</span>}
      </div>
      <div class="text-3xl font-bold">{value}</div>
    </div>
  );
};

// Simple stat display (for lighter use)
export const StatBox: FC<{ label: string; value: number | string; color?: string }> = ({
  label,
  value,
  color = 'emerald',
}) => {
  const textColors: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    red: 'text-red-500',
    slate: 'text-slate-600',
  };
  return (
    <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
      <div class={`text-3xl font-bold ${textColors[color]}`}>{value}</div>
      <div class="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
};

// Player display
export const PlayerName: FC<{ name?: string; winner?: boolean }> = ({ name, winner }) => (
  <span class={`font-semibold ${winner ? 'text-emerald-600' : 'text-slate-800'}`}>{name || '待定'}</span>
);

// Score display
export const ScoreDisplay: FC<{ result?: string; scores?: string }> = ({ result, scores }) => (
  <div class="text-center">
    {result && <div class="text-2xl font-bold text-slate-800 font-mono">{result}</div>}
    {scores && <div class="text-sm text-slate-500 font-mono mt-1">{scores}</div>}
  </div>
);
