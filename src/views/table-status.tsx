import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer } from '../components/layout';
import { StatCard, StatBox, TableCard } from '../components/match';

type TableStatus = {
  no: number;
  status: 'idle' | 'playing' | 'ready';
  match?: { p1: string; p2: string; score1: number; score2: number; event: string };
};

export const TableStatusPage: FC<{ tables: TableStatus[] }> = ({ tables }) => {
  const playing = tables.filter((t) => t.status === 'playing').length;
  const ready = tables.filter((t) => t.status === 'ready').length;

  return (
    <Layout title="球台状态">
      <Nav current="/tables" title="球台状态" />
      <PageWrapper>
        <div class="grid grid-cols-3 gap-4 mb-8 max-w-lg">
          <StatCard label="比赛中" value={playing} color="red" />
          <StatCard label="待开始" value={ready} color="amber" />
          <StatBox label="空闲" value={tables.length - playing - ready} color="slate" />
        </div>

        <div class="flex items-center justify-between mb-6">
          <span class="text-slate-500">共 {tables.length} 张球台</span>
          <span class="text-sm text-slate-400" id="time"></span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((t) => (
            <TableCard no={t.no} status={t.status} match={t.match} />
          ))}
        </div>
      </PageWrapper>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.getElementById('time').textContent = '更新: ' + new Date().toLocaleTimeString();
        setInterval(function() { location.reload(); }, 30000);
      `,
        }}
      />
    </Layout>
  );
};
