import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer, EmptyState } from '../components/layout';
import { MatchRow, MatchTableHeader } from '../components/match';

type Match = {
  pid: number;
  time: string;
  table_no: number;
  status: string;
  result: string;
  player1: string;
  player2: string;
  event: string;
};

export const SearchPage: FC<{ q: string; matches: Match[] }> = ({ q, matches }) => (
  <Layout title="查询">
    <Nav current="/search" title="赛程查询" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <form method="get" action="/search" class="flex gap-3 mb-8">
          <input
            name="q"
            value={q}
            placeholder="输入选手姓名..."
            class="flex-1 border border-slate-200 rounded-xl px-5 py-3 text-lg focus:ring-2 focus:ring-emerald-500"
            autofocus
          />
          <button
            type="submit"
            class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
          >
            搜索
          </button>
        </form>

        {q && <div class="text-slate-500 mb-4">找到 {matches.length} 场比赛</div>}

        {matches.length > 0 && (
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-sm">
              <MatchTableHeader />
              <tbody class="divide-y divide-slate-100">
                {matches.map((m) => (
                  <MatchRow match={m} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {q && matches.length === 0 && <EmptyState icon="🔍" title="未找到相关比赛" />}
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
