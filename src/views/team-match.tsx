import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge } from '../components/layout';

type TeamMatch = {
  id: number; match_order: number; time: string; table_no: number; status: string; result: string;
  team1: string; team2: string; event: string;
  rubbers: { pid: number; p1: string; p2: string; result: string; status: string }[];
};

export const TeamMatchPage: FC<{ event: string; matches: TeamMatch[] }> = ({ event, matches }) => (
  <Layout title={`团体赛 - ${event}`}>
    <Nav current="/schedule" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">🏓 团体赛 · {event}</h2>
      {matches.length === 0 ? <div class="text-gray-400 text-center py-8">暂无团体赛比赛</div> : (
        <div class="space-y-4">
          {matches.map(m => (
            <Card>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="font-bold text-gray-800">{m.team1}</span>
                  <span class="text-gray-300">vs</span>
                  <span class="font-bold text-gray-800">{m.team2}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-gray-700">{m.result || '-'}</span>
                  <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                    {m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行' : '待赛'}
                  </Badge>
                </div>
              </div>
              {m.rubbers.length > 0 && (
                <table class="w-full text-sm">
                  <tbody class="divide-y divide-gray-100">
                    {m.rubbers.map((r, i) => (
                      <tr class="hover:bg-gray-50">
                        <td class="py-1.5 text-gray-400 w-8">{i + 1}</td>
                        <td class="py-1.5"><a href={`/score/${r.pid}`} class="hover:underline">{r.p1} vs {r.p2}</a></td>
                        <td class="py-1.5 font-mono text-right w-16">{r.result || '-'}</td>
                        <td class="py-1.5 w-16 text-right">
                          <Badge color={r.status === 'finished' ? 'green' : 'gray'}>{r.status === 'finished' ? '完' : '待'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  </Layout>
);
