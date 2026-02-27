import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer } from '../components/layout';
import { StatBox, MatchTableHeader, MatchRow, type MatchData } from '../components/match';

type Match = MatchData & { date: string };

export const SchedulePage: FC<{ matches: Match[]; info: string }> = ({ matches, info: _info }) => {
  const finished = matches.filter((m) => m.status === 'finished').length;
  const playing = matches.filter((m) => m.status === 'playing').length;

  return (
    <Layout title="赛程">
      <Nav current="/schedule" title="赛程安排" />
      <PageWrapper>
        <div class="grid grid-cols-3 gap-4 mb-8">
          <StatBox label="总场次" value={matches.length} color="slate" />
          <StatBox label="已完赛" value={finished} color="emerald" />
          <StatBox label="进行中" value={playing} color="red" />
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table class="w-full text-sm">
            <MatchTableHeader />
            <tbody class="divide-y divide-slate-100">
              {matches.map((m) => (
                <MatchRow match={m} />
              ))}
            </tbody>
          </table>
          {matches.length === 0 && (
            <div class="text-center py-12 text-slate-400">
              <div class="text-4xl mb-3 opacity-50">📅</div>
              <p>暂无赛程安排</p>
            </div>
          )}
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
