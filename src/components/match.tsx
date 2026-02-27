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

// Progress bar component
export const ProgressBar: FC<{ value: number; max: number; showLabel?: boolean }> = ({
  value,
  max,
  showLabel = true,
}) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div class="flex items-center gap-3">
      <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
          style={`width:${pct}%`}
        ></div>
      </div>
      {showLabel && <span class="text-sm text-slate-500 font-medium w-12 text-right">{pct}%</span>}
    </div>
  );
};

// Table card (for table-status, control-panel)
export const TableCard: FC<{
  no: number;
  status: 'idle' | 'playing' | 'ready';
  match?: { p1: string; p2: string; score1: number; score2: number; event?: string };
}> = ({ no, status, match }) => (
  <div
    class={`rounded-2xl p-5 border-2 transition-all ${
      status === 'playing'
        ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg'
        : status === 'ready'
          ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50'
          : 'border-slate-200 bg-white hover:shadow-md'
    }`}
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-xl font-bold text-slate-800">{no}号台</span>
      <span
        class={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'playing'
            ? 'bg-red-500 text-white'
            : status === 'ready'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-200 text-slate-600'
        }`}
      >
        {status === 'playing' ? '● 比赛中' : status === 'ready' ? '待开始' : '空闲'}
      </span>
    </div>
    {match ? (
      <div>
        {match.event && <div class="text-sm text-slate-500 mb-2">{match.event}</div>}
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium truncate flex-1">{match.p1}</span>
          <span class="font-bold text-lg mx-3 text-slate-800">
            {match.score1}:{match.score2}
          </span>
          <span class="text-sm font-medium truncate flex-1 text-right">{match.p2}</span>
        </div>
      </div>
    ) : (
      <div class="text-center text-slate-400 py-4">
        <div class="text-2xl mb-1 opacity-50">🏓</div>
        <div class="text-sm">暂无比赛</div>
      </div>
    )}
  </div>
);

// Event card (for event-list, results)
export const EventCard: FC<{
  title: string;
  type?: string;
  stage: string;
  playerCount?: number;
  finished: number;
  total: number;
  eventKey: string;
}> = ({ title, type, stage, playerCount, finished, total, eventKey }) => {
  const isComplete = finished === total && total > 0;
  return (
    <div class="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">{title}</h3>
          <div class="flex items-center gap-2">
            {type && <span class="text-sm text-slate-500">{type}</span>}
            <Badge color={stage === 'loop' ? 'blue' : 'yellow'}>{stage === 'loop' ? '循环赛' : '淘汰赛'}</Badge>
            {isComplete && <Badge color="green">已完赛</Badge>}
          </div>
        </div>
        {playerCount !== undefined && (
          <div class="text-right">
            <div class="text-3xl font-bold text-emerald-600">{playerCount}</div>
            <div class="text-sm text-slate-400">参赛人数</div>
          </div>
        )}
      </div>
      <div class="mb-4">
        <div class="flex justify-between text-sm text-slate-500 mb-2">
          <span>
            完成 {finished} / {total} 场
          </span>
        </div>
        <ProgressBar value={finished} max={total} />
      </div>
      <div class="flex gap-3">
        {stage === 'loop' ? (
          <a
            href={`/standings/${eventKey}`}
            class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            📊 积分榜
          </a>
        ) : (
          <a
            href={`/bracket/${eventKey}`}
            class="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            🏆 对阵图
          </a>
        )}
        <a
          href={`/results/${eventKey}`}
          class="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          📋 成绩
        </a>
      </div>
    </div>
  );
};

// Rank badge (1st, 2nd, 3rd)
export const RankBadge: FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1)
    return (
      <span class="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span class="w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span class="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
        3
      </span>
    );
  return <span class="text-slate-400 pl-2">{rank}</span>;
};
